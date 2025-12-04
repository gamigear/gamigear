import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';

// GET /api/shipping/methods
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const zoneId = searchParams.get('zone');

  let methods = store.getShippingMethods();

  if (zoneId) {
    methods = methods.filter(m => m.zoneId === zoneId);
  }

  return NextResponse.json({ data: methods });
}

// POST /api/shipping/methods
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const method = store.createShippingMethod(body);
    return NextResponse.json(method, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
