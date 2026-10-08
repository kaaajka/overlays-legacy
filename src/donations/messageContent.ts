export type MessageRun = { text: string } | { alt: string; src: string };
// Two exact names/URLs in the owner's Tipply picker evidence. No global 7TV lookup.
export const tipplyEmotes = {
  xdd: "https://cdn.7tv.app/emote/01FF3R5C30000FF5VVCKV49G6J/1x.png",
  emojiBubbly: "https://cdn.7tv.app/emote/01K3KGAFSM7TFE888F2Z8YMEKZ/1x.gif",
};
const source = /^https:\/\/cdn\.7tv\.app\/emote\/[A-Za-z0-9]+\/[1-4]x\.(?:png|gif|webp)$/;
const decodeEntities = (value: string) =>
  value.replace(
    /&(?:amp|lt|gt|quot|apos|#39);/g,
    (entity) =>
      ({ "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&apos;": "'", "&#39;": "'" })[
        entity
      ],
  );
/** Parse metadata, never markup. React renders only text and vetted image attributes. */
export function messageContent(
  input: string,
  emotes: Record<string, string> = {},
): { text: string; runs: MessageRun[] } {
  const runs: MessageRun[] = [];
  const textRun = (text: string) => {
    for (const piece of decodeEntities(text).split(/(\b(?:xdd|emojiBubbly)\b)/g)) {
      if (Object.hasOwn(emotes, piece) && source.test(emotes[piece]))
        runs.push({ alt: piece, src: emotes[piece] });
      else if (piece) runs.push({ text: piece });
    }
  };
  let previous = 0;
  for (const match of input.matchAll(/<img\b[^>]*>/gi)) {
    textRun(input.slice(previous, match.index));
    const attrs = Object.fromEntries(
      Array.from(match[0].matchAll(/\b(src|alt)\s*=\s*(["'])(.*?)\2/gi), (attribute) => [
        attribute[1].toLowerCase(),
        decodeEntities(attribute[3]),
      ]),
    );
    if (attrs.alt && source.test(attrs.src ?? "")) runs.push({ alt: attrs.alt, src: attrs.src });
    else if (attrs.alt) runs.push({ text: attrs.alt });
    previous = match.index + match[0].length;
  }
  textRun(input.slice(previous));
  return { runs, text: runs.map((run) => ("text" in run ? run.text : run.alt)).join("") };
}
