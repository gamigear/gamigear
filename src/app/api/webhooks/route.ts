import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import crypto from 'crypto';

// GET /api/webhooks
export async function GET() {
  const webhooks = store.getWebhooks();
  return NextResponse.json({ data: webhooks });
}

// POST /api/webhooks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Generate secret for webhook
    const secret = crypto.randomBytes(32).toString('hex');
    
    const webhook = store.createWebhook({
      ...body,
      secret,
      status: 'active',
      failureCount: 0,
      apiVersion: '1.0',
    });
    
    return NextResponse.json(webhook, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
