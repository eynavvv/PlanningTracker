/**
 * Israeli / Jewish holidays 2025–2027
 * Dates follow the Hebrew calendar and are given as Gregorian equivalents.
 * Each holiday spans from eve (erev) sunset to the last day's nightfall,
 * but for timeline-display purposes the dates below use the "calendar day"
 * convention (i.e. the civil dates the holiday falls on).
 *
 * Fields:
 *   name     – English name
 *   nameHe   – Hebrew name
 *   startDate / endDate – ISO date strings (inclusive)
 *   category – 'major' | 'memorial' | 'minor'
 *   isWorkOff – true if broadly observed as a non-working day in Israel
 */

const israeliHolidays = [
  // ─── 2025 ────────────────────────────────────────────────
  // Purim
  { name: 'Purim', nameHe: 'פורים', startDate: '2025-03-14', endDate: '2025-03-14', category: 'minor', isWorkOff: false },
  // Pesach (Passover)
  { name: 'Pesach', nameHe: 'פסח', startDate: '2025-04-13', endDate: '2025-04-19', category: 'major', isWorkOff: true },
  // Yom HaShoah
  { name: 'Yom HaShoah', nameHe: 'יום השואה', startDate: '2025-04-24', endDate: '2025-04-24', category: 'memorial', isWorkOff: false },
  // Yom HaZikaron
  { name: 'Yom HaZikaron', nameHe: 'יום הזיכרון', startDate: '2025-05-01', endDate: '2025-05-01', category: 'memorial', isWorkOff: false },
  // Yom HaAtzmaut
  { name: 'Yom HaAtzmaut', nameHe: 'יום העצמאות', startDate: '2025-05-02', endDate: '2025-05-02', category: 'minor', isWorkOff: true },
  // Lag BaOmer
  { name: 'Lag BaOmer', nameHe: "ל\"ג בעומר", startDate: '2025-05-16', endDate: '2025-05-16', category: 'minor', isWorkOff: false },
  // Shavuot
  { name: 'Shavuot', nameHe: 'שבועות', startDate: '2025-06-02', endDate: '2025-06-02', category: 'major', isWorkOff: true },
  // Tisha B'Av
  { name: "Tisha B'Av", nameHe: 'תשעה באב', startDate: '2025-08-03', endDate: '2025-08-03', category: 'memorial', isWorkOff: false },
  // Rosh Hashana
  { name: 'Rosh Hashana', nameHe: 'ראש השנה', startDate: '2025-09-23', endDate: '2025-09-24', category: 'major', isWorkOff: true },
  // Yom Kippur
  { name: 'Yom Kippur', nameHe: 'יום כיפור', startDate: '2025-10-02', endDate: '2025-10-02', category: 'major', isWorkOff: true },
  // Sukkot
  { name: 'Sukkot', nameHe: 'סוכות', startDate: '2025-10-07', endDate: '2025-10-13', category: 'major', isWorkOff: true },
  // Simchat Torah
  { name: 'Simchat Torah', nameHe: 'שמחת תורה', startDate: '2025-10-14', endDate: '2025-10-14', category: 'major', isWorkOff: true },
  // Hanukkah
  { name: 'Hanukkah', nameHe: 'חנוכה', startDate: '2025-12-15', endDate: '2025-12-22', category: 'minor', isWorkOff: false },

  // ─── 2026 ────────────────────────────────────────────────
  // Tu BiShvat
  { name: 'Tu BiShvat', nameHe: 'ט״ו בשבט', startDate: '2026-02-01', endDate: '2026-02-01', category: 'minor', isWorkOff: false },
  // Purim
  { name: 'Purim', nameHe: 'פורים', startDate: '2026-03-03', endDate: '2026-03-03', category: 'minor', isWorkOff: false },
  // Pesach (Passover)
  { name: 'Pesach', nameHe: 'פסח', startDate: '2026-04-02', endDate: '2026-04-08', category: 'major', isWorkOff: true },
  // Yom HaShoah
  { name: 'Yom HaShoah', nameHe: 'יום השואה', startDate: '2026-04-14', endDate: '2026-04-14', category: 'memorial', isWorkOff: false },
  // Yom HaZikaron
  { name: 'Yom HaZikaron', nameHe: 'יום הזיכרון', startDate: '2026-04-21', endDate: '2026-04-21', category: 'memorial', isWorkOff: false },
  // Yom HaAtzmaut
  { name: 'Yom HaAtzmaut', nameHe: 'יום העצמאות', startDate: '2026-04-22', endDate: '2026-04-22', category: 'minor', isWorkOff: true },
  // Lag BaOmer
  { name: 'Lag BaOmer', nameHe: "ל\"ג בעומר", startDate: '2026-05-05', endDate: '2026-05-05', category: 'minor', isWorkOff: false },
  // Shavuot
  { name: 'Shavuot', nameHe: 'שבועות', startDate: '2026-05-22', endDate: '2026-05-22', category: 'major', isWorkOff: true },
  // Tisha B'Av
  { name: "Tisha B'Av", nameHe: 'תשעה באב', startDate: '2026-07-23', endDate: '2026-07-23', category: 'memorial', isWorkOff: false },
  // Rosh Hashana
  { name: 'Rosh Hashana', nameHe: 'ראש השנה', startDate: '2026-09-12', endDate: '2026-09-13', category: 'major', isWorkOff: true },
  // Yom Kippur
  { name: 'Yom Kippur', nameHe: 'יום כיפור', startDate: '2026-09-21', endDate: '2026-09-21', category: 'major', isWorkOff: true },
  // Sukkot
  { name: 'Sukkot', nameHe: 'סוכות', startDate: '2026-09-26', endDate: '2026-10-02', category: 'major', isWorkOff: true },
  // Simchat Torah
  { name: 'Simchat Torah', nameHe: 'שמחת תורה', startDate: '2026-10-03', endDate: '2026-10-03', category: 'major', isWorkOff: true },
  // Hanukkah
  { name: 'Hanukkah', nameHe: 'חנוכה', startDate: '2026-12-05', endDate: '2026-12-12', category: 'minor', isWorkOff: false },

  // ─── 2027 ────────────────────────────────────────────────
  // Tu BiShvat
  { name: 'Tu BiShvat', nameHe: 'ט״ו בשבט', startDate: '2027-01-22', endDate: '2027-01-22', category: 'minor', isWorkOff: false },
  // Purim
  { name: 'Purim', nameHe: 'פורים', startDate: '2027-03-23', endDate: '2027-03-23', category: 'minor', isWorkOff: false },
  // Pesach (Passover)
  { name: 'Pesach', nameHe: 'פסח', startDate: '2027-04-22', endDate: '2027-04-28', category: 'major', isWorkOff: true },
  // Yom HaShoah
  { name: 'Yom HaShoah', nameHe: 'יום השואה', startDate: '2027-05-04', endDate: '2027-05-04', category: 'memorial', isWorkOff: false },
  // Yom HaZikaron
  { name: 'Yom HaZikaron', nameHe: 'יום הזיכרון', startDate: '2027-05-11', endDate: '2027-05-11', category: 'memorial', isWorkOff: false },
  // Yom HaAtzmaut
  { name: 'Yom HaAtzmaut', nameHe: 'יום העצמאות', startDate: '2027-05-12', endDate: '2027-05-12', category: 'minor', isWorkOff: true },
  // Lag BaOmer
  { name: 'Lag BaOmer', nameHe: "ל\"ג בעומר", startDate: '2027-05-25', endDate: '2027-05-25', category: 'minor', isWorkOff: false },
  // Shavuot
  { name: 'Shavuot', nameHe: 'שבועות', startDate: '2027-06-11', endDate: '2027-06-11', category: 'major', isWorkOff: true },
  // Tisha B'Av
  { name: "Tisha B'Av", nameHe: 'תשעה באב', startDate: '2027-08-12', endDate: '2027-08-12', category: 'memorial', isWorkOff: false },
  // Rosh Hashana
  { name: 'Rosh Hashana', nameHe: 'ראש השנה', startDate: '2027-10-02', endDate: '2027-10-03', category: 'major', isWorkOff: true },
  // Yom Kippur
  { name: 'Yom Kippur', nameHe: 'יום כיפור', startDate: '2027-10-11', endDate: '2027-10-11', category: 'major', isWorkOff: true },
  // Sukkot
  { name: 'Sukkot', nameHe: 'סוכות', startDate: '2027-10-16', endDate: '2027-10-22', category: 'major', isWorkOff: true },
  // Simchat Torah
  { name: 'Simchat Torah', nameHe: 'שמחת תורה', startDate: '2027-10-23', endDate: '2027-10-23', category: 'major', isWorkOff: true },
  // Hanukkah
  { name: 'Hanukkah', nameHe: 'חנוכה', startDate: '2027-12-25', endDate: '2028-01-01', category: 'minor', isWorkOff: false },
];

export default israeliHolidays;
