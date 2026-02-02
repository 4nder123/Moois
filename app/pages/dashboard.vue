<template>
  <div>
    <LoadingDots ref="loader" />
    <SettingsModal
      ref="settingsModal"
      :event-urls="eventUrls"
      @close="closeSettings"
      @logout="handleLogout"
    />
    <TimetableView
      v-if="viewParam === 'timetable'"
      :events="timetableEvents"
      @change-view="changeView"
      @show-settings="showSettings"
    />
    <HomeworkView
      v-else-if="viewParam === 'homework'"
      :events="homeworkEvents"
      @change-view="changeView"
      @show-settings="showSettings"
    />
  </div>
</template>

<script setup lang="ts">
import LoadingDots from "~/components/loadingDots.vue";
import SettingsModal from "~/components/settingsModal.vue";

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

const loader = ref<InstanceType<typeof LoadingDots> | null>(null);
const settingsModal = ref<InstanceType<typeof SettingsModal> | null>(null);
const { data: timetableData, refresh: refreshTimetable } =
  await useFetch<TimetableEvents>("/api/events/timetable");
const { data: homeworkData, refresh: refreshHomework } = await useFetch<
  HomeworkEvent[]
>("/api/events/homework");

const { data: session } = await authClient.useSession(useFetch);

const eventUrls = computed(() => {
  const user = (session.value?.user as any) || {};
  return {
    timetable: user.timetableUrl ?? "",
    homework: user.homeworkUrl ?? "",
  };
});
const timetableEvents = computed<TimetableEvents>(() => {
  return (timetableData.value ?? {}) as TimetableEvents;
});
const homeworkEvents = computed<HomeworkEvent[]>(() => {
  return (homeworkData.value ?? []) as HomeworkEvent[];
});
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
    settingsModal.value?.$el.close();
    loader.value?.start();
    await authClient.signOut();
    navigateTo("/login", { replace: true });
  } finally {
    loader.value?.stop();
  }
};

const showSettings = () => {
  settingsModal.value?.$el.showModal();
};

const closeSettings = async (
  changed: Partial<{ timetableUrl: string; homeworkUrl: string }>,
) => {
  settingsModal.value?.$el.close();
  if (!changed && Object.keys(changed).length === 0) return;
  try {
    loader.value?.start();
    await authClient.updateUser({
      ...changed,
    } as any);

    const refreshers: Promise<any>[] = [];
    if ("homeworkUrl" in changed) {
      refreshers.push(refreshHomework());
    }
    if ("timetableUrl" in changed) {
      refreshers.push(refreshTimetable());
    }
    if (refreshers.length > 0) {
      await Promise.all(refreshers);
    }
  } finally {
    loader.value?.stop();
  }
};
</script>

<style>
.fc-icon {
  mask-repeat: no-repeat;
  mask-size: contain;
  mask-position: center;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: contain;
  -webkit-mask-position: center;
}
.fc-icon.fc-icon-settings {
  -webkit-mask-image: url(./icons/gear.svg);
  mask-image: url(./icons/gear.svg);
  background-color: currentColor;
  max-width: 1rem;
}
</style>
