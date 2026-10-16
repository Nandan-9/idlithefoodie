/**
 * Turns a hotel's free-text `hours` ("Daily 4 PM – 1 AM",
 * "Mon–Sat 11 AM – 3 PM, 7 PM – 11 PM; Sun 12 PM – 10 PM", "Open 24 hours")
 * into an open/closed status. Returns null when the text can't be read, so
 * callers can fall back to showing it verbatim.
 */

export type OpenStatus = {
  open: boolean;
  /** True when open and closing within the hour. */
  closingSoon: boolean;
  /** "Closes 1 AM", "Opens at 4 PM", "Opens tomorrow 11 AM", "Open 24 hours". */
  detail: string;
};

type Interval = { days: Set<number>; start: number; end: number };

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_PREFIX: Record<string, number> = {
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
};
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

const TIME = String.raw`(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?|noon|midnight`;
const RANGE = new RegExp(`(${TIME})\\s*(?:-|to)\\s*(${TIME})`, "g");
const DAY_WORD = /\b(sun|mon|tue|wed|thu|fri|sat)[a-z]*\.?/g;

type Clock = { minutes: number; meridiem: "am" | "pm" | null };

function parseTime(raw: string): Clock | null {
  const t = raw.trim();
  if (t === "noon") return { minutes: 12 * 60, meridiem: "pm" };
  if (t === "midnight") return { minutes: 0, meridiem: "am" };
  const m = t.match(/^(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = m[2] ? Number(m[2]) : 0;
  if (h > 24 || min > 59) return null;
  const meridiem = m[3] ? (m[3].startsWith("a") ? "am" : "pm") : null;
  return { minutes: h * 60 + min, meridiem };
}

function to24(c: Clock, meridiem: "am" | "pm" | null): number {
  if (!meridiem) return c.minutes % (24 * 60);
  const h = Math.floor(c.minutes / 60) % 12;
  return (h + (meridiem === "pm" ? 12 : 0)) * 60 + (c.minutes % 60);
}

function parseDays(text: string): Set<number> | null {
  if (/daily|every\s*day|all\s*days|7\s*days/.test(text)) return new Set(ALL_DAYS);
  if (/weekdays?/.test(text)) return new Set([1, 2, 3, 4, 5]);
  if (/weekends?/.test(text)) return new Set([0, 6]);

  const days = new Set<number>();
  const words = [...text.matchAll(DAY_WORD)];
  if (words.length === 0) return null;
  for (let i = 0; i < words.length; i++) {
    const day = DAY_PREFIX[words[i][1]];
    const next = words[i + 1];
    const between = next ? text.slice(words[i].index! + words[i][0].length, next.index) : "";
    if (next && /^\s*(-|to)\s*$/.test(between)) {
      // A range like Mon–Sat, wrapping past Sunday if needed.
      const last = DAY_PREFIX[next[1]];
      for (let d = day; ; d = (d + 1) % 7) {
        days.add(d);
        if (d === last) break;
      }
      i++;
    } else {
      days.add(day);
    }
  }
  return days;
}

function parseHours(hours: string): Interval[] | "always" | null {
  const text = hours.toLowerCase().replace(/[–—−]/g, "-");
  if (/24\s*(hours|hrs|x\s*7|\/\s*7)/.test(text)) return "always";

  const intervals: Interval[] = [];
  let days: Set<number> | null = null;
  let cursor = 0;
  for (const m of text.matchAll(RANGE)) {
    const prefix = text.slice(cursor, m.index);
    days = parseDays(prefix) ?? days ?? new Set(ALL_DAYS);
    cursor = m.index! + m[0].length;

    const a = parseTime(m[1]);
    const b = parseTime(m[5]);
    if (!a || !b) continue;
    const end = to24(b, b.meridiem);
    // "4-11 PM" borrows the closing meridiem; "11-3 PM" means 11 AM.
    let start = to24(a, a.meridiem ?? b.meridiem);
    if (!a.meridiem && b.meridiem === "pm" && start >= end) start = to24(a, "am");
    intervals.push({ days, start, end: end === 0 ? 24 * 60 : end });
  }
  return intervals.length > 0 ? intervals : null;
}

function formatClock(minutes: number): string {
  const m = minutes % (24 * 60);
  if (m === 0) return "midnight";
  const h = Math.floor(m / 60);
  const mm = m % 60;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}${mm ? `:${String(mm).padStart(2, "0")}` : ""} ${h < 12 ? "AM" : "PM"}`;
}

/** Minute-of-week spans [from, to) for every interval, with overnight hours spilling into the next day. */
function weeklySpans(intervals: Interval[]): [number, number][] {
  const DAY = 24 * 60;
  const spans: [number, number][] = [];
  for (const iv of intervals) {
    const length = iv.end > iv.start ? iv.end - iv.start : DAY - iv.start + iv.end;
    for (const d of iv.days) spans.push([d * DAY + iv.start, d * DAY + iv.start + length]);
  }
  return spans;
}

export function openStatus(hours: string | null | undefined, now = new Date()): OpenStatus | null {
  if (!hours?.trim()) return null;
  const parsed = parseHours(hours);
  if (parsed === null) return null;
  if (parsed === "always") return { open: true, closingSoon: false, detail: "Open 24 hours" };

  const DAY = 24 * 60;
  const WEEK = 7 * DAY;
  const nowMin = now.getDay() * DAY + now.getHours() * 60 + now.getMinutes();
  const spans = weeklySpans(parsed);

  // Check this week's and last week's spans so Saturday-night hours cover early Sunday.
  const current = spans
    .flatMap(([a, b]) => [[a, b], [a - WEEK, b - WEEK]] as [number, number][])
    .filter(([a, b]) => nowMin >= a && nowMin < b)
    .sort((x, y) => y[1] - x[1])[0];
  if (current) {
    const closesIn = current[1] - nowMin;
    if (closesIn >= WEEK - 1) return { open: true, closingSoon: false, detail: "Open 24 hours" };
    return {
      open: true,
      closingSoon: closesIn <= 60,
      detail: `Closes ${formatClock(current[1])}`,
    };
  }

  const next = spans
    .map(([a]) => (a > nowMin ? a : a + WEEK))
    .sort((x, y) => x - y)[0];
  const dayOffset = Math.floor(next / DAY) - Math.floor(nowMin / DAY);
  const at = formatClock(next);
  const detail =
    dayOffset === 0
      ? `Opens at ${at}`
      : dayOffset === 1
        ? `Opens tomorrow ${at}`
        : `Opens ${DAY_NAMES[Math.floor(next / DAY) % 7]} ${at}`;
  return { open: false, closingSoon: false, detail };
}
