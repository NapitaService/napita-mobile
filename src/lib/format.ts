/**
 * Colombian formatting rules from napita-docs/product/.
 * Amounts are always whole pesos (e.g. 12900). Times are "HH:MM" in 24 h.
 */

export type Language = 'es-CO' | 'en';
export type Currency = 'COP' | 'USD';

/**
 * Sample exchange rate for the USD display. The real app will use a daily rate
 * from napita-backend. Charges always stay in COP.
 */
export const SAMPLE_COP_PER_USD = 4030;

function groupThousands(value: number, separator: string) {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

/** 12900 → "$12.900" */
export function formatCOP(pesos: number) {
  return '$' + groupThousands(Math.round(pesos), '.');
}

/** 12900 → "$12.900", or in USD "US$3,20" (Spanish) / "US$3.20" (English). */
export function formatPrice(pesos: number, currency: Currency, language: Language) {
  if (currency === 'COP') return formatCOP(pesos);
  const [whole, cents] = (pesos / SAMPLE_COP_PER_USD).toFixed(2).split('.');
  return language === 'en'
    ? `US$${groupThousands(Number(whole), ',')}.${cents}`
    : `US$${groupThousands(Number(whole), '.')},${cents}`;
}

function clockParts(time: string) {
  const [h, m] = time.split(':').map(Number);
  return { clock: `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')}`, pm: h >= 12 };
}

function period(pm: boolean, language: Language) {
  // Non-breaking spaces so "p. m." never splits across two lines.
  if (language === 'en') return pm ? 'PM' : 'AM';
  return pm ? 'p.\u00A0m.' : 'a.\u00A0m.';
}

/** "18:00" → "6:00 p. m." / "6:00 PM" */
export function formatTime(time: string, language: Language) {
  const { clock, pm } = clockParts(time);
  return `${clock}\u00A0${period(pm, language)}`;
}

/** Start and end of a pickup window, with "p. m." only on the end when both share it. */
export function windowParts(from: string, to: string, language: Language) {
  const start = clockParts(from);
  const end = clockParts(to);
  return {
    from: start.pm === end.pm ? start.clock : formatTime(from, language),
    to: formatTime(to, language),
  };
}

/** "18:00", "19:00" → "6:00–7:00 p. m." */
export function formatWindow(from: string, to: string, language: Language) {
  const parts = windowParts(from, to, language);
  return `${parts.from}–${parts.to}`;
}

/** 400 → "400 m", 1100 → "1,1 km" (Spanish) / "1.1 km" (English) */
export function formatDistance(meters: number, language: Language) {
  if (meters < 1000) return `${Math.round(meters / 10) * 10} m`;
  const km = (meters / 1000).toFixed(1).replace(/\.0$/, '');
  return `${language === 'en' ? km : km.replace('.', ',')} km`;
}

const DAYS = {
  'es-CO': ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};
const MONTHS = {
  'es-CO': ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

/** "2026-10-03" → "sáb. 3 de oct." / "Sat, Oct 3" */
export function formatShortDate(isoDate: string, language: Language) {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const day = DAYS[language][date.getDay()];
  const month = MONTHS[language][m - 1];
  return language === 'en' ? `${day}, ${month} ${d}` : `${day} ${d} de ${month}`;
}

/** 80 → "1 h 20 min" */
export function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

/** Today's date as "YYYY-MM-DD" in the phone's time zone. */
export function todayISO() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// Weekday names, 0 = Monday … 6 = Sunday.
const WEEKDAYS = {
  'es-CO': ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'],
  en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
};
const WEEKDAYS_PLURAL = {
  'es-CO': ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábados', 'domingos'],
  en: ['Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays', 'Sundays'],
};
/** One-letter day buttons: "L M M J V S D" / "M T W T F S S". */
export const WEEKDAY_INITIALS = {
  'es-CO': ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
  en: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
};

export function weekdayName(day: number, language: Language) {
  return WEEKDAYS[language][day];
}

function joinList(items: string[], language: Language) {
  if (items.length <= 1) return items.join('');
  const and = language === 'en' ? 'and' : 'y';
  return `${items.slice(0, -1).join(', ')} ${and} ${items[items.length - 1]}`;
}

/**
 * Which days a bag repeats, as words.
 * `inSentence`: "de lunes a sábado", "los fines de semana", "on Mondays and Fridays".
 * Otherwise a label: "Lunes a sábado", "Fines de semana", "Mondays and Fridays".
 */
export function formatDays(days: number[], language: Language, inSentence: boolean) {
  const sorted = [...new Set(days)].sort((a, b) => a - b);
  const es = language === 'es-CO';
  const consecutive = sorted.every((d, i) => i === 0 || d === sorted[i - 1] + 1);
  let text: string;
  if (sorted.length === 7) text = es ? 'todos los días' : 'every day';
  else if (sorted.length === 2 && sorted[0] === 5 && sorted[1] === 6)
    text = es ? (inSentence ? 'los fines de semana' : 'fines de semana') : inSentence ? 'on weekends' : 'weekends';
  else if (consecutive && sorted.length >= 3) {
    const range = `${WEEKDAYS[language][sorted[0]]} ${es ? 'a' : 'to'} ${WEEKDAYS[language][sorted[sorted.length - 1]]}`;
    text = es && inSentence ? `de ${range}` : range;
  } else {
    const list = joinList(sorted.map((d) => WEEKDAYS_PLURAL[language][d]), language);
    text = inSentence ? `${es ? 'los' : 'on'} ${list}` : list;
  }
  return inSentence ? text : text.charAt(0).toUpperCase() + text.slice(1);
}
