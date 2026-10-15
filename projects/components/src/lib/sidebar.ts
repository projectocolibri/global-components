import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  Component,
  computed,
  contentChild,
  Directive,
  input,
  output,
  signal,
  TemplateRef,
} from '@angular/core';

export type SidebarExpansion = 'inline' | 'adjacent';
export type SidebarBackground = 'none' | 'canvas' | 'soft' | 'panel' | 'primary';
export type SidebarBorder = 'none' | 'subtle' | 'strong' | 'primary';

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
 * <ng-template deltafilSidebarItem let-item>
 *   {{ item.label }}
 * </ng-template>
 * ```
 */
@Directive({
  selector: 'ng-template[deltafilSidebarItem]',
})
export class DeltafilSidebarItem {}

/**
 * Vertical navigation rail: logo, icon actions, and a tree.
 *
 * Presentation-only. The app supplies items, optional row template, and handles
 * `(select)`. Supports inline or adjacent child expansion. When `collapsed`,
 * the sidebar animates closed (width to zero).
 *
 * Surface is controlled with `background` and `border` (same token options as
 * container). Row and content tones follow `background` so labels stay visible.
 *
 * @example
 * ```html
 * <deltafil-sidebar
 *   [items]="nav"
 *   [activeId]="activeId()"
 *   expansion="inline"
 *   background="panel"
 *   border="subtle"
 *   (select)="activeId.set($event.id)"
 * >
 *   <a sidebarLogo href="/">Logo</a>
 *   <ng-container sidebarActions>
 *     <button deltafilButton type="button" appearance="icon" aria-label="Search">…</button>
 *   </ng-container>
 * </deltafil-sidebar>
 * ```
 */
@Component({
  selector: 'deltafil-sidebar',
  imports: [NgTemplateOutlet],
  host: {
    '[class]': 'hostClass()',
    '[attr.aria-hidden]': 'collapsed() ? "true" : null',
    '[attr.inert]': 'collapsed() || null',
    role: 'navigation',
  },
  template: `
    <div [class]="railClass()">
      <div class="shrink-0">
        <ng-content select="[sidebarLogo]" />
      </div>
      <div class="flex shrink-0 flex-row flex-wrap items-center gap-container-sm">
        <ng-content select="[sidebarActions]" />
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
export class DeltafilSidebar {
  private readonly itemTemplateRef = contentChild(DeltafilSidebarItem, {
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
   * Background color / surface (same options as container).
   *
   * Row text, hover, and active tones follow this value so content stays visible.
   *
   * - `'none'` — transparent
   * - `'canvas'` — page background
   * - `'soft'` — light muted surface
   * - `'panel'` (default) — slightly stronger panel surface
   * - `'primary'` — brand / primary color
   */
  readonly background = input<SidebarBackground>('panel');

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

  protected readonly hostClass = computed(() =>
    ['flex', 'flex-row', 'items-stretch', 'shrink-0', 'min-h-container-screen', 'overflow-hidden'].join(
      ' ',
    ),
  );

  protected railClass(): string {
    const closed = this.collapsed();
    return [
      'flex',
      'flex-col',
      'min-h-container-screen',
      'shrink-0',
      'overflow-hidden',
      'transition-[width,padding,opacity,border-color] duration-300 ease-in-out',
      'motion-reduce:transition-none',
      backgroundClass(this.background()),
      contentToneClass(this.background()),
      closed
        ? ['w-0 gap-0 p-0 opacity-0 pointer-events-none', collapsedBorderClass(this.border())]
        : [
            'w-sidebar gap-container-sm p-container-padding-sm opacity-100',
            borderClass(this.border()),
          ],
    ]
      .flat()
      .filter(Boolean)
      .join(' ');
  }

  protected panelClass(): string {
    const closed = this.collapsed();
    return [
      'flex',
      'flex-col',
      'min-h-container-screen',
      'shrink-0',
      'overflow-hidden',
      'transition-[width,padding,opacity,border-color] duration-300 ease-in-out',
      'motion-reduce:transition-none',
      backgroundClass(this.background()),
      contentToneClass(this.background()),
      closed
        ? ['w-0 p-0 opacity-0 pointer-events-none', collapsedBorderClass(this.border())]
        : ['w-sidebar opacity-100', borderClass(this.border())],
    ]
      .flat()
      .filter(Boolean)
      .join(' ');
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
    const background = this.background();
    return [
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
      'transition-colors',
      item.disabled
        ? 'cursor-not-allowed opacity-50'
        : ['cursor-pointer', rowHoverClass(background)],
      active ? rowActiveClass(background) : '',
    ]
      .flat()
      .filter(Boolean)
      .join(' ');
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

function backgroundClass(background: SidebarBackground): string {
  switch (background) {
    case 'none':
      return '';
    case 'canvas':
      return 'bg-container-canvas';
    case 'soft':
      return 'bg-container-soft';
    case 'panel':
      return 'bg-container-panel';
    case 'primary':
      return 'bg-container-primary';
    default: {
      const _exhaustive: never = background;
      return _exhaustive;
    }
  }
}

function contentToneClass(background: SidebarBackground): string {
  switch (background) {
    case 'primary':
      return 'text-secondary-50';
    case 'none':
    case 'canvas':
    case 'soft':
    case 'panel':
      return 'text-secondary-800';
    default: {
      const _exhaustive: never = background;
      return _exhaustive;
    }
  }
}

function rowHoverClass(background: SidebarBackground): string {
  switch (background) {
    case 'soft':
      return 'hover:bg-container-panel';
    case 'primary':
      return 'hover:bg-primary-600';
    case 'none':
    case 'canvas':
    case 'panel':
      return 'hover:bg-container-soft';
    default: {
      const _exhaustive: never = background;
      return _exhaustive;
    }
  }
}

function rowActiveClass(background: SidebarBackground): string {
  switch (background) {
    case 'soft':
      return 'bg-container-panel font-medium text-primary-600';
    case 'primary':
      return 'bg-primary-700 font-medium text-secondary-50';
    case 'none':
    case 'canvas':
    case 'panel':
      return 'bg-container-soft font-medium text-primary-600';
    default: {
      const _exhaustive: never = background;
      return _exhaustive;
    }
  }
}

function borderClass(border: SidebarBorder): string {
  switch (border) {
    case 'none':
      return '';
    case 'subtle':
      return 'border-r border-container-subtle';
    case 'strong':
      return 'border-r border-container-strong';
    case 'primary':
      return 'border-r border-container-primary';
    default: {
      const _exhaustive: never = border;
      return _exhaustive;
    }
  }
}

function collapsedBorderClass(border: SidebarBorder): string {
  switch (border) {
    case 'none':
      return '';
    case 'subtle':
    case 'strong':
    case 'primary':
      return 'border-r border-transparent';
    default: {
      const _exhaustive: never = border;
      return _exhaustive;
    }
  }
}
