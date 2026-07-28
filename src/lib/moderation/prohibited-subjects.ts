import { prisma } from "@/lib/db";

const FALLBACK_PROHIBITED = [
  "quran",
  "qur'an",
  "tajweed",
  "hadith",
  "tafsir",
  "fiqh",
  "aqeedah",
  "aqidah",
  "islamic studies",
  "islamic jurisprudence",
  "fatwa",
  "religious counselling",
  "religious counseling",
  "religious instruction",
  "islamic theology",
  "shariah",
  "sharia",
  "sunnah studies",
  "islamic history theology",
];

function normalize(text: string) {
  return text.toLowerCase().replace(/['']/g, "'").trim();
}

export async function getProhibitedTerms(): Promise<string[]> {
  try {
    const rows = await prisma.prohibitedSubject.findMany({
      where: { isActive: true },
      select: { term: true, aliases: true },
    });
    if (rows.length === 0) return FALLBACK_PROHIBITED;
    return rows.flatMap((r) => [r.term, ...r.aliases].map(normalize));
  } catch {
    return FALLBACK_PROHIBITED;
  }
}

export async function containsProhibitedSubject(
  ...texts: Array<string | null | undefined>
): Promise<{ prohibited: boolean; matchedTerm?: string }> {
  const terms = await getProhibitedTerms();
  const haystack = normalize(texts.filter(Boolean).join(" "));
  for (const term of terms) {
    if (!term) continue;
    if (haystack.includes(normalize(term))) {
      return { prohibited: true, matchedTerm: term };
    }
  }
  return { prohibited: false };
}

export function assertSecularSubjectSync(
  text: string,
  terms: string[] = FALLBACK_PROHIBITED,
): { ok: true } | { ok: false; matchedTerm: string } {
  const haystack = normalize(text);
  for (const term of terms) {
    if (haystack.includes(normalize(term))) {
      return { ok: false, matchedTerm: term };
    }
  }
  return { ok: true };
}

export { FALLBACK_PROHIBITED };
