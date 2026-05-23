import { debugLog } from "../debug";

export function safeJsonParse(value: string): unknown | null {
  try {
    return JSON.parse(value);
  } catch (error) {
    debugLog("Ignored invalid legacy websocket JSON payload", error);
    return null;
  }
}
