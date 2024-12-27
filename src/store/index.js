import { createStore } from 'vuex';
import axios from 'axios';
import homework from './homework';
import schedule from './schedule';

export default createStore({
  state: {
    loading: true,
    settings: false,
    isDarkmode: localStorage.getItem('dark_mode') !== undefined? localStorage.getItem('dark_mode') === 'true' : false,
  },
  getters: {
    isDarkmode: (state) => state.isDarkmode,
    getSettingsVisibility: (state) => state.settings,
    getLoading: (state) => state.loading,
  },
  mutations: {
    changeSettingsVisibility(state) {
      state.settings = !state.settings;
    },
    setLoading(state, isLoading) {
      state.loading = isLoading;
    },
    toggleDarkmode(state) {
      localStorage.setItem('dark_mode', !state.isDarkmode);
      state.isDarkmode = !state.isDarkmode;
    },
  },
  actions: {
    changeSettingsVisibility({ commit }) {
      commit('changeSettingsVisibility');
    },
    toggleDarkmode({commit}){
      commit('toggleDarkmode')
    },
    resetLoading({ commit }){
      commit('setLoading', true);
    },
    async fetchAllEvents({ dispatch, commit }) {
      try {
        await Promise.all([
          dispatch('schedule/fetchEvents'),
          dispatch('homework/fetchEvents'),
        ]);
      } finally {
        commit('setLoading', false);
      }
    },  
    async fetchUserInfo({ commit }) {
      try {
        const { data } = await axios.get('/api/user/');
        commit('schedule/setUrl', data.ois);
        commit('homework/setUrl', data.moodle);
      } catch (err){
        commit('setLoading', false);
        throw err;
      }
    },
  },
  modules: {
    schedule,
    homework
  },
});