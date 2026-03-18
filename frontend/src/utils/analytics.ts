import apiClient from '../api/client';

type EventType =
  | 'page_view'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'checkout_start'
  | 'payment_initiated'
  | 'purchase_complete';

interface EventData {
  product_id?: number;
  order_id?: string;
  metadata?: Record<string, unknown>;
}

export function trackEvent(eventType: EventType, data?: EventData): void {
  apiClient
    .post('/analytics/events/', {
      event_type: eventType,
      ...data,
    })
    .catch(() => {});
}
