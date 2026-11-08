// Los colores apuntan a variables CSS (src/index.css) para soportar tema claro y oscuro.
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        'surface-3': 'var(--surface-3)',
        line: 'var(--border)',
        fg: 'var(--text)',
        'fg-2': 'var(--text-2)',
        muted: 'var(--muted)',
        primary: 'var(--primary)',
        'on-primary': 'var(--on-primary)',
        accent: 'var(--accent)',
        active: 'var(--active)',
        'on-active': 'var(--on-active)',
      },
      fontFamily: {
        sans: ['"Google Sans"', '"Google Sans Text"', 'Roboto', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '28px',
      },
    },
  },
  plugins: [
    require('tailwindcss-react-aria-components'),
    require("tailwindcss-animate")
  ],
}
