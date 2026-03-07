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
        // Legacy colors (keep for backward compatibility)
        'krishi-bg': '#FAF3E0',
        'krishi-heading': '#1F3C88',
        'krishi-primary': '#B85C38',
        'krishi-agriculture': '#7FB069',
        'krishi-highlight': '#F2A541',
        'krishi-text': '#1D1D1D',
        'krishi-border': '#D8CFC0',
        // New brand color system
        krishi: {
          indigo: '#2D2A6E',
          clay: '#C46A3D',
          cream: '#FFFDF7',
          green: '#4CAF50',
        },
      },
    },
  },
  plugins: [],
}
export default config
