import axios from 'axios';
export default {
    namespaced: true,
    state: {
        url: '',
        events: [],
    },
    getters: {
        getUrl: (state) => state.url,
        getEvents: (state) => state.events,
    },
    mutations: {
        setEvents(state, events) {
            state.events = events;
        },
        setUrl(state, url) {
            state.url = url;
        },
        addEvent(state, event) {
            if (!state.events.some(e => e.id === event.id)) state.events.push(event);
        },
        deleteEvent(state, id) {
            state.events = state.events.filter(event => event.id !== id);
        },
        setExtendedProps(state, { id, status, color = '' }) {
            const event = state.events.find((event) => event.id === id);
            if (!event || !event.extendedProps) return;
            event.extendedProps.status = status;
            event.extendedProps.color = color;
        },
    },
    actions: {
        setUrl({ commit }, {url, update}) {
            if(update) axios.put('/api/user/moodle', {url:url}).catch(() => {});
            commit('setUrl', url);
        },
        addEvent({ commit }, {event, update}){
            if (update) axios.post("/api/events/homework/", event).catch(() => {});
            commit('addEvent', event);
        },
        deleteEvent({ commit }, {id, update}){
            if (update) axios.delete(`/api/events/homework/${id}`).catch(() => {});
            commit('deleteEvent', id);
        },
        setDone({ commit }, {props, update}){
            const { id, status } = props;
            if (update) {
                if (status === 'done') {
                    axios.post(`/api/events/homework/done/${id}`).catch(()=>{});
                } else if (status === '') {
                    axios.delete(`/api/events/homework/done/${id}`).catch(()=>{});
                }
            }
            commit('setExtendedProps', props);
        },
        setHigh({ commit }, {props, update}) {
            const { id, status, color } = props;
            if (update) {
                if (status === 'high') {
                    axios.post(`/api/events/homework/highlight/${id}/${color}`).catch(()=>{});
                } else if (status === '') {
                    axios.delete(`/api/events/homework/highlight/${id}`).catch(()=>{});
                }
            }
            commit('setExtendedProps', props);
        },
        async fetchEvents({ commit, state }) {
            try {
                const { data } = await axios.get(`/api/events/homework/${encodeURIComponent(state.url)}`);
                commit('setEvents', data);
              } catch {}
        },
    }
}