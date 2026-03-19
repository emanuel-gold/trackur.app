import * as Headless from '@headlessui/react'
import clsx from 'clsx'

export function CheckboxGroup({ className, ...props }) {
  return (
    <div
      data-slot="control"
      {...props}
      className={clsx(className, 'space-y-3')}
    />
  )
}

export function CheckboxField({ className, ...props }) {
  return (
    <Headless.Field
      data-slot="field"
      {...props}
      className={clsx(
        className,
        'grid grid-cols-[auto_1fr] items-start gap-x-3 gap-y-1',
        '*:data-[slot=control]:row-start-1 *:data-[slot=control]:col-start-1 *:data-[slot=control]:mt-0.5',
        '*:data-[slot=label]:col-start-2 *:data-[slot=label]:row-start-1',
        '*:data-[slot=description]:col-start-2 *:data-[slot=description]:row-start-2',
        'has-data-[slot=description]:**:data-[slot=label]:font-medium'
      )}
    />
  )
}

export function Checkbox({ color = 'mauve', className, ...props }) {
  return (
    <Headless.Checkbox
      data-slot="control"
      {...props}
      className={clsx(
        className,
        // Base styles
        'group inline-flex size-5 items-center justify-center rounded',
        // Transitions
        'transition duration-100',
        // Unchecked
        'border border-zinc-950/15 bg-white shadow-sm dark:border-white/15 dark:bg-white/5',
        // Checked
        color === 'mauve' && 'data-checked:border-transparent data-checked:bg-mauve-500 dark:data-checked:bg-mauve-500',
        color === 'red' && 'data-checked:border-transparent data-checked:bg-red-500 dark:data-checked:bg-red-500',
        // Focus
        'focus:not-data-focus:outline-hidden data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-mauve-500',
        // Hover
        'data-hover:border-zinc-950/25 dark:data-hover:border-white/25',
        'data-checked:data-hover:bg-mauve-600 dark:data-checked:data-hover:bg-mauve-400',
        // Disabled
        'data-disabled:opacity-50 data-disabled:cursor-default',
      )}
    >
      <svg
        className="size-3.5 stroke-white opacity-0 group-data-checked:opacity-100 transition-opacity"
        viewBox="0 0 14 14"
        fill="none"
      >
        <path
          d="M3 8L6 11L11 3.5"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Headless.Checkbox>
  )
}
