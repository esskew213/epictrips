const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  mode: 'jit',
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', ...defaultTheme.fontFamily.sans],
        serif: ['Merriweather', ...defaultTheme.fontFamily.serif],
        rubik: ['Rubik', 'sans-serif'],
      },
      backgroundImage: {
        'search-photo': "url('/images/searchphoto.jpg')",
      },
      screens: {
        xs: '375px',
        ...defaultTheme.screens,
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
