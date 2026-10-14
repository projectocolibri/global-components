import { booleanAttribute, computed, Directive, input } from '@angular/core';

type ContainerDirection = 'horizontal' | 'vertical';
type ContainerAlign = 'start' | 'center' | 'end' | 'stretch';
type ContainerJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
type ContainerSpacing = 'none' | 'sm' | 'md' | 'lg';
type ContainerSize =
  | 'auto'
  | 'fit'
  | 'full'
  | 'half'
  | 'third'
  | 'two-thirds'
  | 'quarter'
  | 'three-quarters'
  | 'screen';
type ContainerBackground = 'none' | 'canvas' | 'soft' | 'panel' | 'primary';
type ContainerBorder = 'none' | 'subtle' | 'strong' | 'primary';
type ContainerRounded = 'none' | 'sm' | 'md' | 'lg';

type ContainerRelativeSize = Exclude<ContainerSize, 'auto' | 'fit'>;

const WIDTH_GUTTERED_CLASS: Record<ContainerRelativeSize, Record<ContainerSpacing, string>> = {
  full: {
    none: 'w-container-full',
    sm: 'w-container-full-sm',
    md: 'w-container-full-md',
    lg: 'w-container-full-lg',
  },
  half: {
    none: 'w-container-half',
    sm: 'w-container-half-sm',
    md: 'w-container-half-md',
    lg: 'w-container-half-lg',
  },
  third: {
    none: 'w-container-third',
    sm: 'w-container-third-sm',
    md: 'w-container-third-md',
    lg: 'w-container-third-lg',
  },
  'two-thirds': {
    none: 'w-container-two-thirds',
    sm: 'w-container-two-thirds-sm',
    md: 'w-container-two-thirds-md',
    lg: 'w-container-two-thirds-lg',
  },
  quarter: {
    none: 'w-container-quarter',
    sm: 'w-container-quarter-sm',
    md: 'w-container-quarter-md',
    lg: 'w-container-quarter-lg',
  },
  'three-quarters': {
    none: 'w-container-three-quarters',
    sm: 'w-container-three-quarters-sm',
    md: 'w-container-three-quarters-md',
    lg: 'w-container-three-quarters-lg',
  },
  screen: {
    none: 'w-container-screen',
    sm: 'w-container-screen-sm',
    md: 'w-container-screen-md',
    lg: 'w-container-screen-lg',
  },
};

const HEIGHT_GUTTERED_CLASS: Record<ContainerRelativeSize, Record<ContainerSpacing, string>> = {
  full: {
    none: 'h-container-full',
    sm: 'h-container-full-sm',
    md: 'h-container-full-md',
    lg: 'h-container-full-lg',
  },
  half: {
    none: 'h-container-half',
    sm: 'h-container-half-sm',
    md: 'h-container-half-md',
    lg: 'h-container-half-lg',
  },
  third: {
    none: 'h-container-third',
    sm: 'h-container-third-sm',
    md: 'h-container-third-md',
    lg: 'h-container-third-lg',
  },
  'two-thirds': {
    none: 'h-container-two-thirds',
    sm: 'h-container-two-thirds-sm',
    md: 'h-container-two-thirds-md',
    lg: 'h-container-two-thirds-lg',
  },
  quarter: {
    none: 'h-container-quarter',
    sm: 'h-container-quarter-sm',
    md: 'h-container-quarter-md',
    lg: 'h-container-quarter-lg',
  },
  'three-quarters': {
    none: 'h-container-three-quarters',
    sm: 'h-container-three-quarters-sm',
    md: 'h-container-three-quarters-md',
    lg: 'h-container-three-quarters-lg',
  },
  screen: {
    none: 'h-container-screen',
    sm: 'h-container-screen-sm',
    md: 'h-container-screen-md',
    lg: 'h-container-screen-lg',
  },
};

/**
 * Turns any element into a layout container for arranging children.
 *
 * Control direction, alignment, size, spacing, background, border, and corners
 * with simple inputs (for example `gap="md"` for medium spacing).
 *
 * @example
 * ```html
 * <div
 *   deltafilContainer
 *   direction="horizontal"
 *   width="screen"
 *   height="screen"
 *   margin="md"
 *   justify="center"
 *   gap="md"
 *   padding="md"
 *   background="soft"
 *   border="subtle"
 *   rounded="md"
 * >
 *   ...
 * </div>
 * ```
 */
@Directive({
  selector: '[deltafilContainer]',
  host: {
    '[class]': 'hostClass()',
  },
})
export class DeltafilContainer {
  /**
   * How children are stacked.
   *
   * - `'vertical'` (default) — top to bottom
   * - `'horizontal'` — left to right
   */
  readonly direction = input<ContainerDirection>('vertical');

  /**
   * How children line up on the side axis
   * (left/right when vertical; top/bottom when horizontal).
   *
   * - `'stretch'` (default) — children fill that axis
   * - `'start'` — toward the start
   * - `'center'` — centered
   * - `'end'` — toward the end
   */
  readonly align = input<ContainerAlign>('stretch');

  /**
   * How children are spaced along the main axis
   * (top/bottom when vertical; left/right when horizontal).
   *
   * - `'start'` (default) — pack at the start
   * - `'center'` — centered
   * - `'end'` — pack at the end
   * - `'between'` — space between items only
   * - `'around'` — space around each item
   * - `'evenly'` — equal space everywhere, including the edges
   */
  readonly justify = input<ContainerJustify>('start');

  /**
   * Space between children.
   *
   * - `'none'` (default) — no space
   * - `'sm'` — small
   * - `'md'` — medium
   * - `'lg'` — large
   */
  readonly gap = input<ContainerSpacing>('none');

  /**
   * Inner space between the border and the content.
   *
   * - `'none'` (default) — no padding
   * - `'sm'` — small
   * - `'md'` — medium
   * - `'lg'` — large
   */
  readonly padding = input<ContainerSpacing>('none');

  /**
   * Outer space around the container (gutter).
   *
   * - `'none'` (default) — no margin
   * - `'sm'` — small
   * - `'md'` — medium
   * - `'lg'` — large
   *
   * With sizes like `full` or `screen`, this gutter is kept inside the parent
   * so the box does not overflow. Does not apply to `auto` / `fit`.
   */
  readonly margin = input<ContainerSpacing>('none');

  /**
   * How wide the container is.
   *
   * - `'full'` (default) — as wide as the parent
   * - `'auto'` — only as wide as the content
   * - `'fit'` — fit the content, with a soft upper limit
   * - `'half'` — half of the parent
   * - `'third'` — one third of the parent
   * - `'two-thirds'` — two thirds of the parent
   * - `'quarter'` — one quarter of the parent
   * - `'three-quarters'` — three quarters of the parent
   * - `'screen'` — as wide as the viewport (good for page shells)
   *
   * If `margin` is set, relative sizes shrink so the gutter still fits.
   */
  readonly width = input<ContainerSize>('full');

  /**
   * How tall the container is.
   *
   * - `'auto'` (default) — only as tall as the content
   * - `'full'` — as tall as the parent (parent must have a height)
   * - `'fit'` — fit the content, with a soft upper limit
   * - `'half'` — half of the parent
   * - `'third'` — one third of the parent
   * - `'two-thirds'` — two thirds of the parent
   * - `'quarter'` — one quarter of the parent
   * - `'three-quarters'` — three quarters of the parent
   * - `'screen'` — as tall as the viewport (good for page shells)
   *
   * If `margin` is set, relative sizes shrink so the gutter still fits.
   */
  readonly height = input<ContainerSize>('auto');

  /**
   * Background color / surface.
   *
   * - `'none'` (default) — transparent
   * - `'canvas'` — page background
   * - `'soft'` — light muted surface
   * - `'panel'` — slightly stronger panel surface
   * - `'primary'` — brand / primary color
   */
  readonly background = input<ContainerBackground>('none');

  /**
   * Border around the container.
   *
   * - `'none'` (default) — no border
   * - `'subtle'` — light border
   * - `'strong'` — stronger, more visible border
   * - `'primary'` — brand / primary border
   */
  readonly border = input<ContainerBorder>('none');

  /**
   * How rounded the corners are.
   *
   * - `'none'` (default) — square corners
   * - `'sm'` — small
   * - `'md'` — medium
   * - `'lg'` — large
   */
  readonly rounded = input<ContainerRounded>('none');

  /**
   * Allow children to wrap onto the next line when there is not enough room.
   *
   * Use as `wrap` or `[wrap]="true"`.
   *
   * - `false` (default) — keep children on one line / column
   * - `true` — wrap to the next line
   */
  readonly wrap = input(false, { transform: booleanAttribute });

  readonly hostClass = computed(() =>
    [
      'flex',
      directionClass(this.direction()),
      alignClass(this.align()),
      justifyClass(this.justify()),
      gapClass(this.gap()),
      paddingClass(this.padding()),
      marginClass(this.margin()),
      widthClass(this.width(), this.margin()),
      heightClass(this.height(), this.margin()),
      isIntrinsicSize(this.width()) ? 'self-start' : '',
      backgroundClass(this.background()),
      borderClass(this.border()),
      roundedClass(this.rounded()),
      this.wrap() ? 'flex-wrap' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );
}

function isIntrinsicSize(size: ContainerSize): boolean {
  return size === 'auto' || size === 'fit';
}

function directionClass(direction: ContainerDirection): string {
  switch (direction) {
    case 'horizontal':
      return 'flex-row';
    case 'vertical':
      return 'flex-col';
    default: {
      const _exhaustive: never = direction;
      return _exhaustive;
    }
  }
}

function alignClass(align: ContainerAlign): string {
  switch (align) {
    case 'start':
      return 'items-start';
    case 'center':
      return 'items-center';
    case 'end':
      return 'items-end';
    case 'stretch':
      return 'items-stretch';
    default: {
      const _exhaustive: never = align;
      return _exhaustive;
    }
  }
}

function justifyClass(justify: ContainerJustify): string {
  switch (justify) {
    case 'start':
      return 'justify-start';
    case 'center':
      return 'justify-center';
    case 'end':
      return 'justify-end';
    case 'between':
      return 'justify-between';
    case 'around':
      return 'justify-around';
    case 'evenly':
      return 'justify-evenly';
    default: {
      const _exhaustive: never = justify;
      return _exhaustive;
    }
  }
}

function gapClass(gap: ContainerSpacing): string {
  switch (gap) {
    case 'none':
      return '';
    case 'sm':
      return 'gap-container-sm';
    case 'md':
      return 'gap-container-md';
    case 'lg':
      return 'gap-container-lg';
    default: {
      const _exhaustive: never = gap;
      return _exhaustive;
    }
  }
}

function paddingClass(padding: ContainerSpacing): string {
  switch (padding) {
    case 'none':
      return '';
    case 'sm':
      return 'p-container-padding-sm';
    case 'md':
      return 'p-container-padding-md';
    case 'lg':
      return 'p-container-padding-lg';
    default: {
      const _exhaustive: never = padding;
      return _exhaustive;
    }
  }
}

function marginClass(margin: ContainerSpacing): string {
  switch (margin) {
    case 'none':
      return '';
    case 'sm':
      return 'm-container-margin-sm';
    case 'md':
      return 'm-container-margin-md';
    case 'lg':
      return 'm-container-margin-lg';
    default: {
      const _exhaustive: never = margin;
      return _exhaustive;
    }
  }
}

function widthClass(width: ContainerSize, margin: ContainerSpacing): string {
  switch (width) {
    case 'auto':
      return 'w-container-auto';
    case 'fit':
      return 'w-container-fit';
    case 'full':
    case 'half':
    case 'third':
    case 'two-thirds':
    case 'quarter':
    case 'three-quarters':
    case 'screen':
      return WIDTH_GUTTERED_CLASS[width][margin];
    default: {
      const _exhaustive: never = width;
      return _exhaustive;
    }
  }
}

function heightClass(height: ContainerSize, margin: ContainerSpacing): string {
  switch (height) {
    case 'auto':
      return 'h-container-auto';
    case 'fit':
      return 'h-container-fit';
    case 'full':
    case 'half':
    case 'third':
    case 'two-thirds':
    case 'quarter':
    case 'three-quarters':
    case 'screen':
      return HEIGHT_GUTTERED_CLASS[height][margin];
    default: {
      const _exhaustive: never = height;
      return _exhaustive;
    }
  }
}

function backgroundClass(background: ContainerBackground): string {
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

function borderClass(border: ContainerBorder): string {
  switch (border) {
    case 'none':
      return '';
    case 'subtle':
      return 'border-container border-container-subtle';
    case 'strong':
      return 'border-container border-container-strong';
    case 'primary':
      return 'border-container border-container-primary';
    default: {
      const _exhaustive: never = border;
      return _exhaustive;
    }
  }
}

function roundedClass(rounded: ContainerRounded): string {
  switch (rounded) {
    case 'none':
      return '';
    case 'sm':
      return 'rounded-container-sm';
    case 'md':
      return 'rounded-container-md';
    case 'lg':
      return 'rounded-container-lg';
    default: {
      const _exhaustive: never = rounded;
      return _exhaustive;
    }
  }
}
