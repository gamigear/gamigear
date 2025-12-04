import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';

// GET /api/shipping/zones/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const zone = store.getShippingZoneById(id);

  if (!zone) {
    return NextResponse.json({ error: 'Shipping zone not found' }, { status: 404 });
  }

  return NextResponse.json(zone);
}

// PUT /api/shipping/zones/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const zone = store.updateShippingZone(id, body);

    if (!zone) {
      return NextResponse.json({ error: 'Shipping zone not found' }, { status: 404 });
    }

    return NextResponse.json(zone);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

// DELETE /api/shipping/zones/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = store.deleteShippingZone(id);

  if (!deleted) {
    return NextResponse.json({ error: 'Shipping zone not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
