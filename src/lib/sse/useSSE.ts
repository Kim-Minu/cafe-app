'use client';

import { useEffect, useRef } from 'react';
import { SSEMessage } from '@/types/cafe';

interface UseSSEOptions {
  onMessage: (message: SSEMessage) => void;
  enabled?: boolean;
}

export function useSSE({ onMessage, enabled = true }: UseSSEOptions) {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let isMounted = true;

    function connect() {
      if (!isMounted) return;
      try {
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }

        eventSource = new EventSource('/api/sse/orders');

        eventSource.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data: SSEMessage = JSON.parse(event.data);
            onMessageRef.current(data);
          } catch (err) {
            console.error('Failed to parse SSE payload', err);
          }
        };

        eventSource.onerror = () => {
          if (!isMounted) return;
          // Native EventSource automatically handles reconnection when readyState is CONNECTING.
          // Only if explicitly CLOSED do we schedule a reconnection with a 5s backoff.
          if (eventSource && eventSource.readyState === EventSource.CLOSED) {
            eventSource.close();
            eventSource = null;
            if (!reconnectTimeout) {
              reconnectTimeout = setTimeout(() => {
                reconnectTimeout = null;
                connect();
              }, 5000);
            }
          }
        };
      } catch (err) {
        console.error('SSE connection error:', err);
      }
    }

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    };
  }, [enabled]);
}
