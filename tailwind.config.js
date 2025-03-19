/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            color: 'var(--tw-prose-body)',
            h1: {
              color: 'var(--tw-prose-headings)',
            },
            h2: {
              color: 'var(--tw-prose-headings)',
            },
            h3: {
              color: 'var(--tw-prose-headings)',
            },
            h4: {
              color: 'var(--tw-prose-headings)',
            },
            strong: {
              color: 'var(--tw-prose-bold)',
            },
            a: {
              color: '#a78bfa',
              '&:hover': {
                color: '#c4b5fd',
              },
            },
            '--tw-prose-body': '#374151',
            '--tw-prose-headings': '#111827',
            '--tw-prose-bold': '#111827',
            '--tw-prose-bullets': '#374151',
            '--tw-prose-quotes': '#111827',
            '--tw-prose-invert-body': '#d1d5db',
            '--tw-prose-invert-headings': '#fff',
            '--tw-prose-invert-bold': '#fff',
            '--tw-prose-invert-bullets': '#d1d5db',
            '--tw-prose-invert-quotes': '#f3f4f6',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};