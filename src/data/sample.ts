/**
 * Sample data until napita-backend exists. Text here is what a business types
 * itself (names, addresses), so it is shown as written and not translated.
 * Amounts are whole pesos (COP). Times are "HH:MM" (24 h).
 */

export type Category = 'bakery' | 'food' | 'cafe' | 'market';

export type Place = {
  id: string;
  name: string;
  category: Category;
  address: string;
  /** Meters from the customer. */
  distance: number;
  /** Price of today's bag in whole pesos. */
  price: number;
  /** Bags still available today. 0 = sold out. */
  left: number;
  pickupFrom: string;
  pickupTo: string;
  /** Closing time today ("HH:MM"); orders not picked up by then are no-shows (decision 0008). */
  closes: string;
  /** Shown in "Para recoger hoy" on Descubrir. */
  featured: boolean;
  /** First photo of today's bag, if the business added one. */
  photo?: string;
  /** The business's logo, shown when the bag has no photo (decision 0013). */
  logo?: string;
  /** Background behind the logo, or behind the initial when there's no logo either. */
  tint: string;
  latitude: number;
  longitude: number;
};

/** Launch area used by the design (see napita-docs/open-questions.md). */
export const AREA = { name: 'Chapinero', radiusKm: 3 };
export const CUSTOMER_LOCATION = { latitude: 4.6662, longitude: -74.0562 };

export const places: Place[] = [
  {
    id: 'la-espiga',
    name: 'Panadería La Espiga',
    category: 'bakery',
    address: 'Cra. 13 #85-32, Bogotá',
    distance: 400,
    price: 12900,
    left: 3,
    pickupFrom: '18:00',
    pickupTo: '19:00',
    closes: '21:00',
    featured: true,
    tint: '#F6E3C4',
    latitude: 4.6697,
    longitude: -74.0535,
  },
  {
    id: 'cocina-verde',
    name: 'Cocina Verde',
    category: 'food',
    address: 'Cl. 81 #9-12, Bogotá',
    distance: 1100,
    price: 15900,
    left: 1,
    pickupFrom: '20:30',
    pickupTo: '21:00',
    closes: '22:00',
    featured: true,
    tint: '#D7EADB',
    latitude: 4.6612,
    longitude: -74.0503,
  },
  {
    id: 'el-rincon',
    name: 'Mercado El Rincón',
    category: 'market',
    address: 'Cra. 15 #88-40, Bogotá',
    distance: 800,
    price: 9900,
    left: 2,
    pickupFrom: '17:00',
    pickupTo: '17:30',
    closes: '19:00',
    featured: false,
    tint: '#E3E8F4',
    latitude: 4.6728,
    longitude: -74.0598,
  },
  {
    id: 'cafe-origen',
    name: 'Café Origen',
    category: 'cafe',
    address: 'Cl. 79 #14-25, Bogotá',
    distance: 1600,
    price: 8900,
    left: 2,
    pickupFrom: '17:30',
    pickupTo: '18:00',
    closes: '19:00',
    featured: false,
    tint: '#F2DCD3',
    latitude: 4.6602,
    longitude: -74.0611,
  },
  {
    id: 'fideos-85',
    name: 'Fideos de la 85',
    category: 'food',
    address: 'Cl. 85 #12-08, Bogotá',
    distance: 600,
    price: 14900,
    left: 4,
    pickupFrom: '18:45',
    pickupTo: '19:15',
    closes: '21:00',
    featured: false,
    tint: '#EFE6C9',
    latitude: 4.6706,
    longitude: -74.0551,
  },
  {
    id: 'huerta-viva',
    name: 'Huerta Viva',
    category: 'food',
    address: 'Cra. 11 #82-15, Bogotá',
    distance: 900,
    price: 13900,
    left: 0,
    pickupFrom: '19:00',
    pickupTo: '20:00',
    closes: '21:00',
    featured: false,
    tint: '#DDE8D0',
    latitude: 4.6638,
    longitude: -74.0516,
  },
];

export function getPlace(id: string) {
  const place = places.find((p) => p.id === id);
  if (!place) throw new Error(`Unknown sample place: ${id}`);
  return place;
}


/**
 * Card payment fee deducted from refunds (napita-docs/decisions/0010).
 * PLACEHOLDER until the payment provider is chosen; the real fee will come
 * from napita-backend.
 */
export const SAMPLE_CARD_FEE = { percent: 3, fixed: 900 };

/** What a customer gets back when they cancel in time: what they paid minus the card fee. */
export function refundAmount(paid: number) {
  const fee = Math.round((paid * SAMPLE_CARD_FEE.percent) / 100) + SAMPLE_CARD_FEE.fixed;
  return Math.max(0, paid - fee);
}

function toMinutes(time: string) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Customers can cancel until the pickup window ends (decision 0010). The
 * deadline will come from a napita-backend setting.
 */
export function cancelDeadline(pickupTo: string) {
  return pickupTo;
}

/** Whether an order whose window starts in `startsInMinutes` can still be cancelled. */
export function canStillCancel(startsInMinutes: number, pickupFrom: string, pickupTo: string) {
  return startsInMinutes + (toMinutes(pickupTo) - toMinutes(pickupFrom)) > 0;
}

/**
 * Order statuses, the same names napita-backend uses (see the docs repo's
 * "Backend and app stay in step" rule and decisions 0008 and 0010).
 */
export type OrderStatus = 'reserved' | 'handed_over' | 'cancelled_by_customer' | 'cancelled_by_business' | 'no_show';

export function isCancelled(status: OrderStatus) {
  return status === 'cancelled_by_customer' || status === 'cancelled_by_business';
}

export type UpcomingOrder = {
  id: string;
  placeId: string;
  quantity: number;
  paid: number;
  code: string;
  /** Minutes until the pickup window opens. */
  startsInMinutes: number;
};

export type PastOrder = {
  id: string;
  placeId: string;
  /** "YYYY-MM-DD" */
  date: string;
  paid: number;
  status: Exclude<OrderStatus, 'reserved'>;
  rated: boolean;
};

export const upcomingOrders: UpcomingOrder[] = [
  { id: 'order-1', placeId: 'la-espiga', quantity: 1, paid: 12900, code: '4821', startsInMinutes: 80 },
];

export const pastOrders: PastOrder[] = [
  { id: 'order-0', placeId: 'cocina-verde', date: '2026-10-03', paid: 15900, status: 'handed_over', rated: false },
  { id: 'order-00', placeId: 'cafe-origen', date: '2026-09-26', paid: 8900, status: 'handed_over', rated: true },
  { id: 'order-000', placeId: 'fideos-85', date: '2026-09-19', paid: 14900, status: 'no_show', rated: false },
];

export type FavoriteStatus =
  | { type: 'bagsToday'; count: number; from: string; to: string }
  | { type: 'notPostedYet' }
  | { type: 'usuallyPosts'; time: string };

export const favorites: { placeId: string; bell: boolean; status: FavoriteStatus }[] = [
  { placeId: 'la-espiga', bell: true, status: { type: 'bagsToday', count: 3, from: '18:00', to: '19:00' } },
  { placeId: 'cocina-verde', bell: true, status: { type: 'bagsToday', count: 1, from: '20:30', to: '21:00' } },
  { placeId: 'el-rincon', bell: false, status: { type: 'notPostedYet' } },
  { placeId: 'cafe-origen', bell: true, status: { type: 'usuallyPosts', time: '15:00' } },
];

export const profileStats = { bagsCollected: 0, placesDiscovered: 0 };
