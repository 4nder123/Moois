<template>
   <FullCalendar class="calendar" ref="fullCalendar" :options="calendarOptions" />
</template>

<script>
import FullCalendar from '@fullcalendar/vue3'
import etLocale from '@fullcalendar/core/locales/et';
import timeGridPlugin from '@fullcalendar/timegrid';
import rrulePlugin from '@fullcalendar/rrule'
import router from '@/router';
import { Popover } from 'bootstrap';

export default {
  name: 'tunniplaan',
  components: {
    FullCalendar
  },
  data() {
    return {
      popover: null,
      calendar: null,
      calendarOptions: {
        plugins: [ rrulePlugin, timeGridPlugin ],
        customButtons: {
            kodutood: { text: 'Kodutööd', click: this.changeView },
            settings: { text: 'Seaded', icon: 'settings', click: this.showSettings}
        },
        hiddenDays: [0, 6],
        locale: etLocale,
        timeZone: 'Europe/Tallinn',
        initialView: 'timeGridWeek',
        nowIndicator: true,
        slotMinTime: '08:00',
        slotMaxTime: '21:00',
        contentHeight: 'auto',
        slotEventOverlap: false,
        allDaySlot: false,
        lazyFetching: true,
        progressiveEventRendering: true,
        eventTextColor: 'black',
        eventClick: this.eventClick,
        events: this.getEvents,
        eventSourceSuccess: this.setupEventsView,
        eventDidMount: this.setupEvent,
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridWeek,timeGridDay kodutood settings'
        }
      }
    }
  },
  methods: {
    setupEventsView(info) {
      let hiddenDaysSet = new Set([0, 6]);
      info.forEach(event => {
          const dayOfWeek = new Date(event.start).getDay();
          if (dayOfWeek === 6) {
              hiddenDaysSet.delete(6);
          } else if (dayOfWeek === 0) {
              hiddenDaysSet.clear();
          }
      });
      this.calendar.setOption("hiddenDays", Array.from(hiddenDaysSet));
      this.calendar.setOption("allDaySlot", info.some(event => event.allDay));
    },
    setupEvent(info) {
      if(info.event.extendedProps.description) info.el.setAttribute("data-bs-content", info.event.extendedProps.description);
    },
    sizeUpdate() {
      this.calendar.updateSize();
      if(this.popover) this.popover.update();
    },
    changeView() {
      router.push('/kodutood');
    },
    getWeekRange(date) {
      const start = new Date(date);
      start.setDate(start.getDate() - start.getDay() + 1);
      const end = new Date(start);
      end.setDate(end.getDate() + 6); 
      const format = (d) => d.toLocaleDateString('en-GB');
      return `${format(start)} - ${format(end)}`;
    },
    getEvents(info) {
      return Promise.resolve(this.$store.getters['schedule/getEvents'](this.getWeekRange(info.start)));
    },
    showSettings() {
      this.$store.dispatch('changeSettingsVisibility');
    }, 
    refetchEvents() {
      if (document.visibilityState === 'visible') this.$store.dispatch('fetchAllEvents').then(() => this.calendar.refetchEvents());
    },
    eventClick(eventInfo) {
      const eventEl = eventInfo.el;
      const previouslySelected = eventEl.classList.contains('selected');
      this.clearEventSelection();
      if (!previouslySelected) {
        eventEl.classList.add('selected');
      }
    },
    clearEventSelection() {
      document.querySelectorAll('.fc-event.selected').forEach(el => {
        el.classList.remove('selected');
        el.blur();
      });
    },
    handleOutsideClick(event) {
      if (!event.target.closest('.fc-event')) {
        this.clearEventSelection();
      }
    },
  },
  mounted() {
    this.calendar = this.$refs.fullCalendar.getApi();
    this.popover = new Popover(document.body, {
      selector: '.fc-event',
      offset: [0,0],
      placement: 'top',
      trigger: 'focus',
      html: true,
    }); 
  },
  created() {
    window.addEventListener('visibilitychange', this.refetchEvents);
    window.addEventListener("resize", this.sizeUpdate);
    window.addEventListener('click', this.handleOutsideClick);
  },
  beforeUnmount() {
    this.popover.dispose();
    window.removeEventListener('visibilitychange', this.refetchEvents);
    window.removeEventListener("resize", this.sizeUpdate);
    window.removeEventListener('click', this.handleOutsideClick);
  }
}
</script>

<style>
  @media (max-width: 500px) {
    .calendar .fc .fc-toolbar.fc-header-toolbar {
        font-size: 3.2vw;
        
    }
    .calendar .fc-header-toolbar .fc-toolbar-chunk {
        font-size: 3.2vw;
    }
    .calendar .fc-settings-button .fa-gear{
        font-size: 3.2vw;
    }
  }
  @media (max-width: 715px) {
    .calendar .fc-toolbar-title{
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
