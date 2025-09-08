/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,ts}"],
  theme: {
    extend: {
      colors: {
        // paleta baseada no site: navy + petróleo + ciano
        navy: {
          900: "#0B2A3A", // header/footer
          800: "#103447",
        },
        petrol: "#0E3B52", // cards/fundos
        teal: {
          400: "#27C3D6", // acento (botões/ícones)
          500: "#1FB7CA",
        },
        slate: {
          100: "#F2F6F8",
          300: "#C9D6DE",
          600: "#6B8797",
        },
      },
      boxShadow: {
        soft: "0 10px 25px rgba(0,0,0,.08)",
      },
      borderRadius: {
        xxl: "1.25rem",
      },
    },
  },
  plugins: [],
};
