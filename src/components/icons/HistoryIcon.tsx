import type { SVGProps } from 'react'

export default function HistoryIcon({
  variant = 'color',
  ...props
}: SVGProps<SVGSVGElement> & {
  variant: 'color' | 'monochrome'
}) {
  return (
    <svg viewBox="0 0 24 24" {...props} fill="none">
      <path
        d="M16 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V7L15 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V7"
        className={variant === 'color' ? 'stroke-green-900' : 'stroke-current'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 2V6C14 6.53043 14.2107 7.03914 14.5858 7.41421C14.9609 7.78929 15.4696 8 16 8H20"
        className={variant === 'color' ? 'stroke-green-900' : 'stroke-current'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 22C11.3137 22 14 19.3137 14 16C14 12.6863 11.3137 10 8 10C4.68629 10 2 12.6863 2 16C2 19.3137 4.68629 22 8 22Z"
        className={variant === 'color' ? 'stroke-green-700' : 'stroke-current'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 17.5L8 16.25V14"
        className={variant === 'color' ? 'stroke-green-500' : 'stroke-current'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
