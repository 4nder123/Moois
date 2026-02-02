<template>
  <Popover ref="popover" position="left">
    <div class="box red"></div>
    <div class="box orange"></div>
    <div class="box yellow"></div>
  </Popover>
  <FullCalendar ref="homeworkList" :options="calendarOptions">
    <template v-slot:eventContent="arg">
      <div class="event" :class="arg.event.extendedProps.color">
        <div class="eventTitle" :class="arg.event.extendedProps.status">
          {{ arg.event.title }}
        </div>
        <div class="eventButton" v-long-press @onLongPress="onLongPress">
          <div
            v-if="arg.event.extendedProps.userAdded === 'true' && isDelete"
            class="fc-icon deleteIcon"
          ></div>
          <div
            v-else-if="arg.event.extendedProps.status !== 'done'"
            class="fc-icon highlightIcon"
          ></div>
        </div>
      </div>
    </template>
  </FullCalendar>
</template>
<script setup lang="ts">
import FullCalendar from "@fullcalendar/vue3";
import Locale from "@fullcalendar/core/locales/et";
import listPlugin from "@fullcalendar/list";
import Popover from "../popoverBase.vue";
import type {
  DateRangeInput,
  EventClickArg,
} from "@fullcalendar/core/index.js";

const emit = defineEmits(["show-settings", "change-view"]);
const props = defineProps<{ events: HomeworkEvent[] }>();
const homeworkList = ref<InstanceType<typeof FullCalendar> | null>(null);
const popover = ref<InstanceType<typeof Popover> | null>(null);
const isDelete = ref(false);

const onLongPress = (event: Event) => {
  const targetElement = event.currentTarget as HTMLElement;
  const highlightIcon = targetElement.querySelector(".highlightIcon");
  if (highlightIcon) {
    popover.value?.showPopover(highlightIcon as HTMLElement);
  } 
};

const eventClick = (eventClick: EventClickArg) => {
  const { event, jsEvent } = eventClick;
  const targetElement = jsEvent.target as HTMLElement;
  const currentStatus = event.extendedProps.status;
  if (targetElement.classList.contains("highlightIcon")) {
    return;
  }
  const updatedStatus =
    currentStatus === "done" ? "" : "done";
  event.setExtendedProp("status", updatedStatus);
};

const setVisibleRange = (): DateRangeInput => {
  if (props.events.length === 0) return {};
  const dates = props.events.map((event) => event.start);
  const min = new Date(Math.min(...dates)).toISOString().split("T")[0];
  const max = new Date(Math.max(...dates) + 1000 * 60 * 60 * 24)
    .toISOString()
    .split("T")[0];
  return { start: min, end: max };
};

const calendarOptions = {
  plugins: [listPlugin],
  initialView: "homework",
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
  views: {
    homework: { type: "list", visibleRange: setVisibleRange },
  },
  headerToolbar: {
    left: "",
    right: "timetable settings",
  },
  events: async () => await props.events,
  eventClick: eventClick,
  defaultTimedEventDuration: 0,
  locale: Locale,
  lazyFetching: true,
  progressiveEventRendering: true,
  contentHeight: "auto",
};

watch(
  () => props.events,
  () => {
    const api = (homeworkList.value as any)?.getApi?.();
    if (api && typeof api.refetchEvents === "function") {
      api.refetchEvents();
    }
  },
  { deep: true },
);
</script>

<style>
td.fc-list-event-title {
  padding: 0px !important;
}
.fc-list-event {
  --fc-list-event-hover-bg-color: rgb(0, 0, 0, 0.05);
}
.done {
  text-decoration: line-through;
}
.event {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
}
.eventTitle {
  word-break: break-word;
  padding: 8px 0px 8px 14px;
}
.eventButton {
  display: flex;
  align-items: center;
  margin-right: 14px;
}
.highlightIcon {
  -webkit-mask-image: url(./icons/highlighter.svg);
  mask-image: url(./icons/highlighter.svg);
  background-color: currentColor;
  transform: scale(1.4);
}
.deleteIcon {
  -webkit-mask-image: url(./icons/trash.svg);
  mask-image: url(./icons/trash.svg);
  background-color: currentColor;
  max-width: 1rem;
}
.listView .fc-header-toolbar {
  position: fixed;
  z-index: 50;
  padding: 10px;
  background: var(--main-bg-color);
  right: 0;
  left: 0;
  top: 0;
}
.listView .fc-view-harness {
  top: 55px;
}
.shadow {
  box-shadow: 5px 0px 10px;
}
.box {
  float: left;
  height: 20px;
  width: 20px;
  border: 1px solid black;
  display: inline;
}
.box.red {
  background-color: red;
}
.box.orange {
  background-color: orange;
  margin-left: 10px;
}
.box.yellow {
  background-color: yellow;
  margin-left: 10px;
}
tr:has(.red) {
  background-color: rgb(255, 0, 0, 0.25);
}
tr:has(.orange) {
  background-color: rgb(255, 165, 0, 0.3);
}

tr:has(.yellow) {
  background-color: rgb(255, 255, 0, 0.25);
}
.fc-list-table {
  font-size: clamp(8px, 4vw, 16px) !important;
}
@media (max-width: 500px) {
  .eventButton {
    margin-right: 0px !important;
    padding: 0px 25.25px 0px 21.25px;
  }
}
@media (max-width: 400px) {
  .fc-list-event-time {
    white-space: normal !important;
  }
}
</style>
