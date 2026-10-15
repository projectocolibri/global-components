import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  DeltafilSidebar,
  DeltafilSidebarItem,
  type SidebarBackground,
  type SidebarBorder,
  type SidebarExpansion,
  type SidebarItem,
} from './sidebar';

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
  imports: [DeltafilSidebar],
  template: `
    <deltafil-sidebar
      [items]="items"
      [expansion]="expansion()"
      [collapsed]="collapsed()"
      [activeId]="activeId()"
      [background]="background()"
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
  readonly background = signal<SidebarBackground>('panel');
  readonly border = signal<SidebarBorder>('subtle');
  readonly selected = signal<SidebarItem | null>(null);

  onSelect(item: SidebarItem): void {
    this.selected.set(item);
  }
}

@Component({
  imports: [DeltafilSidebar, DeltafilSidebarItem],
  template: `
    <deltafil-sidebar [items]="items" [activeId]="'docs'">
      <ng-template deltafilSidebarItem let-item>custom:{{ item.label }}</ng-template>
    </deltafil-sidebar>
  `,
})
class SidebarTemplateHost {
  readonly items = SAMPLE_ITEMS;
}

describe('DeltafilSidebar', () => {
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
      (fixture.nativeElement as HTMLElement).querySelectorAll('deltafil-sidebar button'),
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
      'deltafil-sidebar',
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

  it('applies background, border, and synced content tones', async () => {
    const { fixture, host } = await setup();
    const sidebar = (fixture.nativeElement as HTMLElement).querySelector(
      'deltafil-sidebar',
    ) as HTMLElement;
    const rail = sidebar.firstElementChild as HTMLElement;

    expect(rail.classList.contains('bg-container-panel')).toBe(true);
    expect(rail.classList.contains('border-container-subtle')).toBe(true);
    expect(rail.classList.contains('text-secondary-800')).toBe(true);
    expect(rail.classList.contains('p-container-padding-sm')).toBe(true);

    host.activeId.set('playground');
    host.background.set('primary');
    host.border.set('strong');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(rail.classList.contains('bg-container-primary')).toBe(true);
    expect(rail.classList.contains('text-secondary-50')).toBe(true);
    expect(rail.classList.contains('border-container-strong')).toBe(true);

    const active = buttonByLabel(fixture, 'Playground');
    expect(active?.classList.contains('bg-primary-700')).toBe(true);
    expect(active?.classList.contains('text-secondary-50')).toBe(true);
    expect(active?.classList.contains('hover:bg-primary-600')).toBe(true);

    host.background.set('soft');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(rail.classList.contains('bg-container-soft')).toBe(true);
    expect(rail.classList.contains('text-secondary-800')).toBe(true);
    expect(active?.classList.contains('bg-container-panel')).toBe(true);
    expect(active?.classList.contains('hover:bg-container-panel')).toBe(true);
  });
});
