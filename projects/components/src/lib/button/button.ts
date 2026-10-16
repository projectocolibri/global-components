import { Directive } from '@angular/core';
import { DcButtonBase } from './button-base';

/**
 * Default button: same as `dc-btn-filled`, for the main action.
 *
 * @example
 * ```html
 * <button dc-btn type="button">Save</button>
 * <a dc-btn href="/docs">Docs</a>
 * ```
 */
@Directive({
  selector: 'button[dc-btn], a[dc-btn]',
  host: { class: 'dc-btn-filled' },
})
export class DcButton extends DcButtonBase {}

/**
 * Text button: label only, tinted on hover. Lowest emphasis.
 *
 * @example
 * ```html
 * <button dc-btn-text type="button">Cancel</button>
 * <a dc-btn-text href="/docs">Docs</a>
 * ```
 */
@Directive({
  selector: 'button[dc-btn-text], a[dc-btn-text]',
  host: { class: 'dc-btn-text' },
})
export class DcButtonText extends DcButtonBase {}

/**
 * Filled button: solid role color. Highest emphasis, for the main action.
 *
 * @example
 * ```html
 * <button dc-btn-filled type="button">Save</button>
 * <button dc-btn-filled type="button" color="error">Delete</button>
 * ```
 */
@Directive({
  selector: 'button[dc-btn-filled], a[dc-btn-filled]',
  host: { class: 'dc-btn-filled' },
})
export class DcFilledButton extends DcButtonBase {}

/**
 * Outlined button: border, no fill. Medium emphasis.
 *
 * @example
 * ```html
 * <button dc-btn-outlined type="button">Back</button>
 * ```
 */
@Directive({
  selector: 'button[dc-btn-outlined], a[dc-btn-outlined]',
  host: { class: 'dc-btn-outlined' },
})
export class DcOutlinedButton extends DcButtonBase {}

/**
 * Elevated button: surface color with a shadow, for buttons over images or
 * patterned backgrounds.
 *
 * @example
 * ```html
 * <button dc-btn-elevated type="button">Open</button>
 * ```
 */
@Directive({
  selector: 'button[dc-btn-elevated], a[dc-btn-elevated]',
  host: { class: 'dc-btn-elevated' },
})
export class DcElevatedButton extends DcButtonBase {}
