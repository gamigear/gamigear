import { store } from '@/lib/db/store';
import crypto from 'crypto';

// Helper function to trigger webhooks (used internally)
export async function triggerWebhook(topic: string, payload: unknown) {
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
    } catch {
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
