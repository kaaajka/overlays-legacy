import { debugLog } from '../debug';

export type LegacyOverlaySocketOptions = {
  url: string;
  label: string;
  maxFailures?: number;
  onOpen?: () => void;
  onClose?: () => void;
  onMessage: (data: string) => void;
  onFailure?: () => void;
};

export type LegacyOverlaySocketController = {
  connect: () => void;
  disconnect: () => void;
};

const INITIAL_RECONNECT_DELAY_MS = 250;
const MAX_RECONNECT_DELAY_MS = 10_000;
const DEFAULT_MAX_FAILURES = 5;

export function createLegacyOverlaySocket(
  options: LegacyOverlaySocketOptions,
): LegacyOverlaySocketController {
  let socket: WebSocket | undefined;
  let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
  let reconnectDelayMs = INITIAL_RECONNECT_DELAY_MS;
  let failedConnectionAttempts = 0;
  let stopped = false;

  const clearReconnectTimer = () => {
    if (!reconnectTimer) return;

    clearTimeout(reconnectTimer);
    reconnectTimer = undefined;
  };

  const closeActiveSocket = () => {
    if (!socket) return;

    socket.onopen = null;
    socket.onerror = null;
    socket.onclose = null;
    socket.onmessage = null;
    socket.close();
    socket = undefined;
  };

  const connect = () => {
    if (stopped) stopped = false;

    clearReconnectTimer();
    closeActiveSocket();

    try {
      socket = new WebSocket(options.url);
    } catch (error) {
      debugLog(`Legacy ${options.label} websocket could not be created`, error);
      failedConnectionAttempts += 1;
      scheduleReconnectOrFail();
      return;
    }

    const currentSocket = socket;

    currentSocket.onopen = () => {
      debugLog(`connected websocket ${options.label} component`);

      failedConnectionAttempts = 0;
      reconnectDelayMs = INITIAL_RECONNECT_DELAY_MS;

      options.onOpen?.();
    };

    currentSocket.onerror = (error) => {
      debugLog(`Legacy ${options.label} websocket error. Closing socket.`, error);

      try {
        currentSocket.close();
      } catch (closeError) {
        debugLog(`Legacy ${options.label} websocket close after error failed`, closeError);
      }
    };

    currentSocket.onclose = (event) => {
      if (socket === currentSocket) socket = undefined;
      if (stopped) return;

      failedConnectionAttempts += 1;

      try {
        options.onClose?.();
      } catch (error) {
        debugLog(`Legacy ${options.label} websocket onClose callback failed`, error);
      }

      scheduleReconnectOrFail(event.reason);
    };

    currentSocket.onmessage = ({ isTrusted, data }) => {
      if (!isTrusted || typeof data !== 'string') return;

      try {
        options.onMessage(data);
      } catch (error) {
        debugLog(`Legacy ${options.label} websocket message handler failed`, error);
      }
    };
  };

  const scheduleReconnectOrFail = (reason?: string) => {
    if (stopped) return;

    const maxFailures = options.maxFailures ?? DEFAULT_MAX_FAILURES;

    if (failedConnectionAttempts >= maxFailures) {
      debugLog(
        `Legacy ${options.label} websocket failed repeatedly. Showing unavailable overlay.`,
        reason,
      );
      stopped = true;
      clearReconnectTimer();
      options.onFailure?.();
      return;
    }

    const nextDelayMs = Math.min(MAX_RECONNECT_DELAY_MS, reconnectDelayMs * 2);

    debugLog(
      `Socket is closed. Reconnect will be attempted in ${nextDelayMs / 1000} second.`,
      reason,
    );

    reconnectDelayMs = nextDelayMs;
    reconnectTimer = setTimeout(connect, nextDelayMs);
  };

  const disconnect = () => {
    stopped = true;
    clearReconnectTimer();
    closeActiveSocket();
  };

  return { connect, disconnect };
}
