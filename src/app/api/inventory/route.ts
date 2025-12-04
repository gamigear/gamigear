import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/inventory
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '20');
    const status = searchParams.get('status'); // instock, outofstock, lowstock
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {
      manageStock: true,
    };

    if (status === 'outofstock') {
      where.stockStatus = 'outofstock';
    } else if (status === 'lowstock') {
      where.stockQuantity = { lte: 10, gt: 0 };
    } else if (status === 'instock') {
      where.stockStatus = 'instock';
      where.stockQuantity = { gt: 10 };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.product.count({ where });
    const totalPages = Math.ceil(total / perPage);
    const skip = (page - 1) * perPage;

    // Get products with inventory info
    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        sku: true,
        stockQuantity: true,
        stockStatus: true,
        lowStockAmount: true,
        manageStock: true,
        backorders: true,
        images: {
          take: 1,
          orderBy: { position: 'asc' },
        },
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          take: 1,
        },
      },
      orderBy: [
        { stockQuantity: 'asc' },
        { name: 'asc' },
      ],
      skip,
      take: perPage,
    });

    // Transform data
    const transformedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      stockQuantity: product.stockQuantity,
      stockStatus: product.stockStatus,
      lowStockAmount: product.lowStockAmount || 10,
      manageStock: product.manageStock,
      backorders: product.backorders,
      image: product.images[0]?.src || null,
      brand: product.brand,
      category: product.categories[0]?.category || null,
      isLowStock: product.stockQuantity !== null && product.stockQuantity <= (product.lowStockAmount || 10) && product.stockQuantity > 0,
      isOutOfStock: product.stockStatus === 'outofstock' || product.stockQuantity === 0,
    }));

    // Get summary stats
    const [totalProducts, lowStockCount, outOfStockCount] = await Promise.all([
      prisma.product.count({ where: { manageStock: true } }),
      prisma.product.count({
        where: {
          manageStock: true,
          stockQuantity: { lte: 10, gt: 0 },
        },
      }),
      prisma.product.count({
        where: {
          OR: [
            { stockStatus: 'outofstock' },
            { stockQuantity: 0 },
          ],
        },
      }),
    ]);

    return NextResponse.json({
      data: transformedProducts,
      meta: {
        total,
        page,
        perPage,
        totalPages,
      },
      summary: {
        totalProducts,
        lowStockCount,
        outOfStockCount,
        inStockCount: totalProducts - lowStockCount - outOfStockCount,
      },
    });
  } catch (error) {
    console.error('Inventory API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}

// POST /api/inventory - Update stock for a product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, type, quantity, note } = body;

    if (!productId || !type || quantity === undefined) {
      return NextResponse.json(
        { error: 'Product ID, type, and quantity are required' },
        { status: 400 }
      );
    }

    // Get current product
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        stockQuantity: true,
        manageStock: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (!product.manageStock) {
      return NextResponse.json(
        { error: 'Stock management is not enabled for this product' },
        { status: 400 }
      );
    }

    const previousQuantity = product.stockQuantity || 0;
    let newQuantity: number;
    let quantityChange: number;

    switch (type) {
      case 'set':
        newQuantity = quantity;
        quantityChange = quantity - previousQuantity;
        break;
      case 'add':
        newQuantity = previousQuantity + quantity;
        quantityChange = quantity;
        break;
      case 'subtract':
        newQuantity = Math.max(0, previousQuantity - quantity);
        quantityChange = -Math.min(quantity, previousQuantity);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid type. Use set, add, or subtract' },
          { status: 400 }
        );
    }

    // Update product stock
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        stockQuantity: newQuantity,
        stockStatus: newQuantity <= 0 ? 'outofstock' : 'instock',
      },
    });

    // Create inventory log
    await prisma.inventoryLog.create({
      data: {
        productId,
        type,
        quantityChange,
        previousQuantity,
        newQuantity,
        note,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'inventory_updated',
        objectType: 'product',
        objectId: productId,
        details: JSON.stringify({
          name: product.name,
          type,
          previousQuantity,
          newQuantity,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      product: {
        id: updatedProduct.id,
        stockQuantity: updatedProduct.stockQuantity,
        stockStatus: updatedProduct.stockStatus,
      },
      change: {
        type,
        previousQuantity,
        newQuantity,
        quantityChange,
      },
    });
  } catch (error) {
    console.error('Update inventory error:', error);
    return NextResponse.json(
      { error: 'Failed to update inventory' },
      { status: 500 }
    );
  }
}
