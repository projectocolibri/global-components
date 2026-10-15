import { Directive } from '@angular/core';
import { DcButtonBase } from './button-base';

/**
 * Text button: label only, tinted on hover. Lowest emphasis.
 *
 * @example
 * ```html
 * <button dc-button type="button">Cancel</button>
 * <a dc-button href="/docs">Docs</a>
 * ```
 */
@Directive({
  selector: 'button[dc-button], a[dc-button]',
  host: { class: 'dc-btn-text' },
})
export class DcButton extends DcButtonBase {}

/**
 * Filled button: solid role color. Highest emphasis, for the main action.
 *
 * @example
 * ```html
 * <button dc-filled-button type="button">Save</button>
 * <button dc-filled-button type="button" color="error">Delete</button>
 * ```
 */
@Directive({
  selector: 'button[dc-filled-button], a[dc-filled-button]',
  host: { class: 'dc-btn-filled' },
})
export class DcFilledButton extends DcButtonBase {}

/**
 * Tonal button: soft container color. Between filled and outlined.
 *
 * @example
 * ```html
 * <button dc-tonal-button type="button">Next</button>
 * ```
 */
@Directive({
  selector: 'button[dc-tonal-button], a[dc-tonal-button]',
  host: { class: 'dc-btn-tonal' },
})
export class DcTonalButton extends DcButtonBase {}

/**
 * Outlined button: border, no fill. Medium emphasis.
 *
 * @example
 * ```html
 * <button dc-outlined-button type="button">Back</button>
 * ```
 */
@Directive({
  selector: 'button[dc-outlined-button], a[dc-outlined-button]',
  host: { class: 'dc-btn-outlined' },
})
export class DcOutlinedButton extends DcButtonBase {}

/**
 * Elevated button: surface color with a shadow, for buttons over images or
 * patterned backgrounds.
 *
 * @example
 * ```html
 * <button dc-elevated-button type="button">Open</button>
 * ```
 */
@Directive({
  selector: 'button[dc-elevated-button], a[dc-elevated-button]',
  host: { class: 'dc-btn-elevated' },
})
export class DcElevatedButton extends DcButtonBase {}
