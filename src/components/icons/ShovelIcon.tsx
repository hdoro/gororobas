import type { SVGProps } from 'react'

export default function ShovelIcon({
  variant = 'color',
  ...props
}: SVGProps<SVGSVGElement> & {
  variant: 'color' | 'monochrome'
}) {
  return (
    <svg viewBox="0 0 32 32" {...props} fill="none">
      <path
        d="M12.6665 19.3334L21.3332 10.6667"
        className={variant === 'color' ? 'stroke-green-700' : 'stroke-current'}
        strokeWidth="2.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22.6667 2.66669L29.3333 9.33335L28.6667 10C28.2294 10.4386 27.7099 10.7867 27.1379 11.0241C26.5659 11.2616 25.9527 11.3838 25.3333 11.3838C24.714 11.3838 24.1007 11.2616 23.5287 11.0241C22.9567 10.7867 22.4372 10.4386 22 10C21.5614 9.56278 21.2134 9.04326 20.9759 8.47126C20.7384 7.89926 20.6162 7.28602 20.6162 6.66669C20.6162 6.04736 20.7384 5.43411 20.9759 4.86211C21.2134 4.29011 21.5614 3.7706 22 3.33335L22.6667 2.66669Z"
        className={variant === 'color' ? 'stroke-green-900' : 'stroke-current'}
        strokeWidth="2.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.6665 29.3333V22.6667L9.33317 16L15.9998 22.6667L9.33317 29.3333H2.6665Z"
        className={variant === 'color' ? 'stroke-green-500' : 'stroke-current'}
        strokeWidth="2.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
