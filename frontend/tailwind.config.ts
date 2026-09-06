import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#15201D',
        canvas: '#F6F7F4',
        line: '#E5E9E4',
        brand: '#147D64',
        mint: '#DDF5EA',
        amber: '#E6A441',
        coral: '#DB725A',
        navy: '#1A2C37',
      },
      boxShadow: { card: '0 1px 2px rgba(16,24,40,.04), 0 8px 30px rgba(16,24,40,.035)' },
      borderRadius: { '2xl': '1.15rem' },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
