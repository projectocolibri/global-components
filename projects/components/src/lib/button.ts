import { booleanAttribute, computed, Directive, input } from '@angular/core';

const BUTTON_BASE_CLASS =
  'inline-flex items-center justify-center border-button border-transparent px-button-x py-button-y font-sans text-button font-bold rounded-button w-auto';

type ButtonVariant = 'primary' | 'secondary' | 'error';

/**
 * Styles a native `<button>` as a Deltafil button.
 *
 * Use on a `button` only: `button[deltafilButton]`.
 * By default the button is only as wide as its label; add `grow` to fill
 * the space given by a flex parent.
 *
 * @example
 * ```html
 * <button deltafilButton type="button">Primary</button>
 * <button deltafilButton type="button" variant="secondary">Secondary</button>
 * <button deltafilButton type="button" variant="error" disabled>Error</button>
 * <button deltafilButton type="button" grow>Fills available space</button>
 * ```
 */
@Directive({
  selector: 'button[deltafilButton]',
  host: {
    '[class]': 'hostClass()',
    '[attr.disabled]': 'disabled() || null',
    '[attr.aria-disabled]': 'disabled() || null',
  },
})
export class DeltafilButton {
  /**
   * Turn the button off so it cannot be clicked.
   *
   * Use as `disabled` or `[disabled]="true"`.
   *
   * - `false` (default) — normal, clickable
   * - `true` — disabled (also announced to assistive tech)
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * Color / meaning of the button.
   *
   * - `'primary'` (default) — main action (brand color)
   * - `'secondary'` — secondary action (neutral)
   * - `'error'` — destructive or dangerous action
   */
  readonly variant = input<ButtonVariant>('primary');

  /**
   * Expand the button to fill available space in a flex row/column.
   *
   * Use as `grow` or `[grow]="true"`.
   *
   * - `false` (default) — only as wide as the content
   * - `true` — grow to fill the parent’s free space
   */
  readonly grow = input(false, { transform: booleanAttribute });

  readonly hostClass = computed(
    () =>
      `${BUTTON_BASE_CLASS} ${variantClass(this.variant())}${this.grow() ? ' flex-1 min-w-0 w-container-full' : ''}`,
  );
}

function variantClass(variant: ButtonVariant): string {
  switch (variant) {
    case 'primary':
      return 'bg-primary-500 text-secondary-50 hover:bg-primary-600';
    case 'secondary':
      return 'bg-secondary-500 text-secondary-50 hover:bg-secondary-600';
    case 'error':
      return 'bg-error-500 text-error-50 hover:bg-error-600';
    default: {
      const _exhaustive: never = variant;
      return _exhaustive;
    }
  }
}
