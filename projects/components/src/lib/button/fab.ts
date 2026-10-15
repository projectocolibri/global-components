import { Directive } from '@angular/core';
import { DcButtonBase } from './button-base';

/**
 * Floating action button: the screen's primary action, as a large square icon.
 *
 * Always give it an `aria-label`.
 *
 * @example
 * ```html
 * <button dc-fab type="button" aria-label="New">…</button>
 * ```
 */
@Directive({
  selector: 'button[dc-fab], a[dc-fab]',
  host: { class: 'dc-btn-fab' },
})
export class DcFab extends DcButtonBase {}

/**
 * Small floating action button, for compact layouts or secondary FABs.
 *
 * @example
 * ```html
 * <button dc-mini-fab type="button" aria-label="Menu">…</button>
 * ```
 */
@Directive({
  selector: 'button[dc-mini-fab], a[dc-mini-fab]',
  host: { class: 'dc-btn-mini-fab' },
})
export class DcMiniFab extends DcButtonBase {}

/**
 * Extended floating action button: icon plus label.
 *
 * @example
 * ```html
 * <button dc-extended-fab type="button"><svg …/> Compose</button>
 * ```
 */
@Directive({
  selector: 'button[dc-extended-fab], a[dc-extended-fab]',
  host: { class: 'dc-btn-extended-fab' },
})
export class DcExtendedFab extends DcButtonBase {}
