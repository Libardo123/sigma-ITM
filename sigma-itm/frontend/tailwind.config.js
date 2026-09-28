/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        itm: {
          blue: '#011C5B',
          'blue-dark': '#001340',
          purple: '#661081',
          'purple-light': '#910581',
          gray: '#C6C6C6',
          dark: '#1D1D1B',
        }
      },
      fontFamily: {
        sans: ['Montserrat', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
