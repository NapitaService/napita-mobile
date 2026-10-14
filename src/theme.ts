/**
 * Design tokens from napita-docs/design/README.md ("Visual basics").
 * Extra neutrals are copied from the canvas files in napita-docs/design/canvas/.
 */
export const colors = {
  green: '#1F6F4A', // primary buttons, active tab, prices
  ink: '#14251D', // text, business-mode header
  yellow: '#F6C453', // accents, "Modo negocio" badge, scan frame
  orange: '#C2410C', // "Quedan 3", time running out
  mist: '#F3F5F2', // screen background
  grey: '#5B6B63', // secondary text
  white: '#FFFFFF',

  // Neutrals used across the canvas
  greenTint: '#EEF3EF', // chips, soft buttons, segmented controls
  segment: '#E2E7E2', // Pedidos tab switch background
  border: '#E4E7E3', // card and tab bar borders
  divider: '#EEF0ED', // list row separators
  chipBorder: '#D5DBD6',
  dashed: '#B8C4BC',
  segmentText: '#3F4D46',
  danger: '#B42318', // "Cerrar sesión"
  mapLand: '#E8EDE4',
  mapPark: '#D3E2CC',
  userDot: '#2F6FDB',
  black: '#000000', // "Continuar con Apple" (Apple's button rules)
} as const;

/** Font family names, as registered in src/app/_layout.tsx. */
export const fonts = {
  display: 'BricolageGrotesque_800ExtraBold', // titles, big numbers
  regular: 'Figtree_400Regular',
  medium: 'Figtree_500Medium',
  semibold: 'Figtree_600SemiBold',
  bold: 'Figtree_700Bold',
  extrabold: 'Figtree_800ExtraBold', // prices
} as const;

/** Minimum touch target (CLAUDE.md rule 5). */
export const MIN_TOUCH = 44;
