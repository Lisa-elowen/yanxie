/** @type {import('tailwindcss').Config} */

module.exports = {

  content: [

    './pages/**/*.{js,ts,jsx,tsx,mdx}',

    './components/**/*.{js,ts,jsx,tsx,mdx}',

    './app/**/*.{js,ts,jsx,tsx,mdx}',

  ],

  theme: {

    extend: {

      colors: {

        wechat: {

          bg: '#ededed',

          header: '#1a1a2e',

          green: '#07c160',

          'green-dark': '#06ad56',

          bubble: '#95ec69',

          'bubble-self': '#95ec69',

          text: '#191919',

          'text-secondary': '#b2b2b2',

          input: '#f7f7f7',

          divider: '#e6e6e6',

        },

        night: {

          bg: '#11111a',

          card: '#1a1a2e',

          bubble: '#2d2d44',

          'bubble-self': '#1a6b3c',

          accent: '#4fc3f7',

          surface: '#16213e',

        },

      },

      backgroundImage: {

        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',

        'gradient-conic':

          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',

      },

    },

  },

  plugins: [],

}