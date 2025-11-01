import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Sintegra - Baseada no OKR Manager
        primary: {
          50: '#e8f7fd',
          100: '#c9edfb',
          200: '#9de2f9',
          300: '#6dd5f6',
          400: '#4dc9f3',
          500: '#4DB5E8',  // Azul Sintegra principal (do logo)
          600: '#1E9FD8',
          700: '#1789be',
          800: '#2B5C9E',  // Azul corporativo (do logo)
          900: '#1e4177',
        },
        secondary: {
          50: '#f5f5f5',
          100: '#e5e5e5',
          200: '#d4d4d4',
          300: '#a3a3a3',
          400: '#A8A8A8',  // Cinza Sintegra (do logo)
          500: '#737373',
          600: '#525252',
          700: '#3D3D3D',  // Cinza Sintegra escuro (do logo)
          800: '#262626',
          900: '#171717',
        },
        status: {
          green: '#52c41a',
          yellow: '#faad14',
          red: '#ff4d4f',
        }
      },
      backgroundImage: {
        'gradient-sintegra': 'linear-gradient(135deg, #4DB5E8 0%, #2B5C9E 100%)',
        'gradient-sintegra-light': 'linear-gradient(135deg, #c9edfb 0%, #4DB5E8 100%)',
        'gradient-sintegra-reverse': 'linear-gradient(135deg, #2B5C9E 0%, #4DB5E8 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
