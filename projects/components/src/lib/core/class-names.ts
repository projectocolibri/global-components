export type ClassValue = string | false | null | undefined | readonly ClassValue[];

/** Joins class lists, skipping empty values and flattening nested arrays. */
export function classNames(...values: readonly ClassValue[]): string {
  const classes: string[] = [];
  for (const value of values) {
    const resolved = typeof value === 'object' && value !== null ? classNames(...value) : value;
    if (resolved) {
      classes.push(resolved);
    }
  }
  return classes.join(' ');
}
