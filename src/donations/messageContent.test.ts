import { expect, it } from "vitest";
import { messageContent, tipplyEmotes } from "./messageContent";
import { createDonateEventModelFromArgs } from "./createDonateEventModelFromArgs";
it("uses actual img metadata while leaving unproven plain shortcodes as complete text", () => {
  expect(messageContent("emojiBubbly xdd").runs).toEqual([
    { text: "emojiBubbly" },
    { text: " " },
    { text: "xdd" },
  ]);
  const result = messageContent(
    `Hej <img alt='xdd' src='${tipplyEmotes.xdd}' onerror='alert(1)'>!`,
  );
  expect(result.text).toBe("Hej xdd!");
  expect(result.runs[1]).toEqual({ alt: "xdd", src: tipplyEmotes.xdd });
  expect(
    messageContent("emojiBubbly xdd", tipplyEmotes).runs.filter((run) => "src" in run),
  ).toHaveLength(2);
});
it("rejects unsafe URLs and preserves semantic alt/text without injecting markup", () => {
  for (const src of [
    "javascript:alert(1)",
    "data:image/svg+xml,attack",
    "https://evil.test/x.png",
    "https://cdn.7tv.app.evil.test/emote/A/1x.png",
  ]) {
    const result = messageContent(`<img src="${src}" alt="xdd"> <script>alert(1)</script>`);
    expect(result.runs.every((run) => "text" in run)).toBe(true);
    expect(result.text).toBe("xdd <script>alert(1)</script>");
  }
});
it("does not truncate defensive over-limit content and never copies email into the model", () => {
  const event = createDonateEventModelFromArgs(
    {
      id: "fixture",
      nickname: "A".repeat(32),
      message: "M".repeat(225),
      email: "private@example.test",
    },
    { fallbackId: "fixture" },
  );
  expect(event.nickname.length).toBe(32);
  expect(event.message.length).toBe(225);
  expect(JSON.stringify(event)).not.toContain("private@example.test");
  expect(messageContent("M".repeat(4000)).text.length).toBe(4000);
});
