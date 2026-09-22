/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        surface2: 'var(--surface-2)',
        surfaceHover: 'var(--surface-hover)',
        line: 'var(--border)',
        lineStrong: 'var(--border-strong)',
        ink: 'var(--text)',
        muted: 'var(--muted)',
        faint: 'var(--faint)',
        accent: 'var(--accent)',
        accentSoft: 'var(--accent-soft)',
        note: {
          yellow: 'var(--note-yellow)',
          pink: 'var(--note-pink)',
          blue: 'var(--note-blue)',
          green: 'var(--note-green)',
          purple: 'var(--note-purple)',
          gray: 'var(--note-gray)'
        }
      },
      boxShadow: {
        e1: 'var(--shadow-1)',
        e2: 'var(--shadow-2)'
      },
      borderRadius: {
        xl: '14px',
        '2xl': '18px'
      }
    }
  },
  plugins: []
};
