import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './fragments/**/*.{js,ts,jsx,tsx,mdx}',
        './layout/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                background: 'var(--background)',
                foreground: 'var(--foreground)',
                base: '#0B0F17',
                lighter: '#151B28',
                faded: '#ADB7CB',
                primary: '#4F90F0',
                white: '#FFFFFF',
                green: '#64FC6C'
            },
        },
    },
    plugins: [],
};
export default config;
