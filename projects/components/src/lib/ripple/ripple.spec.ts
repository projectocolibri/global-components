import { Component, Directive, inject, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DcClickable } from '../clickable';
import { DcDisabled } from '../disabled';
import { DcRipple } from './index';

/** Composes both behaviors on one element, as the buttons do. */
@Directive({
  selector: '[probe]',
  hostDirectives: [DcClickable, DcRipple],
})
class Probe {
  readonly clickable = inject(DcClickable, { self: true });
  readonly ripple = inject(DcRipple, { self: true });
}

@Component({
  imports: [Probe, DcRipple],
  template: `
    <div probe id="probe" [disabled]="disabled()" (click)="clicks.update((n) => n + 1)">Probe</div>
    <div dc-ripple id="ripple" [disabled]="disabled()">Ripple</div>
  `,
})
class ProbeHost {
  readonly probe = viewChild.required(Probe);
  readonly disabled = signal(false);
  readonly clicks = signal(0);
}

describe('clickable + ripple', () => {
  async function setup() {
    await TestBed.configureTestingModule({ imports: [ProbeHost] }).compileComponents();
    const fixture = TestBed.createComponent(ProbeHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const el = (id: string) =>
      (fixture.nativeElement as HTMLElement).querySelector(`#${id}`) as HTMLElement;
    const refresh = async () => {
      fixture.detectChanges();
      await fixture.whenStable();
    };
    return { host: fixture.componentInstance, el, refresh };
  }

  function press(target: HTMLElement): void {
    target.dispatchEvent(
      new PointerEvent('pointerdown', { button: 0, clientX: 5, clientY: 5, bubbles: true }),
    );
  }

  it('makes a div focusable and keyboard-activated, and turns it off when disabled', async () => {
    const { host, el, refresh } = await setup();
    const probe = el('probe');
    expect(probe.getAttribute('role')).toBe('button');
    expect(probe.getAttribute('tabindex')).toBe('0');

    probe.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    probe.dispatchEvent(new KeyboardEvent('keyup', { key: ' ' }));
    expect(host.clicks()).toBe(2);

    host.disabled.set(true);
    await refresh();
    expect(probe.getAttribute('tabindex')).toBe('-1');
    expect(probe.getAttribute('aria-disabled')).toBe('true');

    probe.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    probe.click();
    expect(host.clicks()).toBe(2);
  });

  it('adds a wave on press, and none while disabled', async () => {
    const { host, el, refresh } = await setup();
    const ripple = el('ripple');
    expect(ripple.classList.contains('dc-ripple')).toBe(true);

    press(ripple);
    expect(ripple.querySelectorAll('.dc-ripple-wave').length).toBe(1);

    host.disabled.set(true);
    await refresh();
    press(ripple);
    expect(ripple.querySelectorAll('.dc-ripple-wave').length).toBe(1);
  });

  it('shares one disabled state when composed together', async () => {
    const { host, el, refresh } = await setup();
    type WithState = { disabledState: DcDisabled };
    const probe = host.probe();
    expect((probe.clickable as unknown as WithState).disabledState).toBe(
      (probe.ripple as unknown as WithState).disabledState,
    );

    host.disabled.set(true);
    await refresh();
    press(el('probe'));
    expect(el('probe').querySelectorAll('.dc-ripple-wave').length).toBe(0);
  });
});
