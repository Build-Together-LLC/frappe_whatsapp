const secondary = '#475569';

// eslint-disable-next-line @typescript-eslint/no-var-requires,no-undef
const colors = require('tailwindcss/colors');
// eslint-disable-next-line @typescript-eslint/no-var-requires,no-undef
const plugin = require('tailwindcss/plugin');

// eslint-disable-next-line no-undef
module.exports = {
  prefix: 'tw-',
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // backgroundImage: {
      //   'login-pattern': "url('../../images/login-bg.png')",
      //   'report-bg': 'url(../../images/bg.png);'
      // },
      // boxShadow: {
      //   DEFAULT:
      //     '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
      //   md: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
      //   lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.01)',
      //   xl: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.01)',
      //   nav_cus: '0px 1px 0px rgba(0, 0, 0, 0.15)',
      //   icons: ' 0px 0px 8px rgba(0, 0, 0, 0.12)',
      //   l: 'inset -0.5px 0px 0px #64748B',
      //   r: '0px 0px 4px rgba(0, 0, 0, 0.25)',
      //   side: '0px 0px 5px rgba(104, 140, 241, 0.3);',
      //   profile_container: '0px 0px 6.34069px rgba(104, 140, 241, 0.3);',
      //   sm_box:
      //     '0 0 15px -3px rgba(0, 0, 0, 0.3), 0 0 6px -2px rgba(0, 0, 0, 0.1)'
      // },
      colors: {
        gray: {
          ...colors.slate,

          50: '#F9FAFA',
          100: '#EEEEEE',
          150: '#64748B',
          200: '#EBEBEB',
          250: '#777777',
          300: '#373737',
          350: '#F6F6F6',
          400: '#8A8A8A',
        },
        'light-blue': { ...colors.sky },

        red: {
          ...colors.rose,
          50: '#FF2121',
        },
        // primary: {
        //   DEFAULT: primary,
        //   50: '#EEF2FF',
        //   100: '#E0E7FF',
        //   200: '#C7D2FE',
        //   300: '#A5B4FC',
        //   400: '#818CF8',
        //   500: '#6366F1',
        //   600: primary,
        //   700: '#4338CA',
        //   800: '#3730A3',
        //   900: '#312E81'
        // },
        secondary: {
          DEFAULT: secondary,
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: secondary,
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        green: {
          50: '#25D366',
        },
        'gray-darker': '#B0B0B0',
        'gray-lighter': '#F9F9F9',
        'purple-custom': '#4338CA',
        'sky-blue': '#F2FCFF',
        'deep-green': '#228B22',
        'deep-yellow': '#FFB800',
        'deep-blue': '#2563EB',
        'deep-violet': '#AF4AFF',
        'deep-red': '#FF1919',
        'light-red': '#ff5757',
        'dark-grey': '#656565',
        dark: '#1F272E',
        'light-pink': '#FFFBE6',
        'transparent-bg': 'rgba(255,255,255,0.2)',
        yellow: '#FF9900',
      },
      // spacing: {
      //   7.5: '1.875rem', // 30px
      //   12: '3rem',
      //   15: '3.75rem', // 60px
      //   22: '5.5rem', // 88px
      //   25: '6.25rem', // 100px
      //   26: '6.5rem', // 104px
      //   30: '8.5rem', // 136px
      //   32: '9rem', // 144px
      //   68: '17rem' // 272px
      // },
      // padding: {
      //   px: '1px'
      // },
      // margin: {
      //   px: '1px',
      //   '-px': '-1px',
      //   '-2px': '-2px',
      //   auto: 'auto',
      //   4.5: '18px'
      // },
      fontSize: {
        vs: ['0.5625rem', { lineHeight: '0.675rem' }],
        xs: ['0.75rem', { lineHeight: '1.5' }],
        sm: ['0.875rem', { lineHeight: '1.5715' }],
        base: ['1rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
        lg: ['1.125rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
        xl: ['1.25rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
        '2xl': ['1.5rem', { lineHeight: '1.33', letterSpacing: '-0.01em' }],
        '3xl': ['1.88rem', { lineHeight: '1.33', letterSpacing: '-0.01em' }],
        '4xl': ['2.25rem', { lineHeight: '1.25', letterSpacing: '-0.02em' }],
        '5xl': ['3rem', { lineHeight: '1.25', letterSpacing: '-0.02em' }],
        '6xl': ['3.75rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        micro: '.5rem', // 8px
        xxs: '.625rem', // 10px
        md: '1.125rem', // 18px
        macro: ['2rem', { lineHeight: '2.375rem' }],
      },
      // fontWeight: {
      //   hairline: 100
      // },
      // fontFamily: {
      //   inter: ['Inter', 'sans-serif'],
      //   brand: ['Source Sans Pro', 'sans-serif'],
      //   sans: ['Source Sans Pro', 'sans-serif'],
      //   serif: ['Source Sans Pro', 'sans-serif'],
      //   inconsolata: ['Inconsolata'],
      //   source: [
      //     'source-code-pro',
      //     'Menlo',
      //     'Monaco',
      //     'Consolas',
      //     'Courier New',
      //     'monospace'
      //   ]
      // },
      // minWidth: {
      //   36: '9rem',
      //   44: '11rem',
      //   56: '14rem',
      //   60: '15rem',
      //   72: '18rem',
      //   80: '20rem',
      //   site: '18.75rem',
      //   'input-mini': '17.5rem',
      //   'input-small': '31.25rem',
      //   'input-medium': '36.3125rem',
      //   'input-large': '61.45rem',
      //   'button-mini': '5.5rem',
      //   'button-small': '7rem',
      //   'button-medium': '9.875rem',
      //   'button-large': '10rem'
      // },
      width: {
        'sm-card': '7.812rem',
        18: '4.5rem',
        54: '13.4375rem',
        100: '25.75',
        arrow: '.8rem',
        '3/10': '30%',
        '7/10': '70%',
        '9/10': '90%',
        '12/25': '48%',
      },
      // maxWidth: {
      //   '8xl': '88rem',
      //   '9xl': '96rem',
      //   sm: '30rem',
      //   md: '40rem',
      //   lg: '50rem',
      //   xl: '60rem',
      //   '2xl': '70rem',
      //   '3xl': '80rem',
      //   '4xl': '90rem',
      //   '5xl': '100rem',
      //   '1/4': '25%',
      //   '1/2': '50%',
      //   '3/5': '60%',
      //   '4/5': '80%',
      //   '9/10': '90%',
      //   'site-mini': '17.5rem',
      //   'site-small': '31.25rem',
      //   'site-medium': '43.75rem',
      //   'site-large': '56.25rem',
      //   site: '73.75rem',
      //   screen: '100vw'
      // },
      // height: {
      //   arrow: '.4rem',
      //   0.25: '0.25px',
      //   px: '1px',
      //   90: '90vh',
      //   4: '1rem',
      //   5: '1.25rem',
      //   8: '1.8rem',
      //   9: '2.25rem',
      //   10: '2.5rem',
      //   11: '2.75rem',
      //   12: '3rem',
      //   16: '4rem',
      //   24: '6rem',
      //   32: '8rem',
      //   38: '9.375rem'
      // },
      // borderWidth: {
      //   0.25: '0.25px',
      //   0.65: '0.622px',
      //   1: '1px',
      //   3: '3px',
      //   5: '5px'
      // },
      // borderRadius: {
      //   mini: '1.24422px',
      //   half: '50%',
      //   full: '100%',
      //   btnr: '3.1rem',
      //   md: '0.375rem'
      // },
      // zIndex: {
      //   1: 1,
      //   2: 2,
      //   3: 3,
      //   4: 4,
      //   5: 5,
      //   6: 6,
      //   60: '60'
      // },
      // fill: {
      //   transparent: 'transparent'
      // },
      // flex: {
      //   2: '2 2 0%',
      //   3: '3 3 0%'
      // },
      // screens: {
      //   xs: '480px'
      // },
      // outline: {
      //   blue: '2px solid rgba(0, 112, 244, 0.5)',
      //   none: 'none'
      // }
      animation: {
        fade: 'fadeIn 0.3s ease-in-out',
      },
    },
  },
  plugins: [
    // eslint-disable-next-line global-require
    // require('@tailwindcss/forms'),
    // add custom variant for expanding sidebar
    plugin(({ addVariant, e }) => {
      addVariant('sidebar-expanded', ({ modifySelectors, separator }) => {
        modifySelectors(
          ({ className }) =>
            `.sidebar-expanded .${e(
              `sidebar-expanded${separator}${className}`
            )}`
        );
      });
    }),
  ],
  corePlugins: {
    preflight: false,
    borderCollapse: true,
  },
};
