import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

import {
  DEFAULT_ALLERGENS,
  SAMPLE_BUSINESS,
  sampleBags,
  samplePickups,
  suggestPrices,
  type Allergen,
  type BagType,
  type BusinessBag,
  type Pickup,
} from '@/data/business';

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
};

/** Defaults so the common case is "Siguiente, Siguiente, Publicar" (design/README.md). */
function newDraft(): BagDraft {
  const value = 39000;
  return {
    type: SAMPLE_BUSINESS.type,
    customName: null,
    allergens: DEFAULT_ALLERGENS[SAMPLE_BUSINESS.type],
    value,
    price: suggestPrices(value)[1],
    quantity: 3,
    from: SAMPLE_BUSINESS.pickupFrom,
    to: SAMPLE_BUSINESS.pickupTo,
    repeatWeekly: true,
    days: [0, 1, 2, 3, 4, 5],
  };
}

type BusinessState = {
  business: typeof SAMPLE_BUSINESS;
  bags: BusinessBag[];
  pickups: Pickup[];
  /** Bags reserved and handed over for one bag today, counted from `pickups`. */
  countsFor: (bagId: string) => { reserved: number; delivered: number };
  /** Marks an order as handed over. */
  handOver: (pickupId: string) => void;
  undoHandOver: (pickupId: string) => void;
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

/** Business-mode state. Sample data in memory until napita-backend exists. */
export function BusinessProvider({ children }: { children: ReactNode }) {
  const [bags, setBags] = useState(sampleBags);
  const [pickups, setPickups] = useState(samplePickups);
  const [receivingOrders, setReceivingOrders] = useState(true);
  const [draft, setDraft] = useState(newDraft);

  const countsFor = useCallback(
    (bagId: string) => {
      const forBag = pickups.filter((p) => p.bagId === bagId);
      return {
        reserved: forBag.reduce((sum, p) => sum + p.quantity, 0),
        delivered: forBag.filter((p) => p.delivered).reduce((sum, p) => sum + p.quantity, 0),
      };
    },
    [pickups]
  );

  // Never below what customers already reserved.
  const setQuantity = useCallback(
    (id: string, quantity: number) => {
      const min = countsFor(id).reserved;
      setBags((all) => all.map((b) => (b.id === id ? { ...b, quantity: Math.min(50, Math.max(min, quantity)) } : b)));
    },
    [countsFor]
  );

  const setDelivered = (pickupId: string, delivered: boolean) =>
    setPickups((all) => all.map((p) => (p.id === pickupId ? { ...p, delivered } : p)));
  const handOver = useCallback((pickupId: string) => setDelivered(pickupId, true), []);
  const undoHandOver = useCallback((pickupId: string) => setDelivered(pickupId, false), []);

  const publishToday = useCallback((id: string) => {
    setBags((all) => all.map((b) => (b.id === id ? { ...b, live: true, quantity: b.usualQuantity } : b)));
  }, []);

  const updateDraft = useCallback((changes: Partial<BagDraft>) => setDraft((d) => ({ ...d, ...changes })), []);
  const startDraft = useCallback(() => setDraft(newDraft()), []);

  const publishDraft = useCallback(
    (name: string) => {
      const { customName: _, ...bag } = draft;
      setBags((all) => [
        { ...bag, id: `bag-${Date.now()}`, name, usualQuantity: bag.quantity, live: true },
        ...all,
      ]);
    },
    [draft]
  );

  return (
    <BusinessContext.Provider
      value={{
        business: SAMPLE_BUSINESS,
        bags,
        pickups,
        countsFor,
        handOver,
        undoHandOver,
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
