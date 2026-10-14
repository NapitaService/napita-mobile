import 'i18next';

import type esCO from './es-CO.json';

// Lets TypeScript flag any translation key that doesn't exist in es-CO.json.
declare module 'i18next' {
  interface CustomTypeOptions {
    resources: { translation: typeof esCO };
  }
}
