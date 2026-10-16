import { booleanAttribute, Directive, input } from '@angular/core';
import { DcButtonBase } from './button-base';

/**
 * Round icon-only button. Neutral by default; set `color` for a role color.
 *
 * Bind `selected` to make it a toggle: it sets `aria-pressed` and shows the
 * selected (soft primary-100) style. Leave it unset for a plain action.
 *
 * Always give it an `aria-label`.
 *
 * @example
 * ```html
 * <button dc-btn-icon type="button" aria-label="More">…</button>
 * <button dc-btn-icon type="button" aria-label="Bold" [selected]="bold()">…</button>
 * ```
 */
@Directive({
  selector: 'button[dc-btn-icon], a[dc-btn-icon]',
  host: {
    class: 'dc-btn-icon',
    '[class.dc-btn-selected]': 'selected() === true',
    '[attr.aria-pressed]': 'selected()',
  },
})
export class DcIconButton extends DcButtonBase {
  /**
   * Toggle state.
   *
   * - `null` (default) — not a toggle, no `aria-pressed`
   * - `false` — toggle, off
   * - `true` — toggle, on
   */
  readonly selected = input(null, {
    transform: (value: unknown): boolean | null => (value == null ? null : booleanAttribute(value)),
  });
}
