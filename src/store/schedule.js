import axios from 'axios';
export default {
    namespaced: true,
    state: {
        url: '',
        events: {},
    },
    getters: {
        getUrl: (state) => state.url,
        getEvents: (state) => (week) => { return state.events[week] || [];}, 
    },
    mutations: {
        setEvents(state, events) {
            state.events = events;
        },
        setUrl(state, url) {
            state.url = url;
        },
    },
    actions: {
        setUrl({ commit }, {url, update}) {
            if(update) axios.put('/api/user/ois', {url:url}).catch(() => {});
            commit('setUrl', url);
        },
        async fetchEvents({ commit, state }) {
            try {
                if(!state.url) { commit('setEvents', {}); return; }
                const { data } = await axios.get(`/api/events/schedule/${encodeURIComponent(state.url)}`);
                commit('setEvents', data);
            } catch {}
        },
    }
}