export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive("long-press", {
    getSSRProps() {
      return {};
    },
  });
});
