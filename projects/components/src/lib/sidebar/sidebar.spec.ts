import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  DcSidebar,
  DcSidebarItem,
  type SidebarBorder,
  type SidebarExpansion,
  type SidebarItem,
} from './index';
import type { DcColorName } from '../color';

const SAMPLE_ITEMS: SidebarItem[] = [
  {
    id: 'docs',
    label: 'Docs',
    children: [
      { id: 'docs-start', label: 'Get started' },
      { id: 'docs-disabled', label: 'Disabled', disabled: true },
    ],
  },
  { id: 'playground', label: 'Playground' },
];

@Component({
  imports: [DcSidebar],
  template: `
    <dc-sidebar
      [items]="items"
      [expansion]="expansion()"
      [collapsed]="collapsed()"
      [activeId]="activeId()"
      [color]="color()"
      [border]="border()"
      (select)="onSelect($event)"
    />
  `,
})
class SidebarHost {
  readonly items = SAMPLE_ITEMS;
  readonly expansion = signal<SidebarExpansion>('inline');
  readonly collapsed = signal(false);
  readonly activeId = signal<string | null>(null);
  readonly color = signal<DcColorName | undefined>('surface-200');
  readonly border = signal<SidebarBorder>('subtle');
  readonly selected = signal<SidebarItem | null>(null);

  onSelect(item: SidebarItem): void {
    this.selected.set(item);
  }
}

@Component({
  imports: [DcSidebar, DcSidebarItem],
  template: `
    <dc-sidebar [items]="items" [activeId]="'docs'">
      <ng-template dc-sidebar-item let-item>custom:{{ item.label }}</ng-template>
    </dc-sidebar>
  `,
})
class SidebarTemplateHost {
  readonly items = SAMPLE_ITEMS;
}

describe('DcSidebar', () => {
  async function setup(): Promise<{
    fixture: ComponentFixture<SidebarHost>;
    host: SidebarHost;
  }> {
    await TestBed.configureTestingModule({
      imports: [SidebarHost],
    }).compileComponents();

    const fixture = TestBed.createComponent(SidebarHost);
    fixture.detectChanges();
    await fixture.whenStable();
    return { fixture, host: fixture.componentInstance };
  }

  function buttons(fixture: ComponentFixture<unknown>): HTMLButtonElement[] {
    return Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('dc-sidebar button'),
    );
  }

  function buttonByLabel(
    fixture: ComponentFixture<unknown>,
    label: string,
  ): HTMLButtonElement | undefined {
    return buttons(fixture).find((button) => button.textContent?.includes(label));
  }

  it('expands children inline and emits select for a leaf', async () => {
    const { fixture, host } = await setup();

    buttonByLabel(fixture, 'Docs')?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(host.selected()?.id).toBe('docs');
    expect(buttonByLabel(fixture, 'Get started')).toBeTruthy();

    buttonByLabel(fixture, 'Get started')?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(host.selected()?.id).toBe('docs-start');
  });

  it('opens an adjacent panel with children of the selected root', async () => {
    const { fixture, host } = await setup();
    host.expansion.set('adjacent');
    fixture.detectChanges();
    await fixture.whenStable();

    buttonByLabel(fixture, 'Docs')?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const panels = (fixture.nativeElement as HTMLElement).querySelectorAll(
      'nav[aria-label="Sidebar section"]',
    );
    expect(panels.length).toBe(1);
    expect(panels[0].textContent).toContain('Get started');

    buttonByLabel(fixture, 'Get started')?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(host.selected()?.id).toBe('docs-start');
  });

  it('marks the active item with aria-current', async () => {
    const { fixture, host } = await setup();
    host.activeId.set('playground');
    fixture.detectChanges();
    await fixture.whenStable();

    const active = buttonByLabel(fixture, 'Playground');
    expect(active?.getAttribute('aria-current')).toBe('page');
  });

  it('does not emit or expand when the item is disabled', async () => {
    const { fixture, host } = await setup();

    buttonByLabel(fixture, 'Docs')?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const disabled = buttonByLabel(fixture, 'Disabled');
    expect(disabled?.disabled).toBe(true);

    host.selected.set(null);
    disabled?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(host.selected()).toBeNull();
  });

  it('renders a custom item template when provided', async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarTemplateHost],
    }).compileComponents();

    const fixture = TestBed.createComponent(SidebarTemplateHost);
    fixture.detectChanges();
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('custom:Docs');
  });

  it('animates the sidebar closed when collapsed', async () => {
    const { fixture, host } = await setup();
    const sidebar = (fixture.nativeElement as HTMLElement).querySelector(
      'dc-sidebar',
    ) as HTMLElement;
    const rail = sidebar.firstElementChild as HTMLElement;

    expect(sidebar.getAttribute('aria-hidden')).toBeNull();
    expect(rail.classList.contains('w-sidebar')).toBe(true);
    expect(buttonByLabel(fixture, 'Docs')).toBeTruthy();

    host.collapsed.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(sidebar.getAttribute('aria-hidden')).toBe('true');
    expect(sidebar.hasAttribute('inert')).toBe(true);
    expect(rail.classList.contains('w-0')).toBe(true);
    expect(rail.classList.contains('w-sidebar')).toBe(false);
  });

  it('paints any theme color with its foreground and tints rows from it', async () => {
    const { fixture, host } = await setup();
    const sidebar = (fixture.nativeElement as HTMLElement).querySelector(
      'dc-sidebar',
    ) as HTMLElement;
    const rail = sidebar.firstElementChild as HTMLElement;
    const paint = 'bg-[var(--dc-color,var(--color-surface-200))]';

    expect(sidebar.classList.contains(paint)).toBe(true);
    expect(sidebar.style.getPropertyValue('--dc-color')).toBe('var(--color-surface-200)');
    expect(rail.classList.contains('border-container-subtle')).toBe(true);

    host.activeId.set('playground');
    host.color.set('primary-700');
    host.border.set('strong');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(sidebar.style.getPropertyValue('--dc-color')).toBe('var(--color-primary-700)');
    expect(sidebar.style.getPropertyValue('--dc-color-foreground')).toBe(
      'var(--color-primary-700-foreground)',
    );
    expect(rail.classList.contains('border-container-strong')).toBe(true);
    expect(buttonByLabel(fixture, 'Playground')?.classList.contains('bg-current/15')).toBe(true);
    expect(buttonByLabel(fixture, 'Docs')?.classList.contains('hover:bg-current/10')).toBe(true);

    // Unset falls back to surface-200 through the CSS var() fallback.
    host.color.set(undefined);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(sidebar.style.getPropertyValue('--dc-color')).toBe('');
    expect(sidebar.classList.contains(paint)).toBe(true);
  });

  it('makes rows clickable with a ripple', async () => {
    const { fixture } = await setup();
    const docs = buttonByLabel(fixture, 'Docs');
    expect(docs?.classList.contains('dc-ripple')).toBe(true);
    expect(docs?.classList.contains('cursor-pointer')).toBe(true);
  });
});
