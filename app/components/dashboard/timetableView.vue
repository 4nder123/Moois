<template>
  <Popover ref="popover"> {{ description }} </Popover>
  <FullCalendar ref="timetable" class="timetable" :options="calendarOptions" />
</template>

<script lang="ts" setup>
import FullCalendar from "@fullcalendar/vue3";
import EtLocale from "@fullcalendar/core/locales/et";
import EnGbLocale from "@fullcalendar/core/locales/en-gb";
import timeGridPlugin from "@fullcalendar/timegrid";
import Popover from "./popoverBase.vue";
import type {
  DateInput,
  DateRangeInput,
  EventClickArg,
} from "@fullcalendar/core/index.js";

const emit = defineEmits(["show-settings", "change-view"]);
const props = defineProps<{ events: TimetableEvents }>();

const popover = ref<InstanceType<typeof Popover> | null>(null);
const timetable = ref<InstanceType<typeof FullCalendar> | null>(null);
const description = ref<string>("");
const { locale } = useI18n();

const calendarLocale = computed(() =>
  locale.value === "et" ? EtLocale : EnGbLocale,
);

const getWeekStart = (d: DateInput) => {
  const date = new Date(String(d)),
    day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  return date.toLocaleDateString("en-GB");
};

const getEvents = async (info: DateRangeInput) => {
  if (!info.start) return [];
  const weekKey = getWeekStart(info.start);
  return (await props.events[weekKey]) || [];
};

const eventClick = (info: EventClickArg) => {
  description.value = info.event.extendedProps.description;
  popover.value?.showPopover(info.el);
};

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
  locale: calendarLocale.value,
  timeZone: "Europe/Tallinn",
  initialView: "timeGridWeek",
  nowIndicator: true,
  slotMinTime: "08:00",
  slotMaxTime: "21:00",
  contentHeight: "auto",
  slotEventOverlap: false,
  allDaySlot: false,
  lazyFetching: true,
  events: getEvents,
  eventClick: eventClick,
  eventTextColor: "black",
  progressiveEventRendering: true,
  headerToolbar: {
    left: "prev,next today",
    center: "title",
    right: "timeGridWeek,timeGridDay homework settings",
  },
};

watch(
  () => [props.events, calendarLocale.value],
  () => {
    const api = timetable.value?.getApi?.();
    if (api && typeof api.refetchEvents === "function") {
      api.refetchEvents();
    }
    if (api && typeof api.setOption === "function") {
      api.setOption("locale", calendarLocale.value);
    }
  },
  { deep: true },
);
</script>

<style>
@media (max-width: 500px) {
  .timetable .fc .fc-toolbar.fc-header-toolbar {
    font-size: 3.2vw;
  }
  .timetable .fc-header-toolbar .fc-toolbar-chunk {
    font-size: 3.2vw;
  }
  .timetable .fc-settings-button .fa-gear {
    font-size: 3.2vw;
  }
}
@media (max-width: 715px) {
  .timetable .fc-toolbar-title {
    display: none;
  }
}
.fc .fc-timegrid-axis-frame {
  display: none;
}
.fc .fc-daygrid-body-natural .fc-daygrid-day-events {
  margin-bottom: 1px;
}
.fc .fc-daygrid-body-unbalanced .fc-daygrid-day-events {
  min-height: 0px;
}
</style>
