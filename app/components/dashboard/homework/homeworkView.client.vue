<template>
  <AddEvent
    ref="addEventModal"
    @close="closeAddEvent"
    @event-added="emitAddEvent"
  />
  <FilterModal ref="filterModal" @close="closeFilterModal" />
  <Popover ref="popover" position="left">
    <div @click="onColorSelect">
      <div class="box red"></div>
      <div class="box orange"></div>
      <div class="box yellow"></div>
    </div>
  </Popover>
  <FullCalendar ref="homeworkList" class="listView" :options="calendarOptions">
    <template #eventContent="arg">
      <div
        class="event"
        :class="arg.event.extendedProps.color"
        :data-event-id="arg.event.id"
      >
        <div class="eventTitle" :class="arg.event.extendedProps.status">
          {{ arg.event.title }}
        </div>
        <div v-long-press class="eventButton" @onLongPress="onLongPress">
          <div
            v-if="
              (arg.event.extendedProps.userAdded && isDelete) ||
              arg.event.extendedProps.status !== 'done'
            "
            class="fc-icon"
            :class="
              arg.event.extendedProps.userAdded && isDelete
                ? 'fc-icon-trash'
                : 'highlightIcon'
            "
          ></div>
        </div>
      </div>
    </template>
  </FullCalendar>
</template>
<script setup lang="ts">
import FullCalendar from "@fullcalendar/vue3";
import EtLocale from "@fullcalendar/core/locales/et";
import EnGbLocale from "@fullcalendar/core/locales/en-gb";
import listPlugin from "@fullcalendar/list";
import Popover from "../popoverBase.vue";
import type {
  DateRangeInput,
  EventClickArg,
} from "@fullcalendar/core/index.js";
import AddEvent from "./addEvent.vue";
import FilterModal from "./filterModal.vue";

const store = useDashboardStore();
const emit = defineEmits<{
  (e: "show-settings" | "change-view"): void;
  (
    e: "event-updated",
    payload: {
      id: string;
      status: EventStatus;
      color: HighColor | "";
      userAdded: boolean;
    },
  ): void;
  (e: "event-added", payload: HomeworkEvent): void;
  (e: "event-removed", payload: { id: string }): void;
}>();
const props = defineProps<{ events: HomeworkEvent[] }>();
const addEventModal = ref<InstanceType<typeof AddEvent> | null>(null);
const homeworkList = ref<InstanceType<typeof FullCalendar> | null>(null);
const filterModal = ref<InstanceType<typeof FilterModal> | null>(null);
const popover = ref<InstanceType<typeof Popover> | null>(null);
const isDelete = ref(false);
const selectedEventId = ref<string | null>(null);
const { locale } = useI18n();

const calendarLocale = computed(() =>
  locale.value === "et" ? EtLocale : EnGbLocale,
);

const onLongPress = (event: Event) => {
  const targetElement = event.currentTarget as HTMLElement;
  const highlightIcon = targetElement.querySelector(".highlightIcon");
  if (highlightIcon) {
    const eventEl = targetElement.closest(
      "[data-event-id]",
    ) as HTMLElement | null;
    selectedEventId.value = eventEl?.dataset.eventId ?? null;
    popover.value?.showPopover(highlightIcon as HTMLElement);
  }
};

const onColorSelect = (e: Event) => {
  const targetElement = e.target as HTMLElement;
  const color = targetElement.classList[1];
  if (!color) return;
  store.setHighlightColor(color as HighColor);
  if (!selectedEventId.value) return;
  const event = props.events.find((ev) => ev.id === selectedEventId.value);
  if (!event) return;
  emit("event-updated", {
    id: event.id,
    status: "highlighted",
    color: color as HighColor,
    userAdded: event.extendedProps.userAdded,
  });
};

const eventClick = (eventClick: EventClickArg) => {
  const { event, jsEvent } = eventClick;
  const targetElement = jsEvent.target as HTMLElement;

  const isHighlightClick = targetElement.classList.contains("highlightIcon");
  const isDeleteClick = targetElement.classList.contains("fc-icon-trash");
  if (isDeleteClick) {
    emit("event-removed", { id: event.id });
    return;
  }
  console.log({ isHighlightClick, isDeleteClick });
  const isHighlighted = event.extendedProps.status === "highlighted";
  const isDone = event.extendedProps.status === "done";

  const status = isHighlightClick
    ? isHighlighted
      ? ""
      : "highlighted"
    : isDone
      ? ""
      : "done";

  const color =
    isHighlightClick && status === "highlighted" ? store.highlightColor : "";

  emit("event-updated", {
    id: event.id,
    status,
    color,
    userAdded: event.extendedProps.userAdded,
  });
};

const setVisibleRange = (): DateRangeInput => {
  if (props.events.length === 0) return {};
  const dates = props.events.map((event) => event.start);
  const min = new Date(Math.min(...dates)).toISOString().split("T")[0];
  const max = new Date(Math.max(...dates) + 1000 * 60 * 60 * 24 * 2)
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
    addEvent: {
      text: $t("addEvent.title"),
      icon: "addEvent",
      click: () => addEventModal.value?.$el.show(),
    },
    filter: {
      text: $t("filter.title"),
      icon: "filter",
      click: () => filterModal.value?.$el.showModal(),
    },
    trash: {
      text: $t("homework.delete"),
      icon: "trash",
      click: (e: Event) => toggleDelete(e),
    },
  },
  views: {
    homework: { type: "list", visibleRange: setVisibleRange },
  },
  headerToolbar: {
    left: "",
    right: "filter addEvent trash timetable settings",
  },
  events: async () => await props.events,
  eventClick: eventClick,
  defaultTimedEventDuration: 0,
  locale: calendarLocale.value,
  lazyFetching: true,
  progressiveEventRendering: true,
  contentHeight: "auto",
};
const toggleDelete = (e: Event | { target: HTMLElement }) => {
  isDelete.value = !isDelete.value;
  const iconElement = (e.target as HTMLElement).querySelector("span");
  if (iconElement) {
    if (isDelete.value)
      return iconElement.classList.replace("fc-icon-trash", "fc-icon-check");
    iconElement.classList.replace("fc-icon-check", "fc-icon-trash");
  }
};

const emitAddEvent = (event: HomeworkEvent) => {
  emit("event-added", event);
  closeAddEvent();
};

const closeAddEvent = () => {
  addEventModal.value?.$el.close();
};

const closeFilterModal = () => {
  filterModal.value?.$el.close();
};

const onScroll = () => {
  const toolbar = document.querySelector(".listView .fc-header-toolbar");
  if (window.scrollY > 2) {
    toolbar?.classList.add("shadow");
  } else {
    toolbar?.classList.remove("shadow");
  }
};

const setTrashButtonVisibility = () => {
  const isUserAdded = props.events.some(
    (event) => event.extendedProps.userAdded === true,
  );
  const trashButton = document.querySelector(
    ".fc-trash-button",
  ) as HTMLElement | null;
  if (!trashButton) return;
  const shouldDisplay = isUserAdded ? "" : "none";
  if (trashButton.style.display !== shouldDisplay) {
    trashButton.style.display = shouldDisplay;
    if (!isUserAdded && isDelete.value) toggleDelete({ target: trashButton });
  }
};

watch(
  () => [props.events, calendarLocale.value],
  () => {
    const api = homeworkList.value?.getApi?.();
    if (api && typeof api.refetchEvents === "function") {
      api.refetchEvents();
      api.setOption("visibleRange", setVisibleRange());
    }
    if (api && typeof api.setOption === "function") {
      api.setOption("locale", calendarLocale.value);
    }
    setTrashButtonVisibility();
  },
  { deep: true },
);

onMounted(() => {
  setTrashButtonVisibility();
  window.addEventListener("scroll", onScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
});
</script>

<style>
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
  -webkit-mask-image: url(/icons/highlighter.svg);
  mask-image: url(/icons/highlighter.svg);
  background-color: currentColor;
  transform: scale(1.4);
}
.eventButton .fc-icon.fc-icon-trash {
  pointer-events: all !important;
  background-color: red;
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
