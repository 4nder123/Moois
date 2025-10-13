<template>
    <FullCalendar :options="calendarOptions" />
</template>

<script lang="ts" setup>
import FullCalendar from "@fullcalendar/vue3";
import Locale from "@fullcalendar/core/locales/et";
import timeGridPlugin from "@fullcalendar/timegrid";

const emit = defineEmits(["show-settings", "change-view"]);

const calendarOptions = {
  plugins: [timeGridPlugin],
  customButtons: {
    homework: { text: $t("homework.title"), click: () => emit("change-view") },
    settings: {
      text: $t("settings.title"),
      icon: "settings",
      click: () => emit("show-settings"),
    },
  },
  hiddenDays: [0, 6],
  locale: Locale,
  timeZone: "Europe/Tallinn",
  initialView: "timeGridWeek",
  nowIndicator: true,
  slotMinTime: "08:00",
  slotMaxTime: "21:00",
  contentHeight: "auto",
  slotEventOverlap: false,
  allDaySlot: false,
  lazyFetching: true,
  progressiveEventRendering: true,
  headerToolbar: {
    left: "prev,next today",
    center: "title",
    right: "timeGridWeek,timeGridDay homework settings",
  },
};
</script>
