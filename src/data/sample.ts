/**
 * Sample data until napita-backend exists. Text here is what a business types
 * itself (names, addresses), so it is shown as written and not translated.
 * Amounts are whole pesos (COP). Times are "HH:MM" (24 h).
 */

export type Category = 'bakery' | 'food' | 'cafe' | 'market' | 'vegan';

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
  /** Shown in "Para recoger hoy" on Descubrir. */
  featured: boolean;
  /** Placeholder photo color from the canvas. */
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
    featured: false,
    tint: '#EFE6C9',
    latitude: 4.6706,
    longitude: -74.0551,
  },
  {
    id: 'huerta-viva',
    name: 'Huerta Viva',
    category: 'vegan',
    address: 'Cra. 11 #82-15, Bogotá',
    distance: 900,
    price: 13900,
    left: 0,
    pickupFrom: '19:00',
    pickupTo: '20:00',
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
 * Customers can cancel until this many hours before the pickup window starts
 * (napita-docs/decisions/0010). Will come from a napita-backend setting.
 */
export const CANCEL_HOURS_BEFORE = 1;

/** Last moment to cancel, as "HH:MM": the pickup start minus CANCEL_HOURS_BEFORE ("18:00" → "17:00"). */
export function cancelDeadline(pickupFrom: string) {
  const [h, m] = pickupFrom.split(':').map(Number);
  const minutes = Math.max(0, h * 60 + m - CANCEL_HOURS_BEFORE * 60);
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

/** Whether an order that starts in `startsInMinutes` can still be cancelled. */
export function canStillCancel(startsInMinutes: number) {
  return startsInMinutes > CANCEL_HOURS_BEFORE * 60;
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
  status: 'pickedUp' | 'cancelled';
  rated: boolean;
};

export const upcomingOrders: UpcomingOrder[] = [
  { id: 'order-1', placeId: 'la-espiga', quantity: 1, paid: 12900, code: '4821', startsInMinutes: 80 },
];

export const pastOrders: PastOrder[] = [
  { id: 'order-0', placeId: 'cocina-verde', date: '2026-10-03', paid: 15900, status: 'pickedUp', rated: false },
  { id: 'order-00', placeId: 'cafe-origen', date: '2026-09-26', paid: 8900, status: 'pickedUp', rated: true },
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
