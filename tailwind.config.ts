import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'krishi-bg': '#FAF3E0',
        'krishi-heading': '#1F3C88',
        'krishi-primary': '#B85C38',
        'krishi-agriculture': '#7FB069',
        'krishi-highlight': '#F2A541',
        'krishi-text': '#1D1D1D',
        'krishi-border': '#D8CFC0',
      },
    },
  },
  plugins: [],
}
export default config
