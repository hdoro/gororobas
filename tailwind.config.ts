import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'

const config: Config = {
  content: ['src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
    colors: {
      ...colors,
      primary: 'rgb(14 128 95)',
      primarylight: 'rgb(248 255 253)',
      primaryhover: 'rgb(35 157 122)',
    },
  },
  plugins: [require('@tailwindcss/forms'), require('tailwindcss-animate')],
}
export default config
