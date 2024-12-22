import { createStore } from 'vuex';
import axios from 'axios';
import { RRule } from 'rrule';

export default createStore({
  strict: true,
  state: {
    oisUrl: '',
    moodleUrl: '',
    koduEvents: [],
    loading: true,
    tunniEvents: [],
    settings: false,
    isDarkmode: localStorage.getItem('dark_mode') !== undefined? localStorage.getItem('dark_mode') === 'true' : false,
  },
  getters: {
    isDarkmode: (state) => state.isDarkmode,
    getSettingsVisibility: (state) => state.settings,
    getLoading: (state) => state.loading,
    getMoodleUrl: (state) => state.moodleUrl,
    getOisUrl: (state) => state.oisUrl,
    getKoduEvents: (state) => state.koduEvents,
    getTunniEvents: (state) => (start, end) => {
      const startDate = normalizeDate(new Date(start));
      const endDate = normalizeDate(new Date(end));
      const filteredEvents = [];
      state.tunniEvents.forEach((event) => {
        const eventStart = new Date(event.start);
        if (event.rrule) {
          const ruleOptions = {
            freq: event.rrule.freq === 2 ? RRule.WEEKLY : RRule.DAILY,
            dtstart: new Date(event.rrule.dtstart),
            interval: event.rrule.interval || 1,
            until: event.rrule.until ? new Date(event.rrule.until) : null,
            byweekday: event.rrule.byweekday || null,
          };

          const rule = new RRule(ruleOptions);
          if (rule.between(startDate, endDate, true).length > 0) {
            filteredEvents.push(event);
          }
        } else if (eventStart >= startDate && eventStart <= endDate) {
          filteredEvents.push(event);
        }
      });
      return filteredEvents;
    },
  },
  mutations: {
    changeSettingsVisibility(state) {
      state.settings = !state.settings;
    },
    setKoduEvents(state, koduEvents) {
      state.koduEvents = koduEvents;
    },
    setTunniEvents(state, tunniEvents) {
      state.tunniEvents = tunniEvents;
    },
    setLoading(state, isLoading) {
      state.loading = isLoading;
    },
    addEvent(state, event) {
      if (!state.koduEvents.some(e => e.id === event.id)) state.koduEvents.push(event);
    },
    deleteEvent(state, id) {
      state.koduEvents = state.koduEvents.filter(event => event.id !== id);
    },
    setExtendedProps(state, { props, update }) {
      const { id, status, color } = props
      const event = state.koduEvents.find((event) => event.id === id);
      if (!event || !event.extendedProps) return;
      if(update){
        if(status === 'done') axios.post(`/api/events/homework/done/${id}`).catch(() => {});
        else if(status === '' && event.extendedProps.status === 'done') axios.delete(`/api/events/homework/done/${id}`).catch(() => {});
        else if(status === 'high') axios.post(`/api/events/homework/highlight/${id}/${color}`).catch(() => {});
        else if(status === '' && event.extendedProps.status === 'high')  axios.delete(`/api/events/homework/highlight/${id}`).catch(() => {});
      }
      event.extendedProps.status = status;
      event.extendedProps.color = color;
    },
    toggleDarkmode(state) {
      localStorage.setItem('dark_mode', !state.isDarkmode);
      state.isDarkmode = !state.isDarkmode;
    },
    setOis(state, url) {
      state.oisUrl = url;
    },
    setMoodle(state, url) {
      state.moodleUrl = url;
    },
    setUserInfo(state, urls){
      state.oisUrl = urls.ois;
      state.moodleUrl = urls.moodle;
    }
  },
  actions: {
    async fetchUserInfo({ commit }) {
      try {
        const { data } = await axios.get('/api/user/');
        commit("setUserInfo", data)
      } catch (err){
        commit('setLoading', false);
        throw err;
      }
    },
    setOis({ commit }, {url, update}) {
      if(update) axios.put('/api/user/ois', {url:url}).catch(() => {});
      commit('setOis', url);
    },
    setMoodle({ commit }, {url, update}) {
      if(update) axios.put('/api/user/moodle', {url:url}).catch(() => {});
      commit('setMoodle', url);
    },
    addEvent({ commit }, {event, update}){
      if (update) axios.post("/api/events/homework/", event).catch(() => {});
      commit('addEvent', event);
    },
    deleteEvent({ commit }, {id, update}){
      if (update) axios.delete(`/api/events/homework/${id}`).catch(() => {});
      commit('deleteEvent', id);
    },
    setExtendedProps({ commit }, {props, update}) {
      commit('setExtendedProps', {props, update});
    },
    changeSettingsVisibility({ commit }) {
      commit('changeSettingsVisibility');
    },
    toggleDarkmode({commit}){
      commit('toggleDarkmode')
    },
    resetLoading({ commit }){
      commit('setLoading', true);
    },
    async fetchKoduEvents({ commit, state }) {
      try {
        const { data } = await axios.get(`/api/events/homework/${encodeURIComponent(state.moodleUrl)}`);
        commit('setKoduEvents', data);
      } catch {}
    },
    async fetchTunniEvents({ commit, state }) {
        try {
          if(!state.oisUrl) { commit('setTunniEvents', []); return; }
          const { data } = await axios.get(`/api/events/schedule/${encodeURIComponent(state.oisUrl)}`);
          commit('setTunniEvents', data);
        } catch {}
    },
    async fetchAllEvents({ dispatch, commit }) {
      try {
        await Promise.all([
          dispatch('fetchKoduEvents'),
          dispatch('fetchTunniEvents'),
        ]);
      } finally {
        commit('setLoading', false);
      }
    },  
  }
});

function normalizeDate(date) {
  return new Date(date.setHours(0, 0, 0, 0));
}
