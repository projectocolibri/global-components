/** Border tone shared by layout components (container, sidebar). */
export type SurfaceBorder = 'none' | 'subtle' | 'strong' | 'primary';

/** Border color only; the caller picks which sides get a border. */
export function surfaceBorderColorClass(border: SurfaceBorder): string {
  switch (border) {
    case 'none':
      return '';
    case 'subtle':
      return 'border-container-subtle';
    case 'strong':
      return 'border-container-strong';
    case 'primary':
      return 'border-container-primary';
    default: {
      const _exhaustive: never = border;
      return _exhaustive;
    }
  }
}
