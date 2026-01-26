/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                ss: {
                    primary: '#0253E5', // Vibrant Blue
                    navy: '#03194F',    // Dark Navy
                    action: '#1863DC',  // Action Blue
                }
            }
        },
    },
    plugins: [],
}
