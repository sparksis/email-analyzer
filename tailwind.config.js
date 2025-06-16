/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        'cascadia': ['Cascadia Code', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
