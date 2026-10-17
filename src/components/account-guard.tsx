import { Redirect } from 'expo-router';
import type { ReactNode } from 'react';

import { homeFor, useAccount, type AccountType } from '@/settings/account';

/**
 * Shows `children` only to a signed-in account of the given type. Anyone else
 * goes to the Welcome / login screen or to their own side of the app
 * (decision 0005: switching sides means logging out).
 */
export function AccountGuard({ type, children }: { type: AccountType; children: ReactNode }) {
  const { ready, account } = useAccount();
  if (!ready) return null;
  if (!account) return <Redirect href="/" />;
  if (account.type !== type || (type === 'business' && !account.business)) return <Redirect href={homeFor(account)} />;
  return children;
}
