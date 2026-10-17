import type { OrderStatus } from '@/data/sample';

/**
 * Sample business data for business mode until napita-backend exists.
 * Amounts are whole pesos (COP). Times are "HH:MM" (24 h).
 * Days are 0 = Monday … 6 = Sunday.
 */

export type BagType =
  | 'bakery'
  | 'pastry'
  | 'prepared'
  | 'desserts'
  | 'cafeSnacks'
  | 'produce'
  | 'groceries'
  | 'mixed';
export type Allergen = 'gluten' | 'dairy' | 'egg' | 'nuts';

/** The business types offered at sign-up (design/canvas/ShopOnboardDetails). */
export type BusinessType = 'bakery' | 'restaurant' | 'cafe' | 'pastry' | 'market' | 'other';
export const BUSINESS_TYPES: BusinessType[] = ['bakery', 'restaurant', 'cafe', 'pastry', 'market', 'other'];

/**
 * What can go in a bag for each type of business, in the order shown on
 * "Nueva bolsa" step 1; the first is pre-selected (napita-docs/decisions/0013).
 */
export const BAG_TYPES_FOR: Record<BusinessType, BagType[]> = {
  bakery: ['bakery', 'pastry', 'mixed'],
  pastry: ['pastry', 'desserts', 'bakery', 'mixed'],
  restaurant: ['prepared', 'desserts', 'mixed'],
  cafe: ['cafeSnacks', 'pastry', 'bakery', 'mixed'],
  market: ['produce', 'groceries', 'bakery', 'mixed'],
  other: ['mixed', 'bakery', 'pastry', 'prepared', 'desserts', 'cafeSnacks', 'produce', 'groceries'],
};

/** Up to this many photos per bag; the first is the one customers see first. */
export const MAX_BAG_PHOTOS = 3;
export const ALLERGENS: Allergen[] = ['gluten', 'dairy', 'egg', 'nuts'];

/** Allergens pre-selected for each category (napita-docs/design/flows/create-bolsa.md). */
export const DEFAULT_ALLERGENS: Record<BagType, Allergen[]> = {
  bakery: ['gluten', 'dairy', 'egg'],
  pastry: ['gluten', 'dairy', 'egg', 'nuts'],
  prepared: ['gluten', 'dairy', 'egg'],
  desserts: ['gluten', 'dairy', 'egg'],
  cafeSnacks: ['gluten', 'dairy'],
  produce: [],
  groceries: ['gluten'],
  mixed: ['gluten', 'dairy', 'egg'],
};

/** Placeholder photo color per category. */
export const BAG_TINTS: Record<BagType, string> = {
  bakery: '#F6E3C4',
  pastry: '#F2DCD3',
  prepared: '#D7EADB',
  desserts: '#F4DDE3',
  cafeSnacks: '#EFE6C9',
  produce: '#DDE8D0',
  groceries: '#E8E2D4',
  mixed: '#E3E8F4',
};

const toMinutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
const toTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

/**
 * One-hour pickup windows that fit inside the opening hours (decision 0011),
 * earliest first. E.g. 07:00–21:00 → 07:00–08:00 … 20:00–21:00.
 */
export function pickupWindowsFor(opens: string, closes: string): [string, string][] {
  const windows: [string, string][] = [];
  for (let start = Math.ceil(toMinutes(opens) / 60) * 60; start + 60 <= toMinutes(closes); start += 60) {
    windows.push([toTime(start), toTime(start + 60)]);
  }
  return windows;
}

/** The `count` windows shown first: the ones around `from`, or the last ones before closing. */
export function nearbyWindows(windows: [string, string][], from: string, count: number) {
  const at = windows.findIndex(([f]) => f === from);
  const start = at < 0 ? windows.length - count : at - Math.floor(count / 2);
  const clamped = Math.max(0, Math.min(start, windows.length - count));
  return windows.slice(clamped, clamped + count);
}

/** True if the window lies inside the opening hours. */
export function windowFits(from: string, to: string, opens: string, closes: string) {
  return toMinutes(from) >= toMinutes(opens) && toMinutes(to) <= toMinutes(closes) && toMinutes(from) < toMinutes(to);
}

/** Opening and closing times offered at sign-up: every 30 minutes. */
export const HALF_HOURS = Array.from({ length: 48 }, (_, i) => toTime(i * 30));

export type BusinessBag = {
  id: string;
  /** Typed by the business, shown as written (not translated). */
  name: string;
  type: BagType;
  allergens: Allergen[];
  /** What the contents would cost at normal price. */
  value: number;
  price: number;
  /** Bags offered today (0 when paused). */
  quantity: number;
  /** Quantity used by "Publicar hoy" on a paused bag. */
  usualQuantity: number;
  from: string;
  to: string;
  repeatWeekly: boolean;
  days: number[];
  live: boolean;
  /** Photos the business added (local URIs until napita-backend storage exists). Empty = show the logo. */
  photos: string[];
};

/**
 * A customer's reservation for today, to hand over at pickup. Reserved and
 * delivered counts on Hoy and Bolsas are worked out from this list.
 */
export type Pickup = {
  id: string;
  /** First name and last initial, as customers appear to businesses. */
  name: string;
  bagId: string;
  quantity: number;
  /** The 4-digit code the customer shows (also inside their QR code). */
  code: string;
  status: OrderStatus;
  /** When the customer placed the order (ms since 1970). */
  placedAt: number;
};

export const sampleBags: BusinessBag[] = [
  {
    id: 'bag-1',
    name: 'Bolsa sorpresa de panadería',
    type: 'bakery',
    allergens: ['gluten', 'dairy', 'egg'],
    value: 39000,
    price: 12900,
    quantity: 4,
    usualQuantity: 4,
    from: '18:00',
    to: '19:00',
    repeatWeekly: true,
    days: [0, 1, 2, 3, 4, 5],
    live: true,
    photos: [],
  },
  {
    id: 'bag-2',
    name: 'Caja de pastelería',
    type: 'pastry',
    allergens: ['gluten', 'dairy', 'egg', 'nuts'],
    value: 51000,
    price: 16900,
    quantity: 2,
    usualQuantity: 2,
    from: '18:00',
    to: '19:00',
    repeatWeekly: true,
    days: [0, 1, 2, 3, 4, 5],
    live: true,
    photos: [],
  },
  {
    id: 'bag-3',
    name: 'Solo pan',
    type: 'bakery',
    allergens: ['gluten'],
    value: 21000,
    price: 6900,
    quantity: 0,
    usualQuantity: 3,
    from: '17:00',
    to: '18:00',
    repeatWeekly: true,
    days: [5, 6],
    live: false,
    photos: [],
  },
];

const minutesAgo = (minutes: number) => Date.now() - minutes * 60_000;

export const samplePickups: Pickup[] = [
  { id: 'order-1', name: 'Valentina R.', bagId: 'bag-1', quantity: 1, code: '4821', status: 'reserved', placedAt: minutesAgo(5) },
  { id: 'order-2', name: 'Santiago M.', bagId: 'bag-1', quantity: 2, code: '7310', status: 'reserved', placedAt: minutesAgo(11) },
  { id: 'order-3', name: 'Andrés P.', bagId: 'bag-2', quantity: 1, code: '5094', status: 'reserved', placedAt: minutesAgo(40) },
  { id: 'order-4', name: 'Camila G.', bagId: 'bag-2', quantity: 1, code: '1956', status: 'handed_over', placedAt: minutesAgo(95) },
  { id: 'order-5', name: 'Laura C.', bagId: 'bag-1', quantity: 1, code: '6638', status: 'no_show', placedAt: minutesAgo(300) },
];

/**
 * Businesses can cancel an order within this many minutes of it being placed
 * (decision 0010). PLACEHOLDER for the napita-backend setting.
 */
export const BUSINESS_CANCEL_MINUTES = 15;

/** Whole minutes left for the business to cancel (0 = too late). */
export function businessCancelMinutesLeft(placedAt: number, now: number) {
  return Math.max(0, Math.ceil((placedAt + BUSINESS_CANCEL_MINUTES * 60_000 - now) / 60_000));
}

/**
 * Ñapita's commission (napita-docs/decisions/0007). Not shown in the app, but
 * business totals are shown net of it. PLACEHOLDER for the napita-backend setting.
 */
export const COMMISSION_PERCENT = 20;

/** What the business receives for one bag: the price minus the commission (whole pesos). */
export function netPrice(price: number) {
  return price - Math.round((price * COMMISSION_PERCENT) / 100);
}

/**
 * Reads the code from a customer's QR ("napita:order:<id>:<code>", see the
 * customer Pedidos screen) or a typed 4-digit code. Returns null for anything else.
 */
export function readPickupCode(data: string) {
  const qr = /^napita:order:[^:]+:(\d{4})$/.exec(data.trim());
  if (qr) return qr[1];
  return /^\d{4}$/.test(data.trim()) ? data.trim() : null;
}

/**
 * Three price choices for a bag worth `value` pesos. The middle one is about a
 * third of the value, all ending in .900 (e.g. 39.000 → 10.900 / 12.900 / 15.900).
 */
export function suggestPrices(value: number): [number, number, number] {
  const suggested = Math.max(1900, Math.round(value / 3 / 1000) * 1000 - 100);
  return [Math.max(900, suggested - 2000), suggested, suggested + 3000];
}

/** Banks offered for payouts (napita-docs/decisions/0015). Shown as written. */
export const BANKS = [
  'Bancolombia',
  'Banco de Bogotá',
  'Davivienda',
  'BBVA',
  'Banco de Occidente',
  'Banco Popular',
  'Banco AV Villas',
  'Scotiabank Colpatria',
  'Banco Caja Social',
  'Itaú',
  'Banco Agrario',
  'Nu Colombia',
] as const;

export type DocumentType = 'cc' | 'ce' | 'nit';

/**
 * Where Ñapita sends the business's money (napita-docs/decisions/0015): a
 * bank account or Nequi, plus who it belongs to.
 */
export type PayoutAccount = {
  holderName: string;
  documentType: DocumentType;
  documentNumber: string;
  /** "verifying" until the $300 test transfer arrives (decision 0015). */
  status: 'verifying' | 'verified';
} & (
  | { method: 'bank'; bank: string; accountType: 'savings' | 'checking'; accountNumber: string }
  | { method: 'nequi'; phone: string }
);

/** Last 4 digits only, so the full number is never on screen after saving. */
export function lastDigits(number: string) {
  return number.slice(-4);
}

/** Test transfer that checks a new or changed payout account, in pesos (decision 0015). */
export const TEST_TRANSFER_COP = 300;

/**
 * One payout to the business: every 2 weeks, no minimum, transfer costs paid
 * by Ñapita (decision 0015). `amount` is net of the commission; 0 = nothing
 * to pay that period.
 */
export type Payout = { date: string; amount: number };

/**
 * Sample payouts for the demo business until napita-backend works them out.
 * PLACEHOLDER schedule: every other Friday.
 */
export const SAMPLE_NEXT_PAYOUT: Payout = { date: '2026-10-30', amount: 186240 };
export const samplePayoutHistory: Payout[] = [
  { date: '2026-10-16', amount: 412800 },
  { date: '2026-10-02', amount: 0 },
  { date: '2026-09-18', amount: 286400 },
];
