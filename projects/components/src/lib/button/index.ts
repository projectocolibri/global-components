import {
  DcButton,
  DcButtonText,
  DcElevatedButton,
  DcFilledButton,
  DcOutlinedButton,
} from './button';
import { DcExtendedFab, DcFab, DcMiniFab } from './fab';
import { DcIconButton } from './icon-button';

export * from './button-base';
export * from './button';
export * from './icon-button';
export * from './fab';

/** Every button directive, for `imports: [DC_BUTTONS]`. */
export const DC_BUTTONS = [
  DcButton,
  DcButtonText,
  DcFilledButton,
  DcOutlinedButton,
  DcElevatedButton,
  DcIconButton,
  DcFab,
  DcMiniFab,
  DcExtendedFab,
] as const;
