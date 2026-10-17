import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import type { BagType } from '@/data/business';

const ACCOUNTS_KEY = 'napita.accounts';
const SESSION_KEY = 'napita.session';

/** Chosen when the account is created; switching means logging out (decision 0005). */
export type AccountType = 'customer' | 'business';

/** The business types offered at sign-up (design/canvas/ShopOnboardDetails). */
export type BusinessType = 'bakery' | 'restaurant' | 'cafe' | 'pastry' | 'market' | 'other';
export const BUSINESS_TYPES: BusinessType[] = ['bakery', 'restaurant', 'cafe', 'pastry', 'market', 'other'];

/** The bag category each business type pre-fills in "Nueva bolsa". */
export const BAG_TYPE_FOR: Record<BusinessType, BagType> = {
  bakery: 'bakery',
  restaurant: 'prepared',
  cafe: 'cafeSnacks',
  pastry: 'pastry',
  market: 'produce',
  other: 'mixed',
};

/**
 * What a business gives at sign-up (decision 0011). Times are "HH:MM" (24 h),
 * days are 0 = Monday … 6 = Sunday. The same hours apply on every open day.
 */
export type BusinessProfile = {
  name: string;
  type: BusinessType;
  address: string;
  openDays: number[];
  opens: string;
  closes: string;
  /** Default pickup window for new bags; always inside the opening hours. */
  pickupFrom: string;
  pickupTo: string;
};

export type Account = {
  /** 10 Colombian digits, without +57. Also the business's contact number. */
  phone: string;
  type: AccountType;
  /** Customer's first name; empty for business accounts. */
  name: string;
  /** Missing until a new business finishes the two sign-up steps. */
  business?: BusinessProfile;
  /** Demo accounts come with sample orders (see README). */
  demo?: boolean;
};

/** Defaults used at sign-up (decision 0011). */
export const DEFAULT_HOURS = {
  openDays: [0, 1, 2, 3, 4, 5],
  opens: '07:00',
  closes: '21:00',
  pickupFrom: '18:00',
  pickupTo: '19:00',
};

/** Two accounts to try the app with, listed in the README. Any 6 digits work as the code. */
export const DEMO_ACCOUNTS: Account[] = [
  { phone: '3000000001', type: 'customer', name: 'Ana', demo: true },
  {
    phone: '3000000002',
    type: 'business',
    name: '',
    demo: true,
    business: { name: 'Panadería La Espiga', type: 'bakery', address: 'Cra. 13 #85-32, Bogotá', ...DEFAULT_HOURS },
  },
];

type AccountState = {
  /** False until the saved session has been read. */
  ready: boolean;
  /** The signed-in account, or null on the Welcome / login screens. */
  account: Account | null;
  findAccount: (phone: string) => Account | undefined;
  /** Adds the account and signs it in. */
  createAccount: (account: Account) => void;
  signIn: (phone: string) => void;
  /** Ends the session; the account stays registered on this phone. */
  signOut: () => void;
  /** Saves the signed-in business's details and hours. */
  saveBusiness: (business: BusinessProfile) => void;
};

const AccountContext = createContext<AccountState | null>(null);

/**
 * Accounts and the current session. Until napita-backend exists these only
 * live on this phone: no code is really sent or checked.
 */
export function AccountProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>(DEMO_ACCOUNTS);
  const [phone, setPhone] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(ACCOUNTS_KEY), AsyncStorage.getItem(SESSION_KEY)])
      .then(([savedAccounts, savedPhone]) => {
        if (savedAccounts) setAccounts(withDemos(JSON.parse(savedAccounts)));
        if (savedPhone) setPhone(savedPhone);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const saveAccounts = (next: Account[]) => {
    setAccounts(next);
    AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(next.filter((a) => !a.demo))).catch(() => {});
  };

  const startSession = (next: string | null) => {
    setPhone(next);
    (next ? AsyncStorage.setItem(SESSION_KEY, next) : AsyncStorage.removeItem(SESSION_KEY)).catch(() => {});
  };

  const findAccount = useCallback((p: string) => accounts.find((a) => a.phone === p), [accounts]);

  const createAccount = (account: Account) => {
    saveAccounts([...accounts.filter((a) => a.phone !== account.phone), account]);
    startSession(account.phone);
  };

  const saveBusiness = (business: BusinessProfile) => {
    saveAccounts(accounts.map((a) => (a.phone === phone ? { ...a, business } : a)));
  };

  const account = (phone && accounts.find((a) => a.phone === phone)) || null;

  return (
    <AccountContext.Provider
      value={{
        ready,
        account,
        findAccount,
        createAccount,
        signIn: startSession,
        signOut: () => startSession(null),
        saveBusiness,
      }}>
      {children}
    </AccountContext.Provider>
  );
}

/** Saved accounts plus the demo accounts (demos aren't saved, so they always match the code). */
function withDemos(saved: Account[]) {
  return [...DEMO_ACCOUNTS, ...saved.filter((a) => !DEMO_ACCOUNTS.some((d) => d.phone === a.phone))];
}

export function useAccount() {
  const state = useContext(AccountContext);
  if (!state) throw new Error('useAccount must be used inside AccountProvider');
  return state;
}

/** Where an account lands after signing in. */
export function homeFor(account: Account) {
  if (account.type === 'customer') return '/descubrir' as const;
  return account.business ? ('/hoy' as const) : ('/negocio-nuevo' as const);
}

/** "3001234567" → "300 123 4567" */
export function formatPhone(digits: string) {
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 10)].filter(Boolean).join(' ');
}
