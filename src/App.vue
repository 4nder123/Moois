<template>
  <div :class="{loading:this.isLoading}">
    <christmasLights v-if="!this.isLoading && new Date().getMonth() === 11"/>
    <Settings v-if="this.isSettingsVisible" @close="this.closeSettings" @logout="this.logout"/>
    <router-view v-if="!this.isLoading"/> 
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import router from './router';
import { SocketConnect, SocketDisconnect } from '@/socket'
import axios from 'axios';

export default {
  name: 'home',
  components: {
    christmasLights: defineAsyncComponent(() => import('./components/christmasLights.vue')),
    Settings: defineAsyncComponent(() => import('@/components/settings.vue'))
  },
  computed: {
    isLoading() {
      return this.$store.getters.getLoading;
    },
    isSettingsVisible() {
      return this.$store.getters.getSettingsVisibility;
    },
    isDarkmode() {
      return this.$store.getters.isDarkmode;
    }
  },
  methods: {
    async logout(){
      await axios.post('/api/user/logout', {}, {withCredentials:true});
      axios.defaults.headers.common['Authorization'] = '';
      window.name = "";
      this.closeSettings();
      await router.push('/login');
    },
    closeSettings() {
      this.$store.dispatch('changeSettingsVisibility');
    },
    beforeUnloadListener() { SocketDisconnect(); },
    pageShowListener(event) { if (event.persisted) { SocketConnect(); } },
    settingsPreFetch(e) {
      if(e.target.closest('.fc-settings-button')) {
        window.removeEventListener('mouseover', this.settingsPreFetch);
        import('@/components/settings.vue');
      }
    },
    viewPreFetch(e) {
      if(e.target.closest('.fc-tunniplaan-button')) {
        window.removeEventListener('mouseover', this.viewPreFetch);
        import('@/views/tunniplaan.vue');
      } else if(e.target.closest('.fc-kodutood-button')) {
        window.removeEventListener('mouseover', this.viewPreFetch);
        import('@/views/kodutood.vue');
      }
    },
    addEventPreFetch(e) {
        if(e.target.closest('.fc-addEvent-button')) {
            window.removeEventListener('mouseover', this.addEventPreFetch);
            import('@/components/addEvent.vue');
        }
    },
    filterPreFetch(e) {
        if(e.target.closest('.fc-filter-button')) {
            window.removeEventListener('mouseover', this.filterPreFetch);
            import('@/components/filter.vue');
        }
    },
  },
  async mounted() {
    if(this.isDarkmode) document.body.classList.add("dark-mode");
    try {
      await this.$store.dispatch('fetchUserInfo');
      this.$store.dispatch('fetchAllEvents');
      SocketConnect();
    } catch {};
  },
  created() {
    window.addEventListener("beforeunload", this.beforeUnloadListener);
    window.addEventListener("pageshow", this.pageShowListener);
    window.addEventListener("mouseover", this.settingsPreFetch);
    window.addEventListener("mouseover", this.viewPreFetch);
    window.addEventListener('mouseover', this.addEventPreFetch);
    window.addEventListener('mouseover', this.filterPreFetch);
  }, 
  beforeUnmount() {
    window.removeEventListener('beforeunload', this.beforeUnloadListener);
    window.removeEventListener('pageshow', this.pageShowListener);
    window.removeEventListener('mouseover', this.settingsPreFetch);
    window.removeEventListener("mouseover", this.viewPreFetch);
    window.removeEventListener('mouseover', this.addEventPreFetch);
    window.removeEventListener('mouseover', this.filterPreFetch);
  }
}
</script>

<style>
  :root {
    --popover-bg-color: #FFFFFF;
    --main-bg-color: #FFFFFF;
    --popover-text-color: #000;
  }
  body::after{
    position:absolute; width:0; height:0; overflow:hidden; z-index:-1;
    content:url(./assets/gear.svg) url(./assets/check.svg) url(./assets/highlighter.svg) url(./assets/plus.svg) url(./assets/trash.svg) url(./assets/filter.svg);
  }
  body:has(.modal) {
    overflow: hidden;
  }
  .fc-icon {
    pointer-events: none;
  }
  .fc-icon:not(.fc-icon-chevron-right, .fc-icon-chevron-left) {
    background-color: var(--fc-button-text-color);
    -webkit-mask-repeat: no-repeat;
    -webkit-mask-position: center 45%;
    mask-repeat: no-repeat;
    mask-position: center 45%;
  }
  .fc-icon.fc-icon-settings {
    -webkit-mask-image: url(./assets/gear.svg);
    mask-image: url(./assets/gear.svg);
    max-width: 16px;
    width: 0.67em;
  }
  .fc-icon.fc-icon-check {
    -webkit-mask-image: url(./assets/check.svg);
    mask-image: url(./assets/check.svg);
    max-width: 16px;
    width: 0.67em;
  }
  .fc-icon.fc-icon-trash {
    -webkit-mask-image: url(./assets/trash.svg);
    mask-image: url(./assets/trash.svg);
    max-width: 14px;
    width: 0.58em;
  }
  .fc-icon.fc-icon-addEvent {
    -webkit-mask-image: url(./assets/plus.svg);
    mask-image: url(./assets/plus.svg);
    max-width: 14px;
    width: 0.58em;
  }
  .fc-icon.fc-icon-filter {
    -webkit-mask-image: url(./assets/filter.svg);
    mask-image: url(./assets/filter.svg);
    max-width: 16px;
    width: 0.67em;
  }
  .popover {
    z-index: 9999;
    background: var(--popover-bg-color);
    color: var(--popover-text-color);
    border-radius: 3px;
    box-shadow: 0 0 2px rgba(0,0,0,0.5);
    padding: 10px;
    text-align: center;
  }
  .loading {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    z-index: 9999;
  }
  input {
    font-family: "Roboto", sans-serif;
    outline: 0;
    background: #f0f0f0;
    width: 100%;
    border: none;
    padding: 15px;
    box-sizing: border-box;
    font-size: 14px;
    border-radius: 4px;
    -webkit-border-radius: 4px;
  }
  .error {
    background-color: #FEE;
    border: 1px solid #EDD;
    color: #A66;
    padding: 10px;
    margin-bottom: 10px;
  }
  .success {
    background-color: #EFE;
    border: 1px solid #DED;
    color: #9A9;
    padding: 10px;
    margin-bottom: 10px;
  }
  .loading::after{
    content: "";
    width: 100px;
    aspect-ratio: 4;
    --_g: no-repeat radial-gradient(circle closest-side,#2c3e50 90%,#0000);
    background: 
      var(--_g) 0%   50%,
      var(--_g) 50%  50%,
      var(--_g) 100% 50%;
    background-size: calc(100%/3) 100%;
    animation: l7 900ms infinite linear;
  }
  @keyframes l7 {
    33%{background-size:calc(100%/3) 0%  ,calc(100%/3) 100%,calc(100%/3) 100%}
    50%{background-size:calc(100%/3) 100%,calc(100%/3) 0%  ,calc(100%/3) 100%}
    66%{background-size:calc(100%/3) 100%,calc(100%/3) 100%,calc(100%/3) 0%  }
  }

  @media (pointer:none), (pointer:coarse) {
    input {
      font-size: 16px;
    }
    .pv-select {
      font-size: 16px !important;
    }
  }
</style>
<!-- Dark mode -->
<style>
  body.dark-mode {
    background-color: #121212;
    color: #bbbbbb;
    --popover-bg-color:#3f3f3f;
    --popover-text-color:#bbbbbb;
    --main-bg-color: #121212;
    --fc-border-color: #3f3f3f;
    --fc-page-bg-color: #3f3f3f;
    --fc-today-bg-color: rgba(75, 75, 75, 0.3);
  }

  .dark-mode .fc-list-event {
    --fc-list-event-hover-bg-color: rgba(100, 100, 100, 0.15);
  }

  .dark-mode .fc-timegrid-event-harness,
  .dark-mode .fc-daygrid-event-harness {
    filter: brightness(70%);
  }
  .dark-mode .shadow {
    color: #3f3f3f;
  }
  .dark-mode .popover {
    color: #e6e6e6;
    background: #3f3f3f;
  }

  .dark-mode .modal section,
  .dark-mode .form,
  .dark-mode .fc-list-empty,
  .dark-mode .fc-list-day-cushion {
    background: #242424 !important;
  }
  .dark-mode .form .message a {
        color: #888 !important;
        text-decoration: none;
  }
  .dark-mode input, .dark-mode .pv-select {
    color: #bbbbbb !important;
    background: #3d3d3d !important;
  }

  .dark-mode .flatpickr-calendar {
    background-color: #3d3d3d !important;
    -webkit-box-shadow: 1px 0 0 #3f3f3f, -1px 0 0 #3f3f3f, 0 1px 0 #3f3f3f, 0 -1px 0 #3f3f3f, 0 3px 13px rgba(0, 0, 0, 0.08) !important;
    box-shadow: 1px 0 0 #3f3f3f, -1px 0 0 #3f3f3f, 0 1px 0 #3f3f3f, 0 -1px 0 #3f3f3f, 0 3px 13px rgba(0, 0, 0, 0.08) !important;
  }

  .dark-mode .flatpickr-day, .dark-mode span.flatpickr-weekday, .dark-mode .flatpickr-current-month, 
  .dark-mode .flatpickr-months .flatpickr-prev-month, .dark-mode .flatpickr-months .flatpickr-next-month,
  .dark-mode .flatpickr-time input {
    color: #bbbbbb !important; 
    fill: #bbbbbb !important;
  }
  .dark-mode .numInputWrapper span.arrowUp:after,
  .dark-mode .numInputWrapper span.arrowDown:after {
    border-bottom-color: #bbbbbb !important;
    border-top-color: #bbbbbb !important;
  }

  .dark-mode .flatpickr-current-month .flatpickr-monthDropdown-months .flatpickr-monthDropdown-month {
    background: #4f4f4f !important;
  }
  .dark-mode .flatpickr-day.inRange, .dark-mode .flatpickr-day.prevMonthDay.inRange, 
  .dark-mode .flatpickr-day.nextMonthDay.inRange, .dark-mode .flatpickr-day.today.inRange, 
  .dark-mode .flatpickr-day.prevMonthDay.today.inRange, .dark-mode .flatpickr-day.nextMonthDay.today.inRange, 
  .dark-mode .flatpickr-day:hover, .dark-mode .flatpickr-day.prevMonthDay:hover, 
  .dark-mode .flatpickr-day.nextMonthDay:hover, .dark-mode .flatpickr-day:focus, 
  .dark-mode .flatpickr-day.prevMonthDay:focus, .dark-mode .flatpickr-day.nextMonthDay:focus, 
  .dark-mode .flatpickr-day.flatpickr-disabled:hover {
    background-color: #4f4f4f !important;
    border-color: #4f4f4f !important;
  }

  .dark-mode .flatpickr-day.nextMonthDay,  .dark-mode .flatpickr-day.prevMonthDay{
    color: #777 !important;
  }
  .dark-mode .flatpickr-time input:hover, .dark-mode .flatpickr-time input:focus {
    background-color: #4f4f4f !important;
  }
  .dark-mode .flatpickr-day.today {
    border-color: #4f4f4f !important;
  }
  .dark-mode .flatpickr-day.flatpickr-disabled {
        color: #4f4f4f !important;
  }
  .dark-mode .flatpickr-day.flatpickr-disabled:hover {
    color: #777 !important;
  }
  .dark-mode .error {
    background-color: #4D2E2E;
    border: 1px solid #4D2828;
    color: #FFB3B3;
    padding: 10px;
  }
  .dark-mode .success {
    background-color: #A9E8A0;
    border: 1px solid #88C788;
    color: #3C6A3C;
    padding: 10px;
  }
</style>
