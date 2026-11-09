const token = (nombre) => `rgb(var(--${nombre}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.ts'],
  theme: {
    extend: {
      colors: {
        fondo: token('fondo'),
        superficie: token('superficie'),
        hundido: token('hundido'),
        tinta: token('tinta'),
        tenue: token('tenue'),
        linea: token('linea'),
        marca: token('marca'),
        'sobre-marca': token('sobre-marca'),
        exito: token('exito'),
        aviso: token('aviso'),
        'aviso-fondo': token('aviso-fondo'),
        whatsapp: token('whatsapp'),
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.5rem' }],
        xl: ['1.375rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.75rem', { lineHeight: '2rem' }],
      },
      maxWidth: { app: '68rem' },
      minHeight: { toque: '2.75rem' },
      minWidth: { toque: '2.75rem' },
    },
  },
  plugins: [],
};
