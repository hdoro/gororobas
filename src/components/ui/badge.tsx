import { cn } from '@/utils/cn'
import { type VariantProps, tv } from 'tailwind-variants'

const badgeVariants = tv({
  base: 'inline-flex items-center rounded-full border px-3 py-2 text-sm leading-none whitespace-nowrap text-ellipsis font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  variants: {
    variant: {
      default: 'border-transparent bg-primary-100 text-primary-800',
      note: 'border-amber-200 bg-amber-100 text-amber-800',
      outline: 'border-current text-stone-700 bg-white',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
