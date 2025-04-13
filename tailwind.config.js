/** @type {import('tailwindcss').Config} */
const colors = require('./utils/colors');

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        neutral: 'var(--color-neutral)',
        accent: 'var(--color-accent)',
        danger: 'var(--color-danger)',
        'primary-light': 'var(--color-primary-light)',
        'secondary-light': 'var(--color-secondary-light)',
        'secondary-border': 'var(--color-secondary-border)',
        'hover-primary': 'var(--color-hover-primary)',
        'hover-accent': 'var(--color-hover-accent)',
        'hover-danger': 'var(--color-hover-danger)',
        'bg-main': 'var(--color-bg-main)',
        'bg-secondary': 'var(--color-bg-secondary)',
        'bg-hover': 'var(--color-bg-hover)',
      },
    },
  },
  plugins: [],
} 