import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { DcColorName } from '../color';
import { DC_BUTTONS } from './index';

@Component({
  imports: [DC_BUTTONS],
  template: `
    <button dc-btn type="button" id="default">Default</button>
    <button dc-btn-text type="button" id="text">Text</button>
    <button dc-btn-filled type="button" id="filled" [color]="color()" [disabled]="disabled()">
      Filled
    </button>
    <button dc-btn-outlined type="button" id="outlined" class="rounded-md">Outlined</button>
    <button dc-btn-elevated type="button" id="elevated">Elevated</button>
    <button dc-btn-icon type="button" id="icon" aria-label="More"></button>
    <button dc-btn-icon type="button" id="toggle" aria-label="Bold" [selected]="selected()"></button>
    <button dc-btn-fab type="button" id="fab" aria-label="New"></button>
    <button dc-btn-mini-fab type="button" id="mini-fab" aria-label="Menu"></button>
    <button dc-btn-extended-fab type="button" id="extended-fab">Compose</button>
    <a dc-btn-filled href="#" id="link" [disabled]="disabled()" (click)="clicks.update((n) => n + 1)">
      Link
    </a>
  `,
})
class ButtonHost {
  readonly color = signal<DcColorName | undefined>(undefined);
  readonly disabled = signal(false);
  readonly selected = signal(false);
  readonly clicks = signal(0);
}

describe('dc buttons', () => {
  async function setup() {
    await TestBed.configureTestingModule({ imports: [ButtonHost] }).compileComponents();
    const fixture = TestBed.createComponent(ButtonHost);
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

  it('adds the base class plus the style class of each directive', async () => {
    const { el } = await setup();
    const expected: Record<string, string> = {
      default: 'dc-btn-filled',
      text: 'dc-btn-text',
      filled: 'dc-btn-filled',
      outlined: 'dc-btn-outlined',
      elevated: 'dc-btn-elevated',
      icon: 'dc-btn-icon',
      fab: 'dc-btn-fab',
      'mini-fab': 'dc-btn-mini-fab',
      'extended-fab': 'dc-btn-extended-fab',
    };
    for (const [id, styleClass] of Object.entries(expected)) {
      expect(el(id).classList.contains('dc-btn')).toBe(true);
      expect(el(id).classList.contains(styleClass)).toBe(true);
    }
  });

  it('keeps Tailwind utilities written on the element', async () => {
    const { el } = await setup();
    expect(el('outlined').classList.contains('rounded-md')).toBe(true);
    expect(el('outlined').classList.contains('dc-btn-outlined')).toBe(true);
  });

  it('maps color to the theme variable and its foreground', async () => {
    const { host, el, refresh } = await setup();
    const filled = el('filled');
    const style = (name: string) => filled.style.getPropertyValue(name);
    expect(style('--dc-color')).toBe('');

    host.color.set('error');
    await refresh();
    expect(style('--dc-color')).toBe('var(--color-error)');
    expect(style('--dc-color-foreground')).toBe('var(--color-error-foreground)');

    host.color.set('success-600');
    await refresh();
    expect(style('--dc-color')).toBe('var(--color-success-600)');
    expect(style('--dc-color-foreground')).toBe('var(--color-success-600-foreground)');

    host.color.set(undefined);
    await refresh();
    expect(style('--dc-color')).toBe('');
  });

  it('disables native buttons', async () => {
    const { host, el, refresh } = await setup();
    host.disabled.set(true);
    await refresh();

    const filled = el('filled') as HTMLButtonElement;
    expect(filled.disabled).toBe(true);
    expect(filled.getAttribute('aria-disabled')).toBe('true');
  });

  it('disables links without the disabled attribute and blocks clicks', async () => {
    const { host, el, refresh } = await setup();
    const link = el('link');

    link.click();
    expect(host.clicks()).toBe(1);

    host.disabled.set(true);
    await refresh();

    expect(link.hasAttribute('disabled')).toBe(false);
    expect(link.getAttribute('aria-disabled')).toBe('true');
    expect(link.getAttribute('tabindex')).toBe('-1');

    link.click();
    expect(host.clicks()).toBe(1);
  });

  it('composes clickable and ripple on every style', async () => {
    const { el } = await setup();
    for (const id of ['text', 'filled', 'icon', 'fab', 'link']) {
      expect(el(id).classList.contains('dc-ripple')).toBe(true);
      expect(el(id).classList.contains('cursor-pointer')).toBe(true);
    }
  });

  it('reflects icon button toggle state', async () => {
    const { host, el, refresh } = await setup();
    expect(el('icon').hasAttribute('aria-pressed')).toBe(false);

    const toggle = el('toggle');
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    expect(toggle.classList.contains('dc-btn-selected')).toBe(false);

    host.selected.set(true);
    await refresh();
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    expect(toggle.classList.contains('dc-btn-selected')).toBe(true);
  });
});
