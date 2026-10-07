import { NextRequest } from 'next/server';
import { addSSEClient, removeSSEClient } from '@/lib/sse/broadcaster';
import { getAllOrders, getMenuItems } from '@/lib/db/store';
import { SSEMessage } from '@/types/cafe';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  let clientController: ReadableStreamDefaultController<Uint8Array> | null = null;
  let keepAliveTimer: NodeJS.Timeout | null = null;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      clientController = controller;
      addSSEClient(controller);

      // Send initial data to client
      const initialMessage: SSEMessage = {
        type: 'INIT',
        data: {
          orders: getAllOrders(),
          menuItems: getMenuItems(),
        },
        timestamp: new Date().toISOString(),
      };

      const text = `data: ${JSON.stringify(initialMessage)}\n\n`;
      controller.enqueue(new TextEncoder().encode(text));

      // Keepalive heartbeat every 15 seconds to prevent browser/proxy timeouts
      keepAliveTimer = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(': keepalive\n\n'));
        } catch {
          if (keepAliveTimer) clearInterval(keepAliveTimer);
        }
      }, 15000);
    },
    cancel() {
      if (keepAliveTimer) clearInterval(keepAliveTimer);
      if (clientController) {
        removeSSEClient(clientController);
      }
    },
  });

  req.signal.addEventListener('abort', () => {
    if (keepAliveTimer) clearInterval(keepAliveTimer);
    if (clientController) {
      removeSSEClient(clientController);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
