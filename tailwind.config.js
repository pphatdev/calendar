/** @type {import('tailwindcss').Config} */ 
module.exports = {
    content: [
        "./src/**/*.{html,js}",
        "./src/*.{html,js}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                poppins:["'Poppins'",'sans-serif']
            }
        },
    },
    plugins: [],
}