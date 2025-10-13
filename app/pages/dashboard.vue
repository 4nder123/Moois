<template>
  <div>
    <SettingsModal v-if="isSettingsVisible" @close="closeSettings" />
    <TimetableView
      v-if="viewParam === 'timetable'"
      @change-view="changeView"
      @show-settings="showSettings"
    />
    <HomeworkView
      v-else-if="viewParam === 'homework'"
      @change-view="changeView"
      @show-settings="showSettings"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  auth: {
    unauthenticatedOnly: false,
    navigateUnauthenticatedTo: "/login",
  },
  middleware: [
    function (to) {
      const qp = to.query.view;
      const dashboardStore = useDashboardStore();
      dashboardStore.$persist();
      if (qp !== "homework" && qp !== "timetable") {
        return navigateTo({
          path: to.path,
          query: { view: dashboardStore.defaultView },
          hash: to.hash,
        });
      }
    },
  ],
});

const isSettingsVisible = ref(false);
const route = useRoute();

const viewParam = computed(() => route.query.view);

const changeView = () => {
  const next = viewParam.value === "timetable" ? "homework" : "timetable";
  navigateTo({
    path: route.path,
    query: { view: next },
    hash: route.hash,
  });
};

const showSettings = () => {
  isSettingsVisible.value = true;
};

const closeSettings = () => {
  isSettingsVisible.value = false;
};
</script>
