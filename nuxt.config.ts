// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  app: { head: { title: "Moois" } },
  modules: [
    "@nuxt/eslint",
    "@nuxtjs/i18n",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
    "@nuxt/content",
  ],
  css: ["~/assets/css/global.css"],
  i18n: {
    locales: [
      //{ code: "en", name: "English", file: "en.json" },
      { code: "et", name: "Eesti", file: "et.json" },
    ],
    defaultLocale: "et",
  },
  piniaPluginPersistedstate: {
    storage: "cookies",
    cookieOptions: {
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
    },
  },
});
