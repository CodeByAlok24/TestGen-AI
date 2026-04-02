/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: 'var(--brand-purple)',
          graphite: 'var(--brand-graphite)',
          lavender: 'var(--brand-lavender)',
          palePurple: 'var(--brand-pale-purple)',
          skyBlue: 'var(--brand-sky-blue)',
          neutralDark: 'var(--brand-neutral-dark)',
          lightGray: 'var(--brand-light-gray)',
          white: 'var(--brand-white)',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          2: 'var(--surface-2)',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.06), 0 18px 40px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
}

