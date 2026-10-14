import { booleanAttribute, computed, Directive, input } from '@angular/core';

const BUTTON_BASE_CLASS =
  'inline-flex items-center justify-center border-button font-sans text-button font-bold w-auto';

type ButtonAppearance =
  | 'filled'
  | 'tonal'
  | 'elevated'
  | 'outlined'
  | 'text'
  | 'icon'
  | 'fab'
  | 'mini-fab'
  | 'extended-fab';

type ButtonVariant = 'primary' | 'secondary' | 'error';

type ButtonRounded = 'none' | 'sm' | 'md' | 'lg' | 'full';

/**
 * Styles a native `<button>` as a Deltafil button.
 *
 * Use on a `button` only: `button[deltafilButton]`.
 * By default the button is only as wide as its label; add `grow` to fill
 * the space given by a flex parent. Add `shadow` for a token-based drop shadow
 * on appearances that do not elevate by default.
 *
 * @example
 * ```html
 * <button deltafilButton type="button">Filled</button>
 * <button deltafilButton type="button" appearance="text" rounded="full">Text</button>
 * <button deltafilButton type="button" appearance="outlined" variant="secondary">Outlined</button>
 * <button deltafilButton type="button" appearance="fab" rounded="lg" aria-label="Add">…</button>
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
   * Visual chrome / emphasis of the button.
   *
   * - `'filled'` (default) — solid background
   * - `'tonal'` — soft filled background
   * - `'elevated'` — surface background with shadow
   * - `'outlined'` — border, no fill
   * - `'text'` — label only; soft fill on hover
   * - `'icon'` — icon hit target; soft fill on hover
   * - `'fab'` — large floating action button
   * - `'mini-fab'` — compact floating action button
   * - `'extended-fab'` — floating action button with icon + label
   */
  readonly appearance = input<ButtonAppearance>('filled');

  /**
   * Color / meaning of the button.
   *
   * - `'primary'` (default) — main action (brand color)
   * - `'secondary'` — secondary action (neutral)
   * - `'error'` — destructive or dangerous action
   */
  readonly variant = input<ButtonVariant>('primary');

  /**
   * Corner radius of the button.
   *
   * - `'none'` — square corners
   * - `'sm'` — small radius
   * - `'md'` (default) — medium radius
   * - `'lg'` — large radius
   * - `'full'` — pill / fully rounded
   */
  readonly rounded = input<ButtonRounded>('md');

  /**
   * Expand the button to fill available space in a flex row/column.
   *
   * Use as `grow` or `[grow]="true"`.
   *
   * - `false` (default) — only as wide as the content
   * - `true` — grow to fill the parent’s free space
   */
  readonly grow = input(false, { transform: booleanAttribute });

  /**
   * Show a drop shadow using the button shadow token.
   *
   * Use as `shadow` or `[shadow]="true"`.
   * Elevated and FAB appearances always include a shadow.
   *
   * - `false` (default) — flat (unless appearance elevates by default)
   * - `true` — apply `shadow-button`
   */
  readonly shadow = input(false, { transform: booleanAttribute });

  readonly hostClass = computed(() =>
    [
      BUTTON_BASE_CLASS,
      appearanceClass(this.appearance(), this.variant()),
      roundedClass(this.rounded()),
      shadowClass(this.appearance(), this.shadow()),
      this.grow() ? 'flex-1 min-w-0 w-container-full' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );
}

function appearanceClass(appearance: ButtonAppearance, variant: ButtonVariant): string {
  return `${geometryClass(appearance)} ${colorClass(appearance, variant)}`;
}

function geometryClass(appearance: ButtonAppearance): string {
  switch (appearance) {
    case 'filled':
    case 'tonal':
    case 'elevated':
    case 'text':
      return 'border-transparent px-button-x py-button-y';
    case 'outlined':
      return 'px-button-x py-button-y';
    case 'icon':
      return 'border-transparent p-button-icon';
    case 'fab':
      return 'border-transparent size-button-fab p-0';
    case 'mini-fab':
      return 'border-transparent size-button-mini-fab p-0';
    case 'extended-fab':
      return 'border-transparent gap-2 px-button-extended-x py-button-y';
    default: {
      const _exhaustive: never = appearance;
      return _exhaustive;
    }
  }
}

function colorClass(appearance: ButtonAppearance, variant: ButtonVariant): string {
  switch (appearance) {
    case 'filled':
      return filledColorClass(variant);
    case 'tonal':
    case 'fab':
    case 'mini-fab':
    case 'extended-fab':
      return tonalColorClass(variant);
    case 'elevated':
      return elevatedColorClass(variant);
    case 'outlined':
      return outlinedColorClass(variant);
    case 'text':
    case 'icon':
      return textColorClass(variant);
    default: {
      const _exhaustive: never = appearance;
      return _exhaustive;
    }
  }
}

function filledColorClass(variant: ButtonVariant): string {
  switch (variant) {
    case 'primary':
      return 'bg-primary-500 text-secondary-50 hover:bg-primary-600 disabled:bg-secondary-200 disabled:text-secondary-400 disabled:hover:bg-secondary-200';
    case 'secondary':
      return 'bg-secondary-500 text-secondary-50 hover:bg-secondary-600 disabled:bg-secondary-200 disabled:text-secondary-400 disabled:hover:bg-secondary-200';
    case 'error':
      return 'bg-error-500 text-error-50 hover:bg-error-600 disabled:bg-secondary-200 disabled:text-secondary-400 disabled:hover:bg-secondary-200';
    default: {
      const _exhaustive: never = variant;
      return _exhaustive;
    }
  }
}

function tonalColorClass(variant: ButtonVariant): string {
  switch (variant) {
    case 'primary':
      return 'bg-primary-100 text-primary-700 hover:bg-primary-200 disabled:bg-secondary-100 disabled:text-secondary-400 disabled:hover:bg-secondary-100';
    case 'secondary':
      return 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200 disabled:bg-secondary-100 disabled:text-secondary-400 disabled:hover:bg-secondary-100';
    case 'error':
      return 'bg-error-100 text-error-700 hover:bg-error-200 disabled:bg-secondary-100 disabled:text-secondary-400 disabled:hover:bg-secondary-100';
    default: {
      const _exhaustive: never = variant;
      return _exhaustive;
    }
  }
}

function elevatedColorClass(variant: ButtonVariant): string {
  switch (variant) {
    case 'primary':
      return 'bg-background-50 text-primary-500 hover:bg-background-100 disabled:bg-secondary-100 disabled:text-secondary-400 disabled:hover:bg-secondary-100';
    case 'secondary':
      return 'bg-background-50 text-secondary-500 hover:bg-background-100 disabled:bg-secondary-100 disabled:text-secondary-400 disabled:hover:bg-secondary-100';
    case 'error':
      return 'bg-background-50 text-error-500 hover:bg-background-100 disabled:bg-secondary-100 disabled:text-secondary-400 disabled:hover:bg-secondary-100';
    default: {
      const _exhaustive: never = variant;
      return _exhaustive;
    }
  }
}

function outlinedColorClass(variant: ButtonVariant): string {
  switch (variant) {
    case 'primary':
      return 'bg-transparent border-primary-500 text-primary-500 hover:bg-primary-50 disabled:border-secondary-200 disabled:text-secondary-300 disabled:hover:bg-transparent';
    case 'secondary':
      return 'bg-transparent border-secondary-500 text-secondary-500 hover:bg-secondary-50 disabled:border-secondary-200 disabled:text-secondary-300 disabled:hover:bg-transparent';
    case 'error':
      return 'bg-transparent border-error-500 text-error-500 hover:bg-error-50 disabled:border-secondary-200 disabled:text-secondary-300 disabled:hover:bg-transparent';
    default: {
      const _exhaustive: never = variant;
      return _exhaustive;
    }
  }
}

function textColorClass(variant: ButtonVariant): string {
  switch (variant) {
    case 'primary':
      return 'bg-transparent text-primary-500 hover:bg-primary-100 disabled:text-secondary-300 disabled:hover:bg-transparent';
    case 'secondary':
      return 'bg-transparent text-secondary-500 hover:bg-secondary-100 disabled:text-secondary-300 disabled:hover:bg-transparent';
    case 'error':
      return 'bg-transparent text-error-500 hover:bg-error-100 disabled:text-secondary-300 disabled:hover:bg-transparent';
    default: {
      const _exhaustive: never = variant;
      return _exhaustive;
    }
  }
}

function roundedClass(rounded: ButtonRounded): string {
  switch (rounded) {
    case 'none':
      return '';
    case 'sm':
      return 'rounded-button-sm';
    case 'md':
      return 'rounded-button-md';
    case 'lg':
      return 'rounded-button-lg';
    case 'full':
      return 'rounded-button-full';
    default: {
      const _exhaustive: never = rounded;
      return _exhaustive;
    }
  }
}

function shadowClass(appearance: ButtonAppearance, shadow: boolean): string {
  switch (appearance) {
    case 'elevated':
    case 'fab':
    case 'mini-fab':
    case 'extended-fab':
      return 'shadow-button';
    case 'filled':
    case 'tonal':
    case 'outlined':
    case 'text':
    case 'icon':
      return shadow ? 'shadow-button' : '';
    default: {
      const _exhaustive: never = appearance;
      return _exhaustive;
    }
  }
}
