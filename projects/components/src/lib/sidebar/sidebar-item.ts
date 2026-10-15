import { Directive } from '@angular/core';

/**
 * One node in the sidebar tree. Presentation-only — no routes or app logic.
 */
export interface SidebarItem {
  id: string;
  label: string;
  children?: SidebarItem[];
  disabled?: boolean;
}

/**
 * Marks an optional `ng-template` used to render each tree row.
 *
 * Context: `$implicit` is the {@link SidebarItem}.
 *
 * @example
 * ```html
 * <ng-template dc-sidebar-item let-item>
 *   {{ item.label }}
 * </ng-template>
 * ```
 */
@Directive({
  selector: 'ng-template[dc-sidebar-item]',
})
export class DcSidebarItem {}
