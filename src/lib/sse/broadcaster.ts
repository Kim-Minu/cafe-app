import { SSEEventType, SSEMessage } from '@/types/cafe';

type ClientController = ReadableStreamDefaultController<Uint8Array>;

interface SSEBroadcasterState {
  clients: Set<ClientController>;
}

declare global {
  // eslint-disable-next-line no-var
  var __sseBroadcaster: SSEBroadcasterState | undefined;
}

if (!globalThis.__sseBroadcaster) {
  globalThis.__sseBroadcaster = {
    clients: new Set<ClientController>(),
  };
}

const broadcasterState = globalThis.__sseBroadcaster;

export function addSSEClient(controller: ClientController) {
  broadcasterState.clients.add(controller);
}

export function removeSSEClient(controller: ClientController) {
  broadcasterState.clients.delete(controller);
}

export function broadcastSSE(type: SSEEventType, data: any) {
  const message: SSEMessage = {
    type,
    data,
    timestamp: new Date().toISOString(),
  };

  const text = `data: ${JSON.stringify(message)}\n\n`;
  const encoded = new TextEncoder().encode(text);

  for (const client of broadcasterState.clients) {
    try {
      client.enqueue(encoded);
    } catch (err) {
      // Stream might be closed
      broadcasterState.clients.delete(client);
    }
  }
}
