import { Directive } from '@angular/core';
import { DcClickable } from '../clickable';
import { DcColor } from '../color';
import { DcRipple } from '../ripple';

/**
 * What every dc button is made of: the `dc-btn` base class plus the shared
 * behaviors, composed as host directives:
 *
 * - `dc-color` — `color` input, any theme color (`'primary'`, `'success-600'`…)
 * - `dc-clickable` — pointer cursor; brings `dc-disabled` (`disabled` input)
 * - `dc-ripple` — ink ripple on press; shares the same `dc-disabled`
 *
 * Not used directly. Each style (`dc-button`, `dc-filled-button`, `dc-fab`, …)
 * extends it and adds its own `dc-btn-*` class through `host`. All visuals live
 * in `button.css`, so Tailwind utilities on the element (`rounded-md`, `w-full`,
 * `shadow-none`, …) override them.
 *
 * A button already includes these behaviors; do not add `dc-ripple`,
 * `dc-clickable`, or `dc-color` to it again.
 *
 * @example
 * ```ts
 * @Directive({
 *   selector: 'button[dc-danger-button], a[dc-danger-button]',
 *   host: { class: 'dc-btn-filled dc-btn-error' },
 * })
 * export class DcDangerButton extends DcButtonBase {}
 * ```
 */
@Directive({
  hostDirectives: [{ directive: DcColor, inputs: ['color'] }, DcClickable, DcRipple],
  host: { class: 'dc-btn' },
})
export abstract class DcButtonBase {}
