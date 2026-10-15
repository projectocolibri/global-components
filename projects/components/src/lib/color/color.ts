import { Directive, input } from '@angular/core';

/** Palettes in tokens.css. */
export type DcPalette = 'primary' | 'secondary' | 'surface' | 'error' | 'warning' | 'success';

/** Steps of every palette, 50 (lightest in light mode) to 950. */
export type DcPaletteStep = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;

/** Default colors: each points at one palette step (see tokens.css). */
export type DcDefaultColor = 'background' | 'primary' | 'secondary' | 'error' | 'warning' | 'success';

/**
 * A theme color name, as accepted by `color` inputs.
 *
 * A default (`'primary'`, `'background'`…) or a palette step (`'primary-100'`,
 * `'surface-200'`…). Each maps to `--color-<name>` and has a matching
 * `--color-<name>-foreground` for text on it, so both follow the theme.
 */
export type DcColorName = DcDefaultColor | `${DcPalette}-${DcPaletteStep}`;

/**
 * Classes that paint an element from the variables set by `dc-color`:
 * background in the color, text in its foreground.
 */
export const DC_COLOR_SURFACE_CLASS = 'bg-(--dc-color) text-(--dc-color-foreground)';

/**
 * Gives an element a theme color through CSS variables, without painting it:
 * `--dc-color` (the color) and `--dc-color-foreground` (the text on it).
 *
 * Each component decides what the color means (a button's fill, a container's
 * background). The variables do not inherit (see color.css), so a colored
 * container never recolors the buttons inside it.
 *
 * @example
 * ```html
 * <div dc-color color="success-100" class="bg-(--dc-color) text-(--dc-color-foreground)">…</div>
 * ```
 */
@Directive({
  selector: '[dc-color]',
  host: {
    '[style.--dc-color]': 'token("")',
    '[style.--dc-color-foreground]': 'token("-foreground")',
  },
})
export class DcColor {
  /** Any theme color. Leave unset to keep the component's default. */
  readonly color = input<DcColorName>();

  /** `var(--color-<color><suffix>)`, or `null` (no variable) when no color is set. */
  protected token(suffix: '' | '-foreground'): string | null {
    const color = this.color();
    return color ? `var(--color-${color}${suffix})` : null;
  }
}
