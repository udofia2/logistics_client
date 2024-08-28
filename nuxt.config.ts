// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ["~/assets/css/main.css", "leaflet/dist/leaflet.css"],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  image: {
    dir: "public/img",
  },
  modules: ["@nuxt/image"],

  runtimeConfig: {
    measurementId: "G-39CCVHVDKT",
    public: {
      SERVER_URL: process.env.SERVER_URL,
      GOOGLE_MAP_API_KEY: process.env.GOOGLE_MAP_API_KEY,
    },
  },
  // build: {
  //   transpile: ['axios']
  // },
});
