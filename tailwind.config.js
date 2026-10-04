/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mBlue: "#1B5FAE",
        mCyan: "#4E9AD1",
        mRed: "#E7002A",
        // Verde de la "N" del tablero (foto del hero): solo para decir que
        // algo está disponible. El rojo (mRed) queda para urgencia y "Usado".
        tftGreen: "#57E644",
        // Tres niveles de negro para dar profundidad (antes todo era el
        // mismo #0B0B0B y la página se leía como una sola masa negra):
        // fondo, secciones destacadas y tarjetas.
        surface: { DEFAULT: "#0B0B0B", raised: "#101316", card: "#14181B" },
        ink: "#111214",
        paper: "#F6F6F7",
      },
      fontFamily: {
        display: ["var(--font-rajdhani)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
