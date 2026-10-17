import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

import {
  pastOrders as samplePast,
  places as samplePlaces,
  upcomingOrders as sampleUpcoming,
  type PastOrder,
  type Place,
  type UpcomingOrder,
} from '@/data/sample';
import { todayISO } from '@/lib/format';
import { useAccount } from '@/settings/account';

type OrdersState = {
  upcoming: UpcomingOrder[];
  past: PastOrder[];
  /** Cancels an upcoming order; it moves to past orders as "cancelled_by_customer". */
  cancelOrder: (id: string) => void;
  /** Places with today's bags, counting bags that went back on sale after a cancellation. */
  places: Place[];
};

const OrdersContext = createContext<OrdersState | null>(null);

/**
 * The signed-in customer's orders. In memory until napita-backend exists: the
 * demo customer gets sample orders, new customers start with none.
 */
export function OrdersProvider({ children }: { children: ReactNode }) {
  const { account } = useAccount();
  const demo = !!account?.demo;
  const [upcoming, setUpcoming] = useState(() => (demo ? sampleUpcoming : []));
  const [past, setPast] = useState(() => (demo ? samplePast : []));
  // Bags back on sale per place after cancellations (decision 0010).
  const [returned, setReturned] = useState<Record<string, number>>({});

  // Start over when someone else signs in.
  const [owner, setOwner] = useState(account?.phone);
  if (owner !== account?.phone) {
    setOwner(account?.phone);
    setUpcoming(demo ? sampleUpcoming : []);
    setPast(demo ? samplePast : []);
    setReturned({});
  }

  const cancelOrder = useCallback(
    (id: string) => {
      const order = upcoming.find((o) => o.id === id);
      if (!order) return;
      setUpcoming((all) => all.filter((o) => o.id !== id));
      setReturned((r) => ({ ...r, [order.placeId]: (r[order.placeId] ?? 0) + order.quantity }));
      setPast((all) => [
        { id, placeId: order.placeId, date: todayISO(), paid: order.paid, status: 'cancelled_by_customer', rated: false },
        ...all,
      ]);
    },
    [upcoming]
  );

  const places = samplePlaces.map((p) => (returned[p.id] ? { ...p, left: p.left + returned[p.id] } : p));

  return <OrdersContext.Provider value={{ upcoming, past, cancelOrder, places }}>{children}</OrdersContext.Provider>;
}

/** Places as customers see them right now (Descubrir, Mapa). */
export function usePlaces() {
  return useOrders().places;
}

export function useOrders() {
  const state = useContext(OrdersContext);
  if (!state) throw new Error('useOrders must be used inside OrdersProvider');
  return state;
}
