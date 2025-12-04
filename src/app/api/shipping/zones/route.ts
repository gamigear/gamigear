import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';

// GET /api/shipping/zones
export async function GET() {
  const zones = store.getShippingZones();
  return NextResponse.json({ data: zones });
}

// POST /api/shipping/zones
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const zone = store.createShippingZone(body);
    return NextResponse.json(zone, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
