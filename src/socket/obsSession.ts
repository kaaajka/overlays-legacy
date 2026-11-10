export function buildObsSessionUrl(wsUrl: string): string {
  const url = new URL(wsUrl);
  if (url.protocol !== "wss:" || url.username || url.password) {
    throw new Error("Parowanie OBS wymaga bezpiecznego adresu WSS.");
  }
  url.protocol = "https:";
  url.pathname = `${url.pathname.replace(/\/+$/, "")}/obs/session`;
  url.search = "";
  url.hash = "";
  return url.href;
}

export async function pairObsSession(wsUrl: string, code: string): Promise<void> {
  const url = buildObsSessionUrl(wsUrl);
  const options: RequestInit = {
    credentials: "include",
    cache: "no-store",
    redirect: "error",
    referrerPolicy: "no-referrer",
  };
  const pair = await fetch(url, {
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
    signal: AbortSignal.timeout(10000),
  });
  if (pair.status !== 204) throw new Error("Nie przyjęto kodu parowania.");

  const check = await fetch(url, { ...options, signal: AbortSignal.timeout(10000) });
  if (check.status !== 204) throw new Error("Przeglądarka nie zapisała sesji OBS.");
}
