import { io } from "socket.io-client";
import axios from "axios";
import store from "@/store";
import router from "@/router";

const URL = "https://moois.mooo.com";

const socket = io(URL, {
    transports: ["polling", "websocket"],
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    autoConnect: false,
    secure: true,
    extraHeaders: {
        authorization: null
    },
});

export const SocketConnect = () => {
    if(router.currentRoute.value.fullPath === "/kodutood" || router.currentRoute.value.fullPath ===  "/tunniplaan") {
        socket.io.opts.extraHeaders.authorization = axios.defaults.headers.common['Authorization'];
        socket.connect();
    }
} 

export const SocketDisconnect = () => {
    if(!socket.disconnected) {
        socket.disconnect();
    }
}

socket.on("connect_error", (err) => {
    axios.post('/api/user/refresh', {},{ withCredentials: true }).then(({ data }) => {
        socket.disconnect();
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + data.token;
        socket.io.opts.extraHeaders.authorization = 'Bearer ' + data.token;
        socket.connect();
    }).catch(() => {SocketDisconnect();});
});

socket.on('addEvent', (event) => {store.dispatch('addEvent', {event:event, update:false});});
socket.on('deleteEvent', (id) => {store.dispatch('deleteEvent', {id:id, update:false});});

socket.on('addDone', (id) => {store.dispatch('setExtendedProps', { props:{id:id, status:"done", color: ""}, update: false});});
socket.on('removeDone', (id) => {store.dispatch('setExtendedProps', { props:{id:id, status:"", color: ""}, update: false});});

socket.on('addHighlight', ({ id, color }) => {store.dispatch('setExtendedProps', { props:{id:id, status:"high", color: color}, update: false});});
socket.on('removeHighlight', (id) => {store.dispatch('setExtendedProps', { props:{id:id, status:"", color: ""}, update: false});});

socket.on('updateOis', (url) => {store.dispatch("setOis", {url:url, update:false}); store.dispatch('resetLoading'); store.dispatch('fetchAllEvents');});
socket.on('updateMoodle', (url) => {store.dispatch("setMoodle", {url:url, update:false}); store.dispatch('resetLoading'); store.dispatch('fetchAllEvents');});