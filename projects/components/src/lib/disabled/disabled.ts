import {
  afterNextRender,
  booleanAttribute,
  computed,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';

/** Elements the browser can disable natively with the `disabled` attribute. */
const NATIVE_DISABLEABLE = new Set(['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'FIELDSET', 'OPTGROUP', 'OPTION']);

/**
 * Makes any element disableable.
 *
 * - Native form controls (`<button>`, `<input>`…) get the `disabled` attribute.
 * - Everything else (`<a>`, `<div>`…) gets `aria-disabled="true"`, leaves the tab
 *   order, and swallows clicks before any `(click)` handler on the element runs.
 *
 * Other behaviors (`dc-clickable`, `dc-ripple`) and the buttons compose it, so
 * `disabled` works the same everywhere.
 *
 * @example
 * ```html
 * <a dc-disabled href="/report" [disabled]="!ready()">Report</a>
 * ```
 */
@Directive({
  selector: '[dc-disabled]',
  host: {
    '[attr.disabled]': 'isNative && disabled() ? "" : null',
    '[attr.aria-disabled]': 'disabled() || null',
    '[attr.tabindex]': 'tabIndex()',
  },
})
export class DcDisabled {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /** Whether the host is a native form control that understands `disabled`. */
  readonly isNative = NATIVE_DISABLEABLE.has(this.host.tagName);

  /**
   * Turn the element off.
   *
   * Use as `disabled` or `[disabled]="true"`.
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * Tab index while enabled. `null` keeps the element's own focus behavior;
   * behaviors that make a non-focusable element interactive (`dc-clickable`) set `0`.
   */
  readonly enabledTabIndex = signal<number | null>(null);

  protected readonly tabIndex = computed(() =>
    this.disabled() && !this.isNative ? -1 : this.enabledTabIndex(),
  );

  constructor() {
    // Native disabled controls never fire clicks. Other elements do, so block
    // them in the capture phase, before any (click) handler on the same element.
    if (this.isNative) {
      return;
    }
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const blockWhenDisabled = (event: Event) => {
        if (this.disabled()) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      };
      this.host.addEventListener('click', blockWhenDisabled, { capture: true });
      destroyRef.onDestroy(() =>
        this.host.removeEventListener('click', blockWhenDisabled, { capture: true }),
      );
    });
  }
}
