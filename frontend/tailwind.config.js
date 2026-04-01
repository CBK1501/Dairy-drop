/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(45 33% 98%)",
        foreground: "hsl(20 20% 15%)",
        card: "hsl(0 0% 100%)",
        "card-foreground": "hsl(20 20% 15%)",
        primary: "hsl(20 78% 55%)",
        "primary-foreground": "hsl(0 0% 100%)",
        secondary: "hsl(30 40% 90%)",
        "secondary-foreground": "hsl(20 30% 25%)",
        muted: "hsl(30 20% 94%)",
        "muted-foreground": "hsl(20 10% 45%)",
        border: "hsl(30 20% 88%)",
        destructive: "hsl(0 84% 60%)",
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        display: ["Plus Jakarta Sans", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};
