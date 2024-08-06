import type { SVGProps } from 'react'

export default function SeedlingIcon({
  variant = 'color',
  ...props
}: SVGProps<SVGSVGElement> & {
  variant: 'color' | 'monochrome'
}) {
  return (
    <svg viewBox="0 0 24 24" {...props} fill="none">
      <path
        d="M10 20C15.5 17.5 10.8 13.6 13 10"
        className={variant === 'color' ? 'stroke-green-700' : 'stroke-current'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 20H17"
        className={variant === 'color' ? 'stroke-green-900' : 'stroke-current'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 9.4C10.6 10.2 11.3 11.6 11.8 13.1C9.8 13.5 8.3 13.5 7 12.8C5.8 12.2 4.7 10.9 4 8.6C6.8 8.1 8.4 8.6 9.5 9.4Z"
        className={variant === 'color' ? 'stroke-green-500' : 'stroke-current'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.8537 5.75C13.0913 6.94156 12.7078 8.33615 12.7537 9.75C14.6537 9.65 16.0537 9.15 17.0537 8.35C18.0537 7.35 18.6537 6.05 18.7537 3.75C16.0537 3.85 14.7537 4.75 13.8537 5.75Z"
        className={variant === 'color' ? 'stroke-green-500' : 'stroke-current'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
