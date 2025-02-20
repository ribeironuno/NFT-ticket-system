/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    darkMode: "class",
    theme: {
        screens: {
            xxxs: "280px",
            // => @media (min-width: 280px) { ... }

            xxs: "375px",
            // => @media (min-width: 375px) { ... }

            sm: "640px",
            // => @media (min-width: 640px) { ... }

            md: "768px",
            // => @media (min-width: 768px) { ... }

            lg: "1024px",
            // => @media (min-width: 1024px) { ... }

            xl: "1280px",
            // => @media (min-width: 1280px) { ... }

            "2xl": "1536px",
            // => @media (min-width: 1536px) { ... }
        },
        extend: {
            animation: {
                "fade-in-down": "fade-in-down 1s ease-out",
                spin: "spin 5s linear infinite",
                "fade-in": "fade-in 0.5s ease-out",
            },
            keyframes: {
                "fade-in-down": {
                    "0%": {
                        opacity: "0",
                        transform: "translateY(-10px)",
                    },
                    "100%": {
                        opacity: "1",
                        transform: "translateY(0)",
                    },
                },
                "fade-in": {
                    "0%": {
                        opacity: "0",
                    },
                    "100%": {
                        opacity: "1",
                    },
                },
            },
        },
    },
    variants: {
        extend: {
            backgroundColor: ["even"],
        },
        scrollbar: ["rounded"],
    },
    plugins: [
        require("tailwind-scrollbar"),
        require("@tailwindcss/forms"),
        require("@tailwindcss/line-clamp"),
    ],
    mode: "jit",
}
