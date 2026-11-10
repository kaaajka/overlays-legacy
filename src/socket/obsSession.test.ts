import { afterEach, describe, expect, it, vi } from "vitest";
import { buildObsSessionUrl, pairObsSession } from "./obsSession";

const wsUrl = "wss://socket.example/ws";

afterEach(() => vi.unstubAllGlobals());

describe("Sesja OBS", () => {
  it("Buduje adres HTTPS bez parametrów i odrzuca niebezpieczne źródła", () => {
    expect(buildObsSessionUrl(`${wsUrl}/?unused=fixture#anchor`)).toBe(
      "https://socket.example/ws/obs/session",
    );
    expect(() => buildObsSessionUrl("ws://socket.example/ws")).toThrow();
    expect(() => buildObsSessionUrl("wss://a:b@socket.example/ws")).toThrow();
  });

  it("Wymienia kod w treści żądania i weryfikuje wysłanie ciasteczka", async () => {
    const fetch = vi.fn().mockResolvedValue({ status: 204 });
    vi.stubGlobal("fetch", fetch);
    await pairObsSession(wsUrl, "fixture");
    expect(fetch).toHaveBeenNthCalledWith(1, buildObsSessionUrl(wsUrl), {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      redirect: "error",
      referrerPolicy: "no-referrer",
      headers: { "Content-Type": "application/json" },
      body: '{"code":"fixture"}',
      signal: expect.any(AbortSignal),
    });
    expect(fetch).toHaveBeenNthCalledWith(2, buildObsSessionUrl(wsUrl), {
      credentials: "include",
      cache: "no-store",
      redirect: "error",
      referrerPolicy: "no-referrer",
      signal: expect.any(AbortSignal),
    });
  });

  it("Wykrywa niedostępną usługę lub brak ciasteczka", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({ status: 404 })
      .mockResolvedValueOnce({ status: 204 })
      .mockResolvedValueOnce({ status: 401 });
    vi.stubGlobal("fetch", fetch);
    await expect(pairObsSession(wsUrl, "fixture")).rejects.toThrow("Nie przyjęto kodu");
    expect(fetch).toHaveBeenCalledTimes(1);
    await expect(pairObsSession(wsUrl, "fixture")).rejects.toThrow("nie zapisała sesji");
  });
});
