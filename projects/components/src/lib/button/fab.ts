import { Directive } from '@angular/core';
import { DcButtonBase } from './button-base';

/**
 * Floating action button: the screen's primary action, as a large square icon.
 *
 * Always give it an `aria-label`.
 *
 * @example
 * ```html
 * <button dc-btn-fab type="button" aria-label="New">…</button>
 * ```
 */
@Directive({
  selector: 'button[dc-btn-fab], a[dc-btn-fab]',
  host: { class: 'dc-btn-fab' },
})
export class DcFab extends DcButtonBase {}

/**
 * Small floating action button, for compact layouts or secondary FABs.
 *
 * @example
 * ```html
 * <button dc-btn-mini-fab type="button" aria-label="Menu">…</button>
 * ```
 */
@Directive({
  selector: 'button[dc-btn-mini-fab], a[dc-btn-mini-fab]',
  host: { class: 'dc-btn-mini-fab' },
})
export class DcMiniFab extends DcButtonBase {}

/**
 * Extended floating action button: icon plus label.
 *
 * @example
 * ```html
 * <button dc-btn-extended-fab type="button"><svg …/> Compose</button>
 * ```
 */
@Directive({
  selector: 'button[dc-btn-extended-fab], a[dc-btn-extended-fab]',
  host: { class: 'dc-btn-extended-fab' },
})
export class DcExtendedFab extends DcButtonBase {}
