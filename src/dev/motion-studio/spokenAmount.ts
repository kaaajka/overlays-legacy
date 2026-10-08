const units = [
  "",
  "jeden",
  "dwa",
  "trzy",
  "cztery",
  "pięć",
  "sześć",
  "siedem",
  "osiem",
  "dziewięć",
];
const teens = [
  "dziesięć",
  "jedenaście",
  "dwanaście",
  "trzynaście",
  "czternaście",
  "piętnaście",
  "szesnaście",
  "siedemnaście",
  "osiemnaście",
  "dziewiętnaście",
];
const tens = [
  "",
  "",
  "dwadzieścia",
  "trzydzieści",
  "czterdzieści",
  "pięćdziesiąt",
  "sześćdziesiąt",
  "siedemdziesiąt",
  "osiemdziesiąt",
  "dziewięćdziesiąt",
];
const hundreds = [
  "",
  "sto",
  "dwieście",
  "trzysta",
  "czterysta",
  "pięćset",
  "sześćset",
  "siedemset",
  "osiemset",
  "dziewięćset",
];
export function plural(n: number, forms: [string, string, string]): string {
  return forms[
    n === 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && !(n % 100 >= 12 && n % 100 <= 14) ? 1 : 2
  ];
}
export function polishInteger(n: number): string {
  if (!Number.isSafeInteger(n) || n < 0) throw Error("Nieprawidłowa liczba");
  if (n === 0) return "zero";
  const groups: [string, string, string][] = [
    ["", "", ""],
    ["tysiąc", "tysiące", "tysięcy"],
    ["milion", "miliony", "milionów"],
    ["miliard", "miliardy", "miliardów"],
    ["bilion", "biliony", "bilionów"],
    ["biliard", "biliardy", "biliardów"],
  ];
  const result: string[] = [];
  for (let index = 0; n > 0; index++, n = Math.floor(n / 1000)) {
    const group = n % 1000;
    if (!group) continue;
    const parts = [hundreds[Math.floor(group / 100)]];
    const rest = group % 100;
    if (rest >= 10 && rest < 20) parts.push(teens[rest - 10]);
    else parts.push(tens[Math.floor(rest / 10)], units[rest % 10]);
    const words = parts.filter(Boolean).join(" ");
    result.unshift(
      index ? `${group === 1 ? "" : `${words} `}${plural(group, groups[index])}` : words,
    );
  }
  return result.join(" ");
}
export function spokenAmount(cents: number): string {
  if (!Number.isSafeInteger(cents)) throw Error("Nieprawidłowa kwota");
  const value = Math.abs(cents),
    zl = Math.floor(value / 100),
    gr = value % 100;
  return `${cents < 0 ? "minus " : ""}${polishInteger(zl)} ${plural(zl, ["złoty", "złote", "złotych"])}${gr ? `, ${polishInteger(gr)} ${plural(gr, ["grosz", "grosze", "groszy"])}` : ""}`;
}
export function speechSafeText(text: string): string {
  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .normalize("NFC");
}
