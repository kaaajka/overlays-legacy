// Preview nie może łączyć się z aktywnym backendem kanału.
if (process.env.VERCEL_ENV === "preview") {
  let endpoint;
  try {
    endpoint = new URL(process.env.VITE_WS_URL || "");
  } catch {
    console.error("Preview wymaga jawnego, izolowanego VITE_WS_URL.");
    process.exit(1);
  }
  if (
    endpoint.protocol !== "wss:" ||
    endpoint.hostname === "kaaajka.nedi.me" ||
    endpoint.hostname === "www.kaaajka.nedi.me" ||
    endpoint.username ||
    endpoint.password ||
    endpoint.search ||
    endpoint.hash
  ) {
    console.error("Niedozwolony endpoint Preview. Użyj osobnego backendu testowego bez sekretów w URL.");
    process.exit(1);
  }
}
