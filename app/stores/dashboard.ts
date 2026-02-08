export const useDashboardStore = defineStore(
  "dashboardStore",
  () => {
    const defaultView = ref<"timetable" | "homework">("timetable");
    const highlightColor = ref<HighColor>("red");
    const filter = ref<string[]>([]);

    const setDefaultView = (view: "timetable" | "homework") => {
      defaultView.value = view;
    };

    const setHighlightColor = (color: HighColor) => {
      highlightColor.value = color;
    };

    const addFilter = (value: string) => {
      if (!filter.value.includes(value)) {
        filter.value.push(value);
      }
    };

    const removeFilter = (value: string) => {
      filter.value = filter.value.filter((v) => v !== value);
    };

    return {
      defaultView,
      setDefaultView,
      highlightColor,
      setHighlightColor,
      filter,
      addFilter,
      removeFilter,
    };
  },
  {
    persist: [
      {
        pick: ["defaultView", "darkMode"],
        key: "dashboard",
      },
      {
        pick: ["highlightColor", "filter"],
        key: "homeworkPreferences",
        storage: piniaPluginPersistedstate.localStorage(),
      },
    ],
  },
);
