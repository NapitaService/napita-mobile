import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

import {
  BAG_TYPES_FOR,
  DEFAULT_ALLERGENS,
  SAMPLE_NEXT_PAYOUT,
  samplePayoutHistory,
  sampleBags,
  samplePickups,
  suggestPrices,
  type Allergen,
  type BagType,
  type BusinessBag,
  type Payout,
  type Pickup,
} from '@/data/business';
import { isCancelled, type OrderStatus } from '@/data/sample';
import { DEFAULT_HOURS, useAccount, type BusinessProfile } from '@/settings/account';
import { useToday } from '@/settings/today';

/** The bag being created in the "Nueva bolsa" flow. */
export type BagDraft = {
  type: BagType;
  /** null until the business types its own name; then shown as written. */
  customName: string | null;
  allergens: Allergen[];
  value: number;
  price: number;
  quantity: number;
  from: string;
  to: string;
  repeatWeekly: boolean;
  days: number[];
  photos: string[];
};

/** Defaults so the common case is "Siguiente, Siguiente, Publicar" (design/README.md). */
function newDraft(business: BusinessProfile): BagDraft {
  const value = 39000;
  const type = BAG_TYPES_FOR[business.type][0];
  return {
    type,
    customName: null,
    allergens: DEFAULT_ALLERGENS[type],
    value,
    price: suggestPrices(value)[1],
    quantity: 3,
    from: business.pickupFrom,
    to: business.pickupTo,
    repeatWeekly: true,
    days: business.openDays,
    photos: [],
  };
}

/** Stands in while a new business hasn't finished sign-up (its screens aren't shown then). */
const NO_BUSINESS: BusinessProfile = { name: '', type: 'other', address: '', ...DEFAULT_HOURS };

type BusinessState = {
  business: BusinessProfile;
  bags: BusinessBag[];
  pickups: Pickup[];
  /** Bags reserved and handed over for one bag today, counted from `pickups`. */
  countsFor: (bagId: string) => { reserved: number; delivered: number };
  /** Marks an order as handed over. */
  handOver: (pickupId: string) => void;
  undoHandOver: (pickupId: string) => void;
  /** The business cancels an order; its bags go back on sale (decision 0010). */
  cancelByBusiness: (pickupId: string) => void;
  /** The next payout (amount so far this period) and past ones, newest first. */
  payouts: { next: Payout; history: Payout[] };
  receivingOrders: boolean;
  setReceivingOrders: (on: boolean) => void;
  setQuantity: (id: string, quantity: number) => void;
  publishToday: (id: string) => void;
  draft: BagDraft;
  updateDraft: (changes: Partial<BagDraft>) => void;
  startDraft: () => void;
  /** Adds the draft to the bag list, named `name`. */
  publishDraft: (name: string) => void;
};

const BusinessContext = createContext<BusinessState | null>(null);

/**
 * Business-mode state for the signed-in business. In memory until napita-backend
 * exists: the demo business gets sample bags and orders, new businesses start empty.
 */
export function BusinessProvider({ children }: { children: ReactNode }) {
  const { account } = useAccount();
  const demo = !!account?.demo;
  const business = account?.business ?? NO_BUSINESS;
  const [bags, setBags] = useState(() => (demo ? sampleBags : []));
  const [pickups, setPickups] = useState(() => (demo ? samplePickups : []));
  const { offToday, setOffToday } = useToday();
  const receivingOrders = !offToday.includes(business.name);
  const setReceivingOrders = useCallback(
    (on: boolean) => setOffToday(business.name, !on),
    [business.name, setOffToday],
  );
  const [draft, setDraft] = useState(() => newDraft(business));

  // Start over when someone else signs in.
  const [owner, setOwner] = useState(account?.phone);
  if (owner !== account?.phone) {
    setOwner(account?.phone);
    setBags(demo ? sampleBags : []);
    setPickups(demo ? samplePickups : []);
  }

  const countsFor = useCallback(
    (bagId: string) => {
      // Cancelled orders don't count: their bags are back on sale.
      const forBag = pickups.filter((p) => p.bagId === bagId && !isCancelled(p.status));
      return {
        reserved: forBag.reduce((sum, p) => sum + p.quantity, 0),
        delivered: forBag.filter((p) => p.status === 'handed_over').reduce((sum, p) => sum + p.quantity, 0),
      };
    },
    [pickups],
  );

  // Never below what customers already reserved.
  const setQuantity = useCallback(
    (id: string, quantity: number) => {
      const min = countsFor(id).reserved;
      setBags((all) => all.map((b) => (b.id === id ? { ...b, quantity: Math.min(50, Math.max(min, quantity)) } : b)));
    },
    [countsFor],
  );

  const setStatus = (pickupId: string, status: OrderStatus) =>
    setPickups((all) => all.map((p) => (p.id === pickupId ? { ...p, status } : p)));
  const handOver = useCallback((pickupId: string) => setStatus(pickupId, 'handed_over'), []);
  const undoHandOver = useCallback((pickupId: string) => setStatus(pickupId, 'reserved'), []);
  const cancelByBusiness = useCallback((pickupId: string) => setStatus(pickupId, 'cancelled_by_business'), []);

  const publishToday = useCallback((id: string) => {
    setBags((all) => all.map((b) => (b.id === id ? { ...b, live: true, quantity: b.usualQuantity } : b)));
  }, []);

  const updateDraft = useCallback((changes: Partial<BagDraft>) => setDraft((d) => ({ ...d, ...changes })), []);
  const startDraft = useCallback(() => setDraft(newDraft(business)), [business]);

  const publishDraft = useCallback(
    (name: string) => {
      const { customName: _, ...bag } = draft;
      setBags((all) => [{ ...bag, id: `bag-${Date.now()}`, name, usualQuantity: bag.quantity, live: true }, ...all]);
    },
    [draft],
  );

  return (
    <BusinessContext.Provider
      value={{
        business,
        bags,
        pickups,
        countsFor,
        handOver,
        undoHandOver,
        cancelByBusiness,
        payouts: demo
          ? { next: SAMPLE_NEXT_PAYOUT, history: samplePayoutHistory }
          : { next: { date: SAMPLE_NEXT_PAYOUT.date, amount: 0 }, history: [] },
        receivingOrders,
        setReceivingOrders,
        setQuantity,
        publishToday,
        draft,
        updateDraft,
        startDraft,
        publishDraft,
      }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const state = useContext(BusinessContext);
  if (!state) throw new Error('useBusiness must be used inside BusinessProvider');
  return state;
}
