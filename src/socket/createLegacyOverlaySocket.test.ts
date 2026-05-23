import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { debugLog } from "../debug";
import { createLegacyOverlaySocket } from "./createLegacyOverlaySocket";

vi.mock("../debug", () => ({
  debugLog: vi.fn(),
}));

type MockCloseEvent = {
  reason?: string;
};

type MockMessageEvent = {
  isTrusted: boolean;
  data: unknown;
};

class MockWebSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;
  static instances: MockWebSocket[] = [];

  onopen: (() => void) | null = null;
  onclose: ((event: MockCloseEvent) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  onmessage: ((event: MockMessageEvent) => void) | null = null;
  closed = false;
  readyState = MockWebSocket.CONNECTING;
  sentMessages: string[] = [];

  constructor(public readonly url: string) {
    MockWebSocket.instances.push(this);
  }

  open() {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.();
  }

  closeWithReason(reason = "test close") {
    this.closed = true;
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.({ reason });
  }

  error(error: unknown = new Error("socket error")) {
    this.onerror?.(error);
  }

  message(data: unknown, isTrusted = true) {
    this.onmessage?.({ data, isTrusted });
  }

  send(data: string) {
    this.sentMessages.push(data);
  }

  close() {
    this.closed = true;
    this.readyState = MockWebSocket.CLOSED;
  }
}

const installMockWebSocket = () => {
  vi.stubGlobal("WebSocket", MockWebSocket);
};

const latestSocket = () => {
  const socket = MockWebSocket.instances[MockWebSocket.instances.length - 1];

  if (!socket) throw new Error("Expected a mock websocket instance");

  return socket;
};

const latestTimeoutDelay = (timeoutSpy: { mock: { calls: unknown[][] } }) => {
  const latestCall = timeoutSpy.mock.calls[timeoutSpy.mock.calls.length - 1];

  return latestCall?.[1] as number | undefined;
};

describe("createLegacyOverlaySocket", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    MockWebSocket.instances = [];
    installMockWebSocket();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("creates a WebSocket with the given URL when connect is called", () => {
    const controller = createLegacyOverlaySocket({
      url: "wss://example.test/ws/queue?account=uuid",
      label: "queue",
      onMessage: vi.fn(),
    });

    controller.connect();

    expect(MockWebSocket.instances).toHaveLength(1);
    expect(latestSocket().url).toBe("wss://example.test/ws/queue?account=uuid");
  });

  it("does not create multiple active sockets when connect is called repeatedly", () => {
    const controller = createLegacyOverlaySocket({
      url: "wss://example.test/ws/subs?account=uuid",
      label: "subs",
      onMessage: vi.fn(),
    });

    controller.connect();
    controller.connect();
    controller.connect();

    expect(MockWebSocket.instances).toHaveLength(1);
  });

  it("calls onOpen when the socket opens", () => {
    const onOpen = vi.fn();
    const controller = createLegacyOverlaySocket({
      url: "wss://example.test/ws/followers?account=uuid",
      label: "followers",
      onOpen,
      onMessage: vi.fn(),
    });

    controller.connect();
    latestSocket().open();

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("passes raw string message data to onMessage", () => {
    const onMessage = vi.fn();
    const controller = createLegacyOverlaySocket({
      url: "wss://example.test/ws/queue?account=uuid",
      label: "queue",
      onMessage,
    });

    controller.connect();
    latestSocket().message('{"event":"queue","key":"set"}');

    expect(onMessage).toHaveBeenCalledWith('{"event":"queue","key":"set"}');
  });

  it("sends messages through the active open socket", () => {
    const controller = createLegacyOverlaySocket({
      url: "wss://example.test/ws?account=uuid",
      label: "main",
      onMessage: vi.fn(),
    });

    controller.connect();
    latestSocket().open();

    const sent = controller.send('{"type":"acceptAlert"}');

    expect(sent).toBe(true);
    expect(latestSocket().sentMessages).toEqual(['{"type":"acceptAlert"}']);
  });

  it("does not send messages when the socket is not open", () => {
    const controller = createLegacyOverlaySocket({
      url: "wss://example.test/ws?account=uuid",
      label: "main",
      onMessage: vi.fn(),
    });

    controller.connect();

    expect(controller.send('{"type":"acceptAlert"}')).toBe(false);
    expect(latestSocket().sentMessages).toEqual([]);
  });

  it("ignores untrusted and non-string messages", () => {
    const onMessage = vi.fn();
    const controller = createLegacyOverlaySocket({
      url: "wss://example.test/ws/queue?account=uuid",
      label: "queue",
      onMessage,
    });

    controller.connect();
    latestSocket().message('{"event":"queue"}', false);
    latestSocket().message({ event: "queue" });

    expect(onMessage).not.toHaveBeenCalled();
  });

  it("schedules reconnect when the socket closes", () => {
    const timeoutSpy = vi.spyOn(globalThis, "setTimeout");
    const controller = createLegacyOverlaySocket({
      url: "wss://example.test/ws/queue?account=uuid",
      label: "queue",
      onMessage: vi.fn(),
    });

    controller.connect();
    latestSocket().closeWithReason("backend down");

    expect(timeoutSpy).toHaveBeenCalled();
    expect(latestTimeoutDelay(timeoutSpy)).toBe(500);
  });

  it("uses increasing reconnect backoff", () => {
    const timeoutSpy = vi.spyOn(globalThis, "setTimeout");
    const controller = createLegacyOverlaySocket({
      url: "wss://example.test/ws/queue?account=uuid",
      label: "queue",
      maxFailures: 10,
      onMessage: vi.fn(),
    });

    controller.connect();
    latestSocket().closeWithReason("first");
    expect(latestTimeoutDelay(timeoutSpy)).toBe(500);

    vi.advanceTimersByTime(500);
    latestSocket().closeWithReason("second");
    expect(latestTimeoutDelay(timeoutSpy)).toBe(1000);

    vi.advanceTimersByTime(1000);
    latestSocket().closeWithReason("third");
    expect(latestTimeoutDelay(timeoutSpy)).toBe(2000);
  });

  it("caps reconnect delay", () => {
    const timeoutSpy = vi.spyOn(globalThis, "setTimeout");
    const controller = createLegacyOverlaySocket({
      url: "wss://example.test/ws/queue?account=uuid",
      label: "queue",
      maxFailures: 20,
      onMessage: vi.fn(),
    });

    controller.connect();

    for (let i = 0; i < 8; i += 1) {
      latestSocket().closeWithReason(`close ${i}`);
      const delay = Number(latestTimeoutDelay(timeoutSpy));
      vi.advanceTimersByTime(delay);
    }

    expect(Number(latestTimeoutDelay(timeoutSpy))).toBe(10_000);
  });

  it("disconnect closes the socket and prevents reconnect", () => {
    const timeoutSpy = vi.spyOn(globalThis, "setTimeout");
    const controller = createLegacyOverlaySocket({
      url: "wss://example.test/ws/queue?account=uuid",
      label: "queue",
      onMessage: vi.fn(),
    });

    controller.connect();
    const socket = latestSocket();

    controller.disconnect();
    socket.closeWithReason("closed after manual disconnect");
    vi.runOnlyPendingTimers();

    expect(socket.closed).toBe(true);
    expect(MockWebSocket.instances).toHaveLength(1);
    expect(timeoutSpy).not.toHaveBeenCalled();
  });

  it("calls onFailure after maxFailures", () => {
    const onFailure = vi.fn();
    const controller = createLegacyOverlaySocket({
      url: "wss://example.test/ws/queue?account=uuid",
      label: "queue",
      maxFailures: 2,
      onFailure,
      onMessage: vi.fn(),
    });

    controller.connect();
    latestSocket().closeWithReason("first");
    vi.advanceTimersByTime(500);
    latestSocket().closeWithReason("second");

    expect(onFailure).toHaveBeenCalledTimes(1);
  });

  it("stops reconnecting after maxFailures", () => {
    const timeoutSpy = vi.spyOn(globalThis, "setTimeout");
    const controller = createLegacyOverlaySocket({
      url: "wss://example.test/ws/queue?account=uuid",
      label: "queue",
      maxFailures: 2,
      onFailure: vi.fn(),
      onMessage: vi.fn(),
    });

    controller.connect();
    latestSocket().closeWithReason("first");
    expect(latestTimeoutDelay(timeoutSpy)).toBe(500);

    vi.advanceTimersByTime(500);
    latestSocket().closeWithReason("second");
    vi.runOnlyPendingTimers();

    expect(MockWebSocket.instances).toHaveLength(2);
  });

  it("does not throw from socket error handlers", () => {
    const controller = createLegacyOverlaySocket({
      url: "wss://example.test/ws/queue?account=uuid",
      label: "queue",
      onMessage: vi.fn(),
    });

    controller.connect();

    expect(() => latestSocket().error(new Error("boom"))).not.toThrow();
  });

  it("catches message handler exceptions and logs through debugLog", () => {
    const controller = createLegacyOverlaySocket({
      url: "wss://example.test/ws/queue?account=uuid",
      label: "queue",
      onMessage: () => {
        throw new Error("handler failed");
      },
    });

    controller.connect();

    expect(() => latestSocket().message('{"event":"queue"}')).not.toThrow();
    expect(debugLog).toHaveBeenCalledWith(
      "Legacy queue websocket message handler failed",
      expect.any(Error),
    );
  });
});
