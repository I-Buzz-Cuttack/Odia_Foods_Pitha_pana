/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        temple: '#1A3A7A',
        sindoor: '#2DB843', 
        haldi: '#5BC8F0',
        rice: '#F0F8FF', 
        clay: '#4A6FA8', 
        ink: '#1A2B4A', 
      },
      boxShadow: {
        soft: "0 20px 60px rgba(91, 40, 16, 0.14)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Georgia", "serif"]
      },
      keyframes: {
        floatIn: {
          "0%": { opacity: 0, transform: "translateY(18px)" },
          "100%": { opacity: 1, transform: "translateY(0)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-700px 0" },
          "100%": { backgroundPosition: "700px 0" }
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" }
  }
      },
      animation: {
        floatIn: "floatIn .7s ease both",
        shimmer: "shimmer 2s linear infinite",
        marquee: "marquee 20s linear infinite"
      }
    }
  },
  plugins: []
};
