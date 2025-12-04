import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      items,
      billing,
      shipping,
      paymentMethod,
      paymentMethodTitle,
      customerNote,
      couponCode,
      subtotal,
      shippingTotal,
      discountTotal,
      total,
    } = body;

    // Validate required fields
    if (!items || items.length === 0) {
      return NextResponse.json(
        { message: "Không có sản phẩm trong đơn hàng" },
        { status: 400 }
      );
    }

    if (!billing || !billing.firstName || !billing.lastName || !billing.phone || !billing.address1) {
      return NextResponse.json(
        { message: "Vui lòng điền đầy đủ thông tin giao hàng" },
        { status: 400 }
      );
    }

    // Get customer ID if logged in
    let customerId: string | null = null;
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { customerId: string };
        customerId = decoded.customerId;
      } catch {
        // Token invalid, continue as guest
      }
    }

    // Validate products exist and have stock
    const productIds = items.map((item: { productId: string }) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { message: `Sản phẩm "${item.name}" không tồn tại` },
          { status: 400 }
        );
      }
      if (product.manageStock && product.stockQuantity !== null && product.stockQuantity < item.quantity) {
        return NextResponse.json(
          { message: `Sản phẩm "${item.name}" không đủ số lượng trong kho` },
          { status: 400 }
        );
      }
    }

    // Validate coupon if provided
    let appliedDiscount = 0;
    let couponId: string | null = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
      });

      if (coupon) {
        const now = new Date();
        const isValid =
          (!coupon.dateExpires || coupon.dateExpires > now) &&
          (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit) &&
          (!coupon.minimumAmount || subtotal >= coupon.minimumAmount) &&
          (!coupon.maximumAmount || subtotal <= coupon.maximumAmount);

        if (isValid) {
          couponId = coupon.id;
          if (coupon.discountType === "percent") {
            appliedDiscount = (subtotal * coupon.amount) / 100;
          } else {
            appliedDiscount = coupon.amount;
          }
        }
      }
    }

    // Use shipping address or billing address
    const shippingAddr = shipping || billing;

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        status: "pending",
        currency: "VND",
        subtotal,
        discountTotal: appliedDiscount || discountTotal || 0,
        shippingTotal: shippingTotal || 0,
        taxTotal: 0,
        total: total - (appliedDiscount - (discountTotal || 0)),
        customerId,
        customerNote: customerNote || null,
        // Billing
        billingFirstName: billing.firstName,
        billingLastName: billing.lastName,
        billingCompany: billing.company || null,
        billingAddress1: billing.address1,
        billingAddress2: billing.address2 || null,
        billingCity: billing.city,
        billingState: billing.state,
        billingPostcode: billing.postcode || "",
        billingCountry: billing.country || "Việt Nam",
        billingEmail: billing.email || null,
        billingPhone: billing.phone || null,
        // Shipping
        shippingFirstName: shippingAddr.firstName,
        shippingLastName: shippingAddr.lastName,
        shippingCompany: shippingAddr.company || null,
        shippingAddress1: shippingAddr.address1,
        shippingAddress2: shippingAddr.address2 || null,
        shippingCity: shippingAddr.city,
        shippingState: shippingAddr.state,
        shippingPostcode: shippingAddr.postcode || "",
        shippingCountry: shippingAddr.country || "Việt Nam",
        // Payment
        paymentMethod,
        paymentMethodTitle: paymentMethodTitle || paymentMethod,
        // Items
        items: {
          create: items.map((item: {
            productId: string;
            name: string;
            quantity: number;
            price: number;
            sku?: string;
            image?: string;
          }) => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity,
            total: item.price * item.quantity,
            sku: item.sku || null,
            image: item.image || null,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Update coupon usage
    if (couponId) {
      await prisma.coupon.update({
        where: { id: couponId },
        data: { usageCount: { increment: 1 } },
      });

      await prisma.orderCoupon.create({
        data: {
          orderId: order.id,
          couponId,
          code: couponCode!,
          discount: appliedDiscount,
        },
      });
    }

    // Update product stock
    for (const item of items) {
      const product = productMap.get(item.productId);
      if (product?.manageStock && product.stockQuantity !== null) {
        const newQuantity = product.stockQuantity - item.quantity;
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: newQuantity,
            stockStatus: newQuantity <= 0 ? "outofstock" : newQuantity <= (product.lowStockAmount || 5) ? "onbackorder" : "instock",
          },
        });

        // Log inventory change
        await prisma.inventoryLog.create({
          data: {
            productId: item.productId,
            type: "sale",
            quantityChange: -item.quantity,
            previousQuantity: product.stockQuantity,
            newQuantity,
            orderId: order.id,
            note: `Đơn hàng ${order.orderNumber}`,
          },
        });
      }
    }

    // Update customer stats if logged in
    if (customerId) {
      await prisma.customer.update({
        where: { id: customerId },
        data: {
          ordersCount: { increment: 1 },
          totalSpent: { increment: order.total },
          isPayingCustomer: true,
        },
      });
    }

    // Add order note
    await prisma.orderNote.create({
      data: {
        orderId: order.id,
        content: "Đơn hàng đã được tạo",
        isCustomerNote: false,
      },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
      },
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi khi đặt hàng" },
      { status: 500 }
    );
  }
}
