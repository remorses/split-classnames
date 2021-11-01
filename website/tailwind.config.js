/** @type {import('tailwindcss/tailwind-config').TailwindConfig} */
module.exports = {
    mode: 'jit',
    purge: [
        './pages/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
    ],
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {
            colors: {
                primary: '#00bcd4',
                bg: {
                    800: '#1F1144',
                },
            },
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
}
