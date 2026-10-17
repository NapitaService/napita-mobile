import type { ColorValue } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors } from '@/theme';

// Line icons copied from napita-docs/design/canvas/ (24 × 24 viewBox).

type IconProps = { size?: number; color?: ColorValue; strokeWidth?: number; fill?: ColorValue };

function Icon({
  size = 24,
  color = colors.ink,
  strokeWidth = 1.8,
  fill = 'none',
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round">
      {children}
    </Svg>
  );
}

export const HomeIcon = (p: IconProps) => (
  <Icon {...p}>
    <Path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
  </Icon>
);

export const PinIcon = (p: IconProps) => (
  <Icon {...p}>
    <Path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
    <Circle cx="12" cy="9.5" r="2.5" />
  </Icon>
);

export const BagIcon = (p: IconProps) => (
  <Icon {...p}>
    <Path d="M5 8h14l-1 12H6z" />
    <Path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </Icon>
);

/** The smiling bag from the Welcome screen. */
export const LogoBagIcon = (p: IconProps) => (
  <Icon {...p}>
    <Path d="M5 8h14l-1 12H6z" />
    <Path d="M9 8V6a3 3 0 0 1 6 0v2" />
    <Path d="M9.5 13.5c1.4 1.6 3.6 1.6 5 0" />
  </Icon>
);

export const HeartIcon = (p: IconProps) => (
  <Icon {...p}>
    <Path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
  </Icon>
);

export const PersonIcon = (p: IconProps) => (
  <Icon {...p}>
    <Circle cx="12" cy="8" r="4" />
    <Path d="M4 21a8 8 0 0 1 16 0" />
  </Icon>
);

export const ChartIcon = (p: IconProps) => (
  <Icon {...p}>
    <Path d="M4 20V11M10 20V5M16 20v-6M2 20h20" />
  </Icon>
);

export const CheckCircleIcon = (p: IconProps) => (
  <Icon {...p}>
    <Circle cx="12" cy="12" r="9" />
    <Path d="m8 12 3 3 5-6" />
  </Icon>
);

export const StorefrontIcon = (p: IconProps) => (
  <Icon {...p}>
    <Path d="M4 9h16l-1-5H5z" />
    <Path d="M5 9v11h14V9" />
    <Path d="M10 20v-6h4v6" />
  </Icon>
);

export const BellIcon = (p: IconProps) => (
  <Icon {...p}>
    <Path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" />
    <Path d="M10 20.5a2 2 0 0 0 4 0" />
  </Icon>
);

export const SearchIcon = (p: IconProps) => (
  <Icon strokeWidth={2} {...p}>
    <Circle cx="11" cy="11" r="7" />
    <Path d="m20 20-3.5-3.5" />
  </Icon>
);

export const ChevronDownIcon = (p: IconProps) => (
  <Icon strokeWidth={2.2} {...p}>
    <Path d="m6 9 6 6 6-6" />
  </Icon>
);

export const ChevronRightIcon = (p: IconProps) => (
  <Icon strokeWidth={2} {...p}>
    <Path d="m9 6 6 6-6 6" />
  </Icon>
);

export const ChevronLeftIcon = (p: IconProps) => (
  <Icon strokeWidth={2.2} {...p}>
    <Path d="m15 6-6 6 6 6" />
  </Icon>
);

export const CloseIcon = (p: IconProps) => (
  <Icon strokeWidth={2.2} {...p}>
    <Path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);

export const CheckIcon = (p: IconProps) => (
  <Icon strokeWidth={2.6} {...p}>
    <Path d="m5 12 5 5 9-10" />
  </Icon>
);

export const PlusIcon = (p: IconProps) => (
  <Icon strokeWidth={2.2} {...p}>
    <Path d="M12 5v14M5 12h14" />
  </Icon>
);

export const ChatIcon = (p: IconProps) => (
  <Icon {...p}>
    <Path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z" />
  </Icon>
);

export const WarningIcon = (p: IconProps) => (
  <Icon strokeWidth={2} {...p}>
    <Path d="M12 3 2 20h20z" />
    <Path d="M12 10v4M12 17h.01" />
  </Icon>
);

export const ScanIcon = (p: IconProps) => (
  <Icon strokeWidth={1.9} {...p}>
    <Path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" />
    <Path d="M7 12h10" />
  </Icon>
);

export const FlashlightIcon = (p: IconProps) => (
  <Icon {...p}>
    <Path d="M8 2h8l-1 6H9z" />
    <Path d="M9 8v12a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V8" />
    <Path d="M12 12v2" />
  </Icon>
);

export const AlertCircleIcon = (p: IconProps) => (
  <Icon strokeWidth={2.4} {...p}>
    <Path d="M12 7v6M12 17h.01" />
    <Circle cx="12" cy="12" r="9" />
  </Icon>
);

export const FiltersIcon = (p: IconProps) => (
  <Icon {...p}>
    <Path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
    <Circle cx="16" cy="6" r="2" />
    <Circle cx="10" cy="12" r="2" />
    <Circle cx="18" cy="18" r="2" />
  </Icon>
);

export const GlobeIcon = (p: IconProps) => (
  <Icon {...p}>
    <Circle cx="12" cy="12" r="9" />
    <Path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
  </Icon>
);

export const CoinsIcon = (p: IconProps) => (
  <Icon {...p}>
    <Circle cx="9" cy="9" r="6" />
    <Path d="M15.5 9.6a6 6 0 1 1-6 6" />
  </Icon>
);

export const CardIcon = (p: IconProps) => (
  <Icon {...p}>
    <Rect x="3" y="6" width="18" height="13" rx="2" />
    <Path d="M3 10h18M7 15h3" />
  </Icon>
);

/** From ShopOnboardHours ("Los datos de pago los agregas después"). */
export const InfoIcon = (p: IconProps) => (
  <Icon strokeWidth={1.9} {...p}>
    <Circle cx="12" cy="12" r="9" />
    <Path d="M12 11v5M12 8h.01" />
  </Icon>
);
