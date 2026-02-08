<template>
  <div>
    <LoadingDots ref="loader" />
    <SettingsModal
      ref="settingsModal"
      :event-urls="eventUrls"
      @close="closeSettings"
      @logout="handleLogout"
    />
    <DashboardTimetableView
      v-if="viewParam === 'timetable'"
      :events="timetableEvents"
      @change-view="changeView"
      @show-settings="showSettings"
    />
    <DashboardHomeworkView
      v-else-if="viewParam === 'homework'"
      :events="homeworkEvents"
      @change-view="changeView"
      @show-settings="showSettings"
      @event-updated="HomeworkEventUpdated"
      @event-added="HomeworkEventAdded"
      @event-removed="HomeworkEventRemoved"
    />
  </div>
</template>

<script setup lang="ts">
import LoadingDots from "~/components/loadingDots.vue";
import SettingsModal from "~/components/dashboard/settingsModal.vue";
import { io } from "socket.io-client";

definePageMeta({
  auth: {
    unauthenticatedOnly: false,
    navigateUnauthenticatedTo: "/login",
  },
  middleware: [
    function (to) {
      const qp = to.query.view;
      const dashboardStore = useDashboardStore();
      const localePath = useLocalePath();
      dashboardStore.$persist();
      if (qp !== "homework" && qp !== "timetable") {
        return navigateTo({
          path: localePath(to.path),
          query: { view: dashboardStore.defaultView },
          hash: to.hash,
        });
      }
    },
  ],
});

const socket = io();
const loader = ref<InstanceType<typeof LoadingDots> | null>(null);
const settingsModal = ref<InstanceType<typeof SettingsModal> | null>(null);
const [timetableResult, homeworkResult] = await Promise.all([
  useFetch<TimetableEvents>("/api/events/timetable", {
    onResponseError({ response }) {
      handleAuthFailure(response.status);
    },
  }),
  useFetch<HomeworkEvent[]>("/api/events/homework", {
    onResponseError({ response }) {
      handleAuthFailure(response.status);
    },
  }),
]);
const { data: timetableData, refresh: refreshTimetable } = timetableResult;
const { data: homeworkData, refresh: refreshHomework } = homeworkResult;
let refreshInterval: ReturnType<typeof setInterval> | null = null;
const store = useDashboardStore();

const { data: session } = await authClient.useSession(useFetch);

const timetableEvents = computed<TimetableEvents>(() => {
  return (timetableData.value ?? {}) as TimetableEvents;
});
const homeworkEvents = computed<HomeworkEvent[]>(() => {
  return (homeworkData.value?.filter(
    (e) =>
      !store.filter.includes(e.extendedProps.status) &&
      !store.filter.includes(e.extendedProps.color),
  ) ?? []) as HomeworkEvent[];
});

const eventUrls = computed(() => {
  const user = session.value?.user as User;
  return {
    timetable: user?.timetableUrl ?? "",
    homework: user?.homeworkUrl ?? "",
  };
});

const route = useRoute();

const viewParam = computed(() => route.query.view);

const localePath = useLocalePath();
const handleAuthFailure = (status?: number) => {
  if (status === 401) {
    navigateTo(localePath("/login"), { replace: true });
  }
};

const changeView = () => {
  const next = viewParam.value === "timetable" ? "homework" : "timetable";
  navigateTo(
    localePath({
      name: route.name ?? undefined,
      path: route.path,
      query: { view: next },
      hash: route.hash,
    }),
  );
};

const handleLogout = async () => {
  try {
    settingsModal.value?.$el.close();
    loader.value?.start();
    await authClient.signOut();
    socket.disconnect();
    navigateTo(localePath("/login"), { replace: true });
  } finally {
    loader.value?.stop();
  }
};

const updateHomeworkState = async (event: {
  id: string;
  status: EventStatus;
  color: HighColor | "";
}) => {
  homeworkData.value = homeworkData.value?.map((e) =>
    e.id === event.id
      ? {
          ...e,
          extendedProps: {
            ...e.extendedProps,
            status: event.status,
            color: event.color,
          },
        }
      : e,
  );
};

const addHomeworkEvent = (event: HomeworkEvent) => {
  homeworkData.value = [...(homeworkData.value ?? []), event];
};

const removeHomeworkEvent = (event: { id: string }) => {
  homeworkData.value = homeworkData.value?.filter((e) => e.id !== event.id);
};

const HomeworkEventUpdated = (event: {
  id: string;
  status: EventStatus;
  color: HighColor | "";
  userAdded: boolean;
}) => {
  updateHomeworkState(event);
  socket.emit("event-updated", event);
};

const HomeworkEventAdded = (event: HomeworkEvent) => {
  addHomeworkEvent(event);
  socket.emit("event-added", event);
};

const HomeworkEventRemoved = (event: { id: string }) => {
  removeHomeworkEvent(event);
  socket.emit("event-removed", event);
};

const showSettings = () => {
  settingsModal.value?.$el.showModal();
};

const closeSettings = async (
  changed: Partial<{ timetableUrl: string; homeworkUrl: string }>,
) => {
  settingsModal.value?.$el.close();
  if (!changed || Object.keys(changed).length === 0) return;
  try {
    loader.value?.start();
    await authClient.updateUser({
      ...changed,
      fetchOptions: { method: "POST" },
    });

    const refreshers: Promise<void>[] = [];
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

const startAutoRefresh = () => {
  refreshInterval = setInterval(
    () => {
      refreshTimetable();
      refreshHomework();
    },
    30 * 60 * 1000,
  );
};

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

onMounted(() => {
  socket.connect();
  socket.on("event-updated", (event) => {
    updateHomeworkState(event);
  });
  socket.on("event-added", (event) => {
    addHomeworkEvent(event);
  });
  socket.on("event-removed", (event) => {
    removeHomeworkEvent(event);
  });
  startAutoRefresh();
});

onBeforeMount(() => {
  stopAutoRefresh();
  socket.off("event-updated");
  socket.off("event-added");
  socket.off("event-removed");
  socket.disconnect();
});
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
  -webkit-mask-image: url(/icons/gear.svg);
  mask-image: url(/icons/gear.svg);
  background-color: currentColor;
  max-width: 1rem;
}

.fc-icon.fc-icon-addEvent {
  -webkit-mask-image: url(/icons/plus.svg);
  mask-image: url(/icons/plus.svg);
  background-color: currentColor;
  max-width: 14px;
}

.fc-icon.fc-icon-trash {
  -webkit-mask-image: url(/icons/trash.svg);
  mask-image: url(/icons/trash.svg);
  background-color: currentColor;
  pointer-events: none;
  max-width: 14px;
}

.fc-icon.fc-icon-check {
  -webkit-mask-image: url(/icons/check.svg);
  mask-image: url(/icons/check.svg);
  background-color: currentColor;
  pointer-events: none;
  max-width: 14px;
}

.fc-icon.fc-icon-filter {
  -webkit-mask-image: url(/icons/filter.svg);
  mask-image: url(/icons/filter.svg);
  background-color: currentColor;
  max-width: 14px;
}
</style>
