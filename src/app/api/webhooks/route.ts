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
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

// Helper function to trigger webhooks (used internally)
export async function triggerWebhook(topic: string, payload: any) {
  const webhooks = store.getWebhooks().filter(w => 
    w.status === 'active' && w.topic === topic
  );

  for (const webhook of webhooks) {
    try {
      // Generate signature
      const signature = crypto
        .createHmac('sha256', webhook.secret)
        .update(JSON.stringify(payload))
        .digest('base64');

      const response = await fetch(webhook.deliveryUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WC-Webhook-Topic': topic,
          'X-WC-Webhook-Signature': signature,
          'X-WC-Webhook-ID': webhook.id,
        },
        body: JSON.stringify(payload),
      });

      // Update webhook delivery status
      store.updateWebhook(webhook.id, {
        lastDelivery: {
          date: new Date().toISOString(),
          success: response.ok,
          responseCode: response.status,
        },
        failureCount: response.ok ? 0 : webhook.failureCount + 1,
      });

      // Disable webhook after too many failures
      if (!response.ok && webhook.failureCount >= 5) {
        store.updateWebhook(webhook.id, { status: 'disabled' });
      }
    } catch (error) {
      store.updateWebhook(webhook.id, {
        lastDelivery: {
          date: new Date().toISOString(),
          success: false,
        },
        failureCount: webhook.failureCount + 1,
      });
    }
  }
}
