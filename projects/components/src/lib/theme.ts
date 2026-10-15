/**
 * Theme preference and document sync for `@deltafil/components`.
 *
 * Contract on `<html>`:
 * - `data-theme="system" | "light" | "dark"` — user preference (`system` is default)
 * - class `dark` — resolved appearance; style dark mode off this, since
 *   `data-theme` stays `system` even when the OS is dark
 *
 * Follows https://tailwindcss.com/docs/dark-mode#with-system-theme-support
 */

export type Theme = 'system' | 'light' | 'dark';

type ThemeListener = (theme: Theme, appliedTheme: 'light' | 'dark') => void;

const STORAGE_KEY = 'deltafil-theme';

const listeners = new Set<ThemeListener>();

const media = () => window.matchMedia('(prefers-color-scheme: dark)');

/** Stored preference. Missing or unknown values mean `system`. */
export function getTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'light' || stored === 'dark' ? stored : 'system';
}

/** Whether the page is currently rendered dark. */
export function isDark(): boolean {
  return document.documentElement.classList.contains('dark');
}

function apply(): void {
  const theme = getTheme();
  const dark = theme === 'dark' || (theme === 'system' && media().matches);
  const appliedTheme = dark ? 'dark' : 'light';
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.dataset['theme'] = theme;
  listeners.forEach((listener) => listener(theme, appliedTheme));
}

/** Persists and applies a preference. `system` clears storage so the OS decides. */
export function setTheme(theme: Theme): void {
  if (theme === 'system') {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, theme);
  }
  apply();
}

/**
 * Applies the stored preference and follows OS changes. The OS listener is
 * harmless outside `system` mode because `apply` re-reads the preference.
 * No-op outside the browser (SSR).
 */
export function initTheme(): void {
  if (typeof window === 'undefined') {
    return;
  }
  apply();
  media().addEventListener('change', apply);
}

/** Calls `listener` on every theme change. Returns an unsubscribe function. */
export function subscribeTheme(listener: ThemeListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
