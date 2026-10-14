import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

const ACCOUNT_KEY = 'napita.account';

export type Account = {
  /** Empty when the person signed in without typing a name. */
  name: string;
  /** 10 Colombian digits, without +57. */
  phone: string;
};

type AccountState = {
  account: Account | null;
  signIn: (account: Account) => void;
  signOut: () => void;
};

const AccountContext = createContext<AccountState | null>(null);

/**
 * The signed-in customer. Until napita-backend exists this only lives on the
 * phone: no code is really sent or checked.
 */
export function AccountProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ACCOUNT_KEY)
      .then((saved) => saved && setAccount(JSON.parse(saved)))
      .catch(() => {});
  }, []);

  const signIn = useCallback((next: Account) => {
    setAccount(next);
    AsyncStorage.setItem(ACCOUNT_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const signOut = useCallback(() => {
    setAccount(null);
    AsyncStorage.removeItem(ACCOUNT_KEY).catch(() => {});
  }, []);

  return <AccountContext.Provider value={{ account, signIn, signOut }}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const state = useContext(AccountContext);
  if (!state) throw new Error('useAccount must be used inside AccountProvider');
  return state;
}

/** "3001234567" → "300 123 4567" */
export function formatPhone(digits: string) {
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 10)].filter(Boolean).join(' ');
}
