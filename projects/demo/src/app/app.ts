import { afterNextRender, Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DeltafilButton } from '../../../components/src/lib/button';
import { DeltafilContainer } from '../../../components/src/lib/container';
import {
  DeltafilSidebar,
  DeltafilSidebarItem,
  type SidebarExpansion,
  type SidebarItem,
} from '../../../components/src/lib/sidebar';
import {
  initTheme,
  setThemePreference,
  subscribeTheme,
  type ThemePreference,
} from '../../../components/src/lib/theme';

export type DemoPage = 'overview' | 'button' | 'container' | 'sidebar';

@Component({
  imports: [RouterOutlet, DeltafilButton, DeltafilContainer, DeltafilSidebar, DeltafilSidebarItem],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly destroyRef = inject(DestroyRef);

  protected readonly themePreference = signal<ThemePreference>('system');
  protected readonly isDark = signal(false);
  protected readonly sidebarCollapsed = signal(false);
  protected readonly sidebarExpansion = signal<SidebarExpansion>('adjacent');
  protected readonly activeId = signal<string | null>('overview');

  protected readonly navItems: SidebarItem[] = [
    { id: 'overview', label: 'Overview' },
    {
      id: 'components',
      label: 'Components',
      children: [
        { id: 'button', label: 'Button' },
        { id: 'container', label: 'Container' },
        { id: 'sidebar', label: 'Sidebar' },
      ],
    },
  ];

  constructor() {
    afterNextRender(() => {
      const state = initTheme();
      this.themePreference.set(state.preference);
      this.isDark.set(state.isDark);

      const unsubscribe = subscribeTheme(({ preference, isDark }) => {
        this.themePreference.set(preference);
        this.isDark.set(isDark);
      });
      this.destroyRef.onDestroy(unsubscribe);
    });
  }

  protected page(): DemoPage {
    const id = this.activeId();
    switch (id) {
      case 'button':
        return 'button';
      case 'container':
        return 'container';
      case 'sidebar':
        return 'sidebar';
      case 'overview':
      case 'components':
      case null:
        return 'overview';
      default:
        return 'overview';
    }
  }

  toggleDarkMode(): void {
    setThemePreference(this.isDark() ? 'light' : 'dark');
  }

  useSystemTheme(): void {
    setThemePreference('system');
  }

  toggleSidebarCollapsed(): void {
    this.sidebarCollapsed.update((value) => !value);
  }

  setSidebarExpansion(expansion: SidebarExpansion): void {
    this.sidebarExpansion.set(expansion);
  }

  onSidebarSelect(item: SidebarItem): void {
    this.activeId.set(item.id);
  }
}
