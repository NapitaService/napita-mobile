import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

type TodayState = {
  /** Names of businesses that turned off "Recibiendo pedidos hoy". */
  offToday: string[];
  setOffToday: (businessName: string, off: boolean) => void;
};

const TodayContext = createContext<TodayState | null>(null);

/**
 * Which businesses aren't offering bags today, shared by the business side
 * (the switch on Hoy) and the customer side (the place's card), so both can be
 * tried on one phone. Stands in for the napita-backend field; in memory only.
 * The switch never turns itself back on; only the business does (decision 0014).
 */
export function TodayProvider({ children }: { children: ReactNode }) {
  const [offToday, setOff] = useState<string[]>([]);
  const setOffToday = useCallback(
    (name: string, off: boolean) =>
      setOff((all) => (off ? [...all.filter((n) => n !== name), name] : all.filter((n) => n !== name))),
    [],
  );
  return <TodayContext.Provider value={{ offToday, setOffToday }}>{children}</TodayContext.Provider>;
}

export function useToday() {
  const state = useContext(TodayContext);
  if (!state) throw new Error('useToday must be used inside TodayProvider');
  return state;
}
