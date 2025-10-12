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
  middleware: [
    function (to) {
      const qp = to.query.view;
      const dashboardStore = useDashboardStore();
      dashboardStore.$persist();
      if (qp !== "homework" && qp !== "timetable") {
        return navigateTo(
          {
            path: to.path,
            query: { view: dashboardStore.defaultView },
            hash: to.hash,
          },
          { replace: true },
        );
      }
    },
  ],
});

const isSettingsVisible = ref(false);
const route = useRoute();
const router = useRouter();

const viewParam = computed(() => route.query.view);

const changeView = () => {
  const next = viewParam.value === "timetable" ? "homework" : "timetable";
  router.push({
    path: route.path,
    query: { ...route.query, view: next },
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
