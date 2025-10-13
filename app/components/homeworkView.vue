<template>
  <FullCalendar :options="calendarOptions">
  </FullCalendar>
</template>
<script setup lang="ts">
import FullCalendar from "@fullcalendar/vue3";
import Locale from "@fullcalendar/core/locales/et";
import listPlugin from "@fullcalendar/list";

const emit = defineEmits(["show-settings", "change-view"]);

const calendarOptions = {
  plugins: [listPlugin],
  customButtons: {
    timetable: {
      text: $t("timetable.title"),
      click: () => emit("change-view"),
    },
    settings: {
      text: $t("settings.title"),
      icon: "settings",
      click: () => emit("show-settings"),
    },
  },
  headerToolbar: {
    left: "",
    right: "timetable settings",
  },
  initialView: "listWeek",
  defaultTimedEventDuration: 0,
  locale: Locale,
  lazyFetching: true,
  progressiveEventRendering: true,
  contentHeight: "auto",
};
</script>
