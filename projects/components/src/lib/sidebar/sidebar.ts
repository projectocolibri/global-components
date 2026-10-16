import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  Component,
  computed,
  contentChild,
  input,
  output,
  signal,
  TemplateRef,
} from '@angular/core';
import { DcClickable } from '../clickable';
import { DcColor } from '../color';
import { classNames, surfaceBorderColorClass, type SurfaceBorder } from '../core';
import { DcRipple } from '../ripple';
import { DcSidebarItem, type SidebarItem } from './sidebar-item';

export type SidebarExpansion = 'inline' | 'adjacent';
export type SidebarBorder = SurfaceBorder;

/**
 * Vertical navigation rail: logo, icon actions, and a tree.
 *
 * Presentation-only. The app supplies items, optional row template, and handles
 * `(select)`. Supports inline or adjacent child expansion. When `collapsed`,
 * the sidebar animates closed (width to zero).
 *
 * Surface is controlled with `color` (composed `dc-color`, default `'surface-200'`) and
 * `border`. Text uses the color's `-foreground` pair; row hover and active tints
 * are made from that text color, so they stay visible on any color. Rows are
 * `dc-clickable` + `dc-ripple`.
 *
 * @example
 * ```html
 * <dc-sidebar
 *   [items]="nav"
 *   [activeId]="activeId()"
 *   expansion="inline"
 *   color="surface-200"
 *   border="subtle"
 *   (select)="activeId.set($event.id)"
 * >
 *   <a dc-sidebar-logo href="/">Logo</a>
 *   <div dc-sidebar-actions>
 *     <button dc-btn-icon type="button" aria-label="Search">…</button>
 *   </div>
 * </dc-sidebar>
 * ```
 */
@Component({
  selector: 'dc-sidebar',
  imports: [NgTemplateOutlet, DcClickable, DcRipple],
  hostDirectives: [{ directive: DcColor, inputs: ['color'] }],
  host: {
    class:
      'flex flex-row items-stretch shrink-0 min-h-container-screen overflow-hidden ' +
      'bg-[var(--dc-color,var(--color-surface-200))] text-[var(--dc-color-foreground,var(--color-surface-200-foreground))]',
    '[attr.aria-hidden]': 'collapsed() ? "true" : null',
    '[attr.inert]': 'collapsed() || null',
    role: 'navigation',
  },
  template: `
    <div [class]="railClass()">
      <div class="shrink-0">
        <ng-content select="[dc-sidebar-logo]" />
      </div>
      <div class="flex shrink-0 flex-row flex-wrap items-center gap-container-sm">
        <ng-content select="[dc-sidebar-actions]" />
      </div>
      <nav class="flex min-h-0 flex-1 flex-col gap-container-sm overflow-auto" aria-label="Sidebar">
        <ng-template
          [ngTemplateOutlet]="treeNodes"
          [ngTemplateOutletContext]="{ $implicit: items(), depth: 0 }"
        />
      </nav>
    </div>

    @if (adjacentChildren(); as children) {
      <div [class]="panelClass()">
        <nav
          class="flex min-h-0 flex-1 flex-col gap-container-sm overflow-auto p-container-padding-sm"
          aria-label="Sidebar section"
        >
          @for (item of children; track item.id) {
            <ng-template
              [ngTemplateOutlet]="row"
              [ngTemplateOutletContext]="{ $implicit: item, depth: 0, panel: true }"
            />
          }
        </nav>
      </div>
    }

    <ng-template #treeNodes let-nodes let-depth="depth">
      @for (item of nodes; track item.id) {
        <ng-template
          [ngTemplateOutlet]="row"
          [ngTemplateOutletContext]="{ $implicit: item, depth, panel: false }"
        />
        @if (expansion() === 'inline' && hasChildren(item) && isExpanded(item.id)) {
          <ng-template
            [ngTemplateOutlet]="treeNodes"
            [ngTemplateOutletContext]="{ $implicit: item.children, depth: depth + 1 }"
          />
        }
      }
    </ng-template>

    <ng-template #row let-item let-depth="depth" let-panel="panel">
      <button
        type="button"
        dc-clickable
        dc-ripple
        [class]="rowClass(item)"
        [style.padding-inline-start.rem]="panel ? 0.5 : 0.5 + depth * 0.75"
        [disabled]="item.disabled === true"
        [attr.aria-expanded]="ariaExpanded(item, panel)"
        [attr.aria-current]="item.id === activeId() ? 'page' : null"
        (click)="onItemClick(item, panel === true)"
      >
        @if (itemTemplate(); as tpl) {
          <ng-container [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="{ $implicit: item }" />
        } @else {
          <span class="min-w-0 whitespace-normal break-words">{{ item.label }}</span>
        }
      </button>
    </ng-template>
  `,
})
export class DcSidebar {
  private readonly itemTemplateRef = contentChild(DcSidebarItem, {
    read: TemplateRef,
  });

  /**
   * Tree nodes to render in the primary rail (and adjacent panel when applicable).
   */
  readonly items = input.required<SidebarItem[]>();

  /**
   * How nodes with children open.
   *
   * - `'inline'` (default) — children expand under the parent
   * - `'adjacent'` — children open in a second column beside the rail
   */
  readonly expansion = input<SidebarExpansion>('inline');

  /**
   * Animate the sidebar closed (width to zero) when true.
   *
   * Use as `collapsed` or `[collapsed]="true"`.
   */
  readonly collapsed = input(false, { transform: booleanAttribute });

  /**
   * Id of the highlighted item (controlled by the app).
   */
  readonly activeId = input<string | null>(null);

  /**
   * Divider on the trailing edge of the rail / adjacent panel.
   *
   * - `'none'` — no border
   * - `'subtle'` (default) — light border
   * - `'strong'` — stronger, more visible border
   * - `'primary'` — brand / primary border
   */
  readonly border = input<SidebarBorder>('subtle');

  /**
   * Emits when the user activates an enabled item.
   */
  readonly select = output<SidebarItem>();

  private readonly expandedIds = signal<ReadonlySet<string>>(new Set());
  private readonly adjacentRootId = signal<string | null>(null);

  protected readonly itemTemplate = computed(() => this.itemTemplateRef() ?? null);

  protected readonly adjacentChildren = computed((): SidebarItem[] | null => {
    if (this.expansion() !== 'adjacent') {
      return null;
    }
    const rootId = this.adjacentRootId();
    if (rootId === null) {
      return null;
    }
    const root = this.items().find((item) => item.id === rootId);
    if (!root?.children?.length) {
      return null;
    }
    return root.children;
  });

  protected railClass(): string {
    const closed = this.collapsed();
    return classNames(
      'flex',
      'flex-col',
      'min-h-container-screen',
      'shrink-0',
      'overflow-hidden',
      'transition-[width,padding,opacity,border-color] duration-300 ease-in-out',
      'motion-reduce:transition-none',
      closed
        ? ['w-0 gap-0 p-0 opacity-0 pointer-events-none', collapsedBorderClass(this.border())]
        : [
            'w-sidebar gap-container-sm p-container-padding-sm opacity-100',
            borderClass(this.border()),
          ],
    );
  }

  protected panelClass(): string {
    const closed = this.collapsed();
    return classNames(
      'flex',
      'flex-col',
      'min-h-container-screen',
      'shrink-0',
      'overflow-hidden',
      'transition-[width,padding,opacity,border-color] duration-300 ease-in-out',
      'motion-reduce:transition-none',
      closed
        ? ['w-0 p-0 opacity-0 pointer-events-none', collapsedBorderClass(this.border())]
        : ['w-sidebar opacity-100', borderClass(this.border())],
    );
  }

  protected hasChildren(item: SidebarItem): boolean {
    return (item.children?.length ?? 0) > 0;
  }

  protected isExpanded(id: string): boolean {
    return this.expandedIds().has(id);
  }

  protected ariaExpanded(item: SidebarItem, panel: boolean): string | null {
    if (panel || !this.hasChildren(item)) {
      return null;
    }
    if (this.expansion() === 'inline') {
      return this.isExpanded(item.id) ? 'true' : 'false';
    }
    return this.adjacentRootId() === item.id ? 'true' : 'false';
  }

  protected rowClass(item: SidebarItem): string {
    const active = item.id === this.activeId();
    return classNames(
      'flex',
      'w-full',
      'items-start',
      'gap-container-sm',
      'rounded-container-sm',
      'py-container-padding-sm',
      'pr-container-padding-sm',
      'text-left',
      'font-sans',
      'text-sm',
      'font-medium',
      'transition-colors',
      item.disabled
        ? 'opacity-50'
        : !active && 'hover:bg-current/10',
      active && 'bg-current/15',
    );
  }

  protected onItemClick(item: SidebarItem, fromPanel: boolean): void {
    if (item.disabled) {
      return;
    }

    this.select.emit(item);

    if (fromPanel || !this.hasChildren(item)) {
      return;
    }

    const mode = this.expansion();
    switch (mode) {
      case 'inline':
        this.toggleExpanded(item.id);
        break;
      case 'adjacent':
        this.adjacentRootId.update((current) => (current === item.id ? null : item.id));
        break;
      default: {
        const _exhaustive: never = mode;
        return _exhaustive;
      }
    }
  }

  private toggleExpanded(id: string): void {
    this.expandedIds.update((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }
}

function borderClass(border: SidebarBorder): string {
  return border === 'none' ? '' : `border-r ${surfaceBorderColorClass(border)}`;
}

function collapsedBorderClass(border: SidebarBorder): string {
  return border === 'none' ? '' : 'border-r border-transparent';
}
