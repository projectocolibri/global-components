import { afterNextRender, Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DeltafilButton } from '../../../components/src/lib/button';
import { DeltafilContainer } from '../../../components/src/lib/container';
import {
  initTheme,
  setThemePreference,
  subscribeTheme,
  type ThemePreference,
} from '../../../components/src/lib/theme';

@Component({
  imports: [RouterOutlet, DeltafilButton, DeltafilContainer],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly destroyRef = inject(DestroyRef);

  protected readonly title = signal('demo');
  protected readonly themePreference = signal<ThemePreference>('system');
  protected readonly isDark = signal(false);

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

  toggleDarkMode(): void {
    setThemePreference(this.isDark() ? 'light' : 'dark');
  }

  useSystemTheme(): void {
    setThemePreference('system');
  }
}
