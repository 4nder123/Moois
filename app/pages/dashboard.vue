<template>
  <div>
    <LoadingDots ref="loader" />
    <SettingsModal
      v-if="isSettingsVisible"
      @close="closeSettings"
      @logout="handleLogout"
    />
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
import LoadingDots from "~/components/loadingDots.vue";
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
const loader = ref<InstanceType<typeof LoadingDots> | null>(null);
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

const handleLogout = async () => {
  try {
    loader.value?.start();
    await authClient.signOut();
    navigateTo("/login", { replace: true });
  } finally {
    loader.value?.stop();
  }
};

const showSettings = () => {
  isSettingsVisible.value = true;
};

const closeSettings = () => {
  isSettingsVisible.value = false;
};
</script>
