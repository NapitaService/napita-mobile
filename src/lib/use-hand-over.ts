import { router } from 'expo-router';

import { useBusiness } from '@/settings/business';

/**
 * Checks a pickup code (typed, or read from the customer's QR) and goes to the
 * right screen: "Entregado" if it matches a waiting order, otherwise the error
 * screen (design/flows/entregas.md). `code` is null when a scanned QR isn't ours.
 */
export function useHandOver() {
  const { pickups, handOver } = useBusiness();

  return (code: string | null, { fromScanner = false } = {}) => {
    // From the scanner, replace it so closing the result goes back to Entregas.
    const go = fromScanner ? router.replace : router.push;
    const pickup = code ? pickups.find((p) => p.code === code) : undefined;

    if (pickup && !pickup.delivered) {
      handOver(pickup.id);
      go({ pathname: '/entrega/entregado', params: { id: pickup.id } });
    } else if (pickup) {
      go({ pathname: '/entrega/codigo-incorrecto', params: { already: pickup.id } });
    } else {
      go({ pathname: '/entrega/codigo-incorrecto', params: code ? { code } : { notOurs: '1' } });
    }
  };
}
