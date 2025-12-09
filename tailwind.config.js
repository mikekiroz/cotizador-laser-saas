/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Estos son solo EJEMPLOS - cámbialos a los que tú quieras
                primary: '#2563eb',      // Azul
                secondary: '#10b981',    // Verde  
                accent: '#f59e0b',       // Naranja
                dark: '#1f2937',         // Gris oscuro
                light: '#f9fafb',        // Gris claro
            }
        },
    },
    plugins: [],
}