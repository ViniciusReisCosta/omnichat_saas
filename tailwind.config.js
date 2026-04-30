/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1273eb',
        secondary: '#ee2852',
        dark: {
          DEFAULT: '#040836',
          secondary: '#202942',
        },
        heading: '#202942',
        paragraph: '#666666',
        gray: {
          bg: '#f7f7f7',
        },
      },
      fontFamily: {
        heading: ['Manrope', 'sans-serif'],
        body: ['Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 25px 70px rgba(0, 0, 0, 0.07)',
        primary: '1px 4px 20px -2px rgba(0, 0, 0, 0.1)',
        regular: '0px 2px 12px 0px #e7e7e7',
        extra: '0 5px 50px 0 rgba(0, 0, 0, 0.15)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(45deg, #ee2852 0%, #1273eb 50%)',
        'gradient-btn': 'linear-gradient(to right, #118bba, #1273eb, #118bba)',
      },
      borderRadius: {
        card: '10px',
        pill: '40px',
      },
      maxWidth: {
        container: '1200px',
        'container-full': '1400px',
      },
    },
  },
  plugins: [],
};
