/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#dce5fd',
          200: '#b9cbfc',
          300: '#8aa7f9',
          400: '#5578f4',
          500: '#3355ef',
          600: '#2540e4',
          700: '#1e31c9',
          800: '#1e2da4',
          900: '#1e2b82',
        },
        teal: {
          50: '#E1F5EE',
          500: '#1D9E75',
          600: '#0F6E56',
        },
        amber: {
          50: '#FAEEDA',
          500: '#BA7517',
          600: '#854F0B',
        }
      }
    },
  },
  plugins: [],
}
