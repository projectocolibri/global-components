import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, inject } from '@angular/core';
import { DcDisabled } from '../disabled';

/**
 * Ink ripple from the pointer position on press, in the element's text color.
 *
 * Composes `dc-disabled`: no ripple while disabled. Also skipped when the user
 * prefers reduced motion. Styles live in `ripple.css` (`dc-ripple`, `dc-ripple-wave`).
 *
 * @example
 * ```html
 * <div dc-ripple class="rounded-xl p-4">Press me</div>
 * ```
 */
@Directive({
  selector: '[dc-ripple]',
  hostDirectives: [{ directive: DcDisabled, inputs: ['disabled'] }],
  host: {
    class: 'dc-ripple',
    '(pointerdown)': 'onPointerDown($event)',
  },
})
export class DcRipple {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  private readonly disabledState = inject(DcDisabled, { self: true });

  protected onPointerDown(event: PointerEvent): void {
    if (event.button !== 0 || this.disabledState.disabled() || this.prefersReducedMotion()) {
      return;
    }
    const rect = this.host.getBoundingClientRect();
    // Big enough to cover the farthest corner from any press point.
    const size = Math.hypot(rect.width, rect.height) * 2;
    const wave = this.document.createElement('span');
    wave.className = 'dc-ripple-wave';
    wave.style.width = wave.style.height = `${size}px`;
    wave.style.left = `${event.clientX - rect.left - size / 2}px`;
    wave.style.top = `${event.clientY - rect.top - size / 2}px`;
    wave.addEventListener('animationend', () => wave.remove(), { once: true });
    this.host.appendChild(wave);
  }

  private prefersReducedMotion(): boolean {
    return this.document.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }
}
