/**
 * Sample business data for business mode until napita-backend exists.
 * Amounts are whole pesos (COP). Times are "HH:MM" (24 h).
 * Days are 0 = Monday … 6 = Sunday.
 */

export type BagType = 'bakery' | 'pastry' | 'prepared' | 'cafeSnacks' | 'produce' | 'mixed';
export type Allergen = 'gluten' | 'dairy' | 'egg' | 'nuts';

export const BAG_TYPES: BagType[] = ['bakery', 'pastry', 'prepared', 'cafeSnacks', 'produce', 'mixed'];
export const ALLERGENS: Allergen[] = ['gluten', 'dairy', 'egg', 'nuts'];

/** Allergens pre-selected for each category (napita-docs/design/flows/create-bolsa.md). */
export const DEFAULT_ALLERGENS: Record<BagType, Allergen[]> = {
  bakery: ['gluten', 'dairy', 'egg'],
  pastry: ['gluten', 'dairy', 'egg', 'nuts'],
  prepared: ['gluten', 'dairy', 'egg'],
  cafeSnacks: ['gluten', 'dairy'],
  produce: [],
  mixed: ['gluten', 'dairy', 'egg'],
};

/** Placeholder photo color per category. */
export const BAG_TINTS: Record<BagType, string> = {
  bakery: '#F6E3C4',
  pastry: '#F2DCD3',
  prepared: '#D7EADB',
  cafeSnacks: '#EFE6C9',
  produce: '#DDE8D0',
  mixed: '#E3E8F4',
};

/** Pickup windows offered on step 3. The first 3 show as chips, the rest under "Otro". */
export const PICKUP_WINDOWS: [string, string][] = [
  ['17:00', '18:00'],
  ['18:00', '19:00'],
  ['19:00', '20:00'],
  ['16:00', '17:00'],
  ['20:00', '21:00'],
  ['21:00', '22:00'],
];

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
  delivered: boolean;
};

/** The signed-in business, as set during sign-up (napita-docs/design/flows/business-signup.md). */
export const SAMPLE_BUSINESS = {
  name: 'Panadería La Espiga',
  type: 'bakery' as BagType,
  pickupFrom: '18:00',
  pickupTo: '19:00',
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
  },
];

export const samplePickups: Pickup[] = [
  { id: 'order-1', name: 'Valentina R.', bagId: 'bag-1', quantity: 1, code: '4821', delivered: false },
  { id: 'order-2', name: 'Santiago M.', bagId: 'bag-1', quantity: 2, code: '7310', delivered: false },
  { id: 'order-3', name: 'Andrés P.', bagId: 'bag-2', quantity: 1, code: '5094', delivered: false },
  { id: 'order-4', name: 'Camila G.', bagId: 'bag-2', quantity: 1, code: '1956', delivered: true },
];

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
