import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';

// Cart stored in memory (in production, use session/database)
interface CartItem {
  productId: string;
  variationId?: string;
  quantity: number;
}

let cart: CartItem[] = [];

// GET /api/cart
export async function GET() {
  const cartWithProducts = cart.map(item => {
    const product = store.getProductById(item.productId);
    return {
      ...item,
      product: product ? {
        id: product.id,
        name: product.name,
        price: product.price,
        salePrice: product.salePrice,
        image: product.images[0]?.src,
        stockStatus: product.stockStatus,
      } : null,
      subtotal: product ? (product.salePrice || product.price) * item.quantity : 0,
    };
  }).filter(item => item.product !== null);

  const total = cartWithProducts.reduce((sum, item) => sum + item.subtotal, 0);
  const itemCount = cartWithProducts.reduce((sum, item) => sum + item.quantity, 0);

  return NextResponse.json({
    items: cartWithProducts,
    total,
    itemCount,
  });
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, variationId, quantity = 1 } = body;

    // Check if product exists
    const product = store.getProductById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check stock
    if (product.stockStatus === 'outofstock') {
      return NextResponse.json({ error: 'Product is out of stock' }, { status: 400 });
    }

    // Check if item already in cart
    const existingIndex = cart.findIndex(
      item => item.productId === productId && item.variationId === variationId
    );

    if (existingIndex !== -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({ productId, variationId, quantity });
    }

    return NextResponse.json({ success: true, message: 'Item added to cart' });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

// PUT /api/cart - Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, variationId, quantity } = body;

    const existingIndex = cart.findIndex(
      item => item.productId === productId && item.variationId === variationId
    );

    if (existingIndex === -1) {
      return NextResponse.json({ error: 'Item not found in cart' }, { status: 404 });
    }

    if (quantity <= 0) {
      cart.splice(existingIndex, 1);
    } else {
      cart[existingIndex].quantity = quantity;
    }

    return NextResponse.json({ success: true, message: 'Cart updated' });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

// DELETE /api/cart - Clear cart or remove item
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const productId = searchParams.get('productId');
  const variationId = searchParams.get('variationId');

  if (productId) {
    cart = cart.filter(
      item => !(item.productId === productId && item.variationId === (variationId || undefined))
    );
    return NextResponse.json({ success: true, message: 'Item removed from cart' });
  }

  // Clear entire cart
  cart = [];
  return NextResponse.json({ success: true, message: 'Cart cleared' });
}
