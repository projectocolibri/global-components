/**
 * Theme preference and document sync for `@deltafil/components`.
 *
 * Contract on `<html>`:
 * - `data-theme="system" | "light" | "dark"` — user preference (`system` is default)
 * - class `dark` — resolved appearance when the effective theme is dark
 *
 * Tailwind `dark:` and token overrides key off the resolved `.dark` class
 * (and `data-theme="dark"`). System mode is resolved here via
 * `prefers-color-scheme`, matching
 * https://tailwindcss.com/docs/dark-mode#with-system-theme-support
 */

export type ThemePreference = 'system' | 'light' | 'dark';

export type ThemeState = {
  preference: ThemePreference;
  isDark: boolean;
};

type ThemeListener = (state: ThemeState) => void;

const STORAGE_KEY = 'deltafil-theme';

const listeners = new Set<ThemeListener>();

let mediaQueryList: MediaQueryList | null = null;
let mediaListener: ((event: MediaQueryListEvent) => void) | null = null;

function isBrowser(): boolean {
  return typeof document !== 'undefined' && typeof window !== 'undefined';
}

function notify(state: ThemeState): void {
  for (const listener of listeners) {
    listener(state);
  }
}

function syncMediaListener(preference: ThemePreference): void {
  if (!isBrowser()) {
    return;
  }

  if (mediaQueryList && mediaListener) {
    mediaQueryList.removeEventListener('change', mediaListener);
    mediaQueryList = null;
    mediaListener = null;
  }

  if (preference !== 'system') {
    return;
  }

  mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
  mediaListener = () => {
    applyTheme('system');
  };
  mediaQueryList.addEventListener('change', mediaListener);
}

/**
 * Reads the stored preference. Missing or unknown values mean `system`.
 */
export function getThemePreference(): ThemePreference {
  if (!isBrowser()) {
    return 'system';
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }

  return 'system';
}

/**
 * Resolves whether the effective appearance is dark for a preference.
 */
export function resolveIsDark(preference: ThemePreference = getThemePreference()): boolean {
  switch (preference) {
    case 'dark':
      return true;
    case 'light':
      return false;
    case 'system':
      if (!isBrowser()) {
        return false;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    default: {
      const _exhaustive: never = preference;
      return _exhaustive;
    }
  }
}

/**
 * Writes the resolved `dark` class and `data-theme` preference on `<html>`.
 */
export function applyTheme(preference: ThemePreference): void {
  if (!isBrowser()) {
    return;
  }

  const isDark = resolveIsDark(preference);
  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.setAttribute('data-theme', preference);
  syncMediaListener(preference);
  notify({ preference, isDark });
}

/**
 * Persists preference and applies it. `system` clears storage so default
 * remains OS-driven.
 */
export function setThemePreference(preference: ThemePreference): void {
  if (!isBrowser()) {
    return;
  }

  if (preference === 'system') {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, preference);
  }

  applyTheme(preference);
}

/**
 * Applies the stored preference (or `system`) and starts OS listening when needed.
 */
export function initTheme(): ThemeState {
  const preference = getThemePreference();
  applyTheme(preference);
  return { preference, isDark: resolveIsDark(preference) };
}

/**
 * Subscribes to theme changes (manual set or OS change in system mode).
 * Returns an unsubscribe function.
 */
export function subscribeTheme(listener: ThemeListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
