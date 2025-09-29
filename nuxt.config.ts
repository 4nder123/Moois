// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/eslint", "@nuxtjs/i18n"],
  css: ["~/assets/css/global.css"],
  i18n: {
    locales: [
      //{ code: "en", name: "English", file: "en.json" },
      { code: "et", name: "Eesti", file: "et.json" },
    ],
    defaultLocale: "et",
  },
});
