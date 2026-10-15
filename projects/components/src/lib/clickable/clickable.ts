import { Directive, ElementRef, inject } from '@angular/core';
import { DcDisabled } from '../disabled';

/** Elements that are already interactive (focusable, keyboard-activated) without help. */
const NATIVE_INTERACTIVE = new Set(['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'SUMMARY']);

/**
 * Makes any element behave like a button: pointer cursor, `disabled`, and, on
 * elements that are not interactive by themselves (`<div>`, `<li>`…), focus,
 * `role="button"`, and Enter/Space activation.
 *
 * Composes `dc-disabled`, so `disabled` is available wherever this is.
 *
 * @example
 * ```html
 * <li dc-clickable (click)="open(row)" [disabled]="row.locked">{{ row.name }}</li>
 * ```
 */
@Directive({
  selector: '[dc-clickable]',
  hostDirectives: [{ directive: DcDisabled, inputs: ['disabled'] }],
  host: {
    class: 'cursor-pointer aria-disabled:cursor-default',
    '[attr.role]': 'needsRole ? "button" : null',
    '(keydown)': 'onKeydown($event)',
    '(keyup)': 'onKeyup($event)',
  },
})
export class DcClickable {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly disabledState = inject(DcDisabled, { self: true });

  private readonly isNative =
    NATIVE_INTERACTIVE.has(this.host.tagName) ||
    (this.host.tagName === 'A' && this.host.hasAttribute('href'));

  /** Only add a role when the element is not interactive and the app gave none. */
  protected readonly needsRole = !this.isNative && !this.host.hasAttribute('role');

  constructor() {
    if (!this.isNative) {
      this.disabledState.enabledTabIndex.set(0);
    }
  }

  /** Enter activates on key down, like a native button. */
  protected onKeydown(event: KeyboardEvent): void {
    if (this.isNative || this.disabledState.disabled()) {
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      this.host.click();
    } else if (event.key === ' ') {
      // Stop the page from scrolling; activation happens on key up.
      event.preventDefault();
    }
  }

  /** Space activates on key up, like a native button. */
  protected onKeyup(event: KeyboardEvent): void {
    if (!this.isNative && !this.disabledState.disabled() && event.key === ' ') {
      this.host.click();
    }
  }
}
