import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}', // Assuming components will be in src/components
    './public/**/*.html', // Though Next.js app router typically doesn't use public/index.html directly for main app shell
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      colors: { // Adding some colors from the example for consistency
        blue: {
          50: '#EBF8FF', // from-blue-50
          100: '#BEE3F8', // to-indigo-100 (using a blue shade as placeholder)
          200: '#90CDF4', // border-blue-200
          600: '#3182CE', // text-blue-600
          800: '#2B6CB0', // text-blue-800
          900: '#2C5282', // text-blue-900
        },
        indigo: {
          50: '#EBF4FF', // (placeholder, similar to blue-50)
          100: '#E0E7FF', // to-indigo-100
          200: '#C7D2FE', // text-indigo-200
          600: '#4F46E5', // bg-indigo-600
          700: '#4338CA', // bg-indigo-700
        },
        green: {
          50: '#F0FFF4', // bg-green-50
          200: '#9AE6B4', // border-green-200 & bg-green-200
          600: '#38A169', // text-green-600
          800: '#2F855A', // text-green-800
        },
        purple: {
          50: '#FAF5FF',   // bg-purple-50
          100: '#F3E8FF', // bg-purple-100
          200: '#E9D8FD', // bg-purple-200 & border-purple-200
          300: '#D6BCFA', // border-purple-300
          400: '#B794F4', // text-purple-400
          500: '#9F7AEA', // text-purple-500
          600: '#805AD5', // text-purple-600
          700: '#6B46C1', // text-purple-700
          800: '#553C9A', // text-purple-800
        },
      },
      gradientColorStops: { // For bg-gradient-to-br from-blue-50 to-indigo-100
        // This might need to be handled directly in class names if using default stops
        // or define specific gradients here if needed.
        // For now, the color definitions above will help.
      }
    },
  },
  plugins: [],
};

export default config;
