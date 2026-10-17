import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

import { pastOrders as samplePast, upcomingOrders as sampleUpcoming, type PastOrder, type UpcomingOrder } from '@/data/sample';
import { todayISO } from '@/lib/format';

type OrdersState = {
  upcoming: UpcomingOrder[];
  past: PastOrder[];
  /** Cancels an upcoming order; it moves to past orders as "cancelled". */
  cancelOrder: (id: string) => void;
};

const OrdersContext = createContext<OrdersState | null>(null);

/** The customer's orders. Sample data in memory until napita-backend exists. */
export function OrdersProvider({ children }: { children: ReactNode }) {
  const [upcoming, setUpcoming] = useState(sampleUpcoming);
  const [past, setPast] = useState(samplePast);

  const cancelOrder = useCallback(
    (id: string) => {
      const order = upcoming.find((o) => o.id === id);
      if (!order) return;
      setUpcoming((all) => all.filter((o) => o.id !== id));
      setPast((all) => [
        { id, placeId: order.placeId, date: todayISO(), paid: order.paid, status: 'cancelled', rated: false },
        ...all,
      ]);
    },
    [upcoming]
  );

  return <OrdersContext.Provider value={{ upcoming, past, cancelOrder }}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const state = useContext(OrdersContext);
  if (!state) throw new Error('useOrders must be used inside OrdersProvider');
  return state;
}
