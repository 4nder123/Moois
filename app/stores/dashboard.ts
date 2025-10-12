export const useDashboardStore = defineStore(
  "dashboardStore",
  () => {
    const defaultView = ref<"timetable" | "homework">("timetable");

    const setDefaultView = (view: "timetable" | "homework") => {
      defaultView.value = view;
    };

    return { defaultView, setDefaultView };
  },
  {
    persist: [
      {
        pick: ["defaultView"],
      },
    ],
  },
);
