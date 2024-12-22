<template>
    <addEvent v-if="this.isAddEventVisible" @close="this.toggleAddEvent"/>
    <FullCalendar class="listView" ref="fullCalendar" :options="calendarOptions">
        <template v-slot:eventContent='arg'>
            <div class="event" :class="arg.event.extendedProps.color">
                <div class='eventTitle' :class="arg.event.extendedProps.status">{{ arg.event.title.replace(/(\S{25})/g, '$1\u200B') }}</div>
                <div v-if="arg.event.extendedProps.userAdded === 'true' && isDelete" class="eventButton deleteIcon"></div>
                <div :id="arg.event.id" v-else-if="arg.event.extendedProps.status !== 'done'" class="eventButton highlightIcon" v-long-press @onLongPress="onLongPress"></div>
            </div>
        </template>
    </FullCalendar>
</template>

<script>
import FullCalendar from '@fullcalendar/vue3'
import addEvent from '../components/addEvent.vue';
import etLocale from '@fullcalendar/core/locales/et';
import listPlugin from '@fullcalendar/list';
import { vLongPress } from '@/directives/vLongPress';
import { Popover } from 'bootstrap';
import router from '@/router';

export default {
    name: 'kodutood',
    components: {
        FullCalendar,
        addEvent,
    },
    directives: {
        longPress: vLongPress,
    },
    data() {
        return {
            isAddEventVisible: false,
            isLongPress: false,
            isDelete: false,
            highlightColor: (localStorage.getItem("high") && /(red|orange|yellow)/.test(localStorage.getItem("high"))) ? localStorage.getItem("high") : "red",
            calendarOptions: {
                plugins: [ listPlugin ],
                customButtons: {
                    trash: { text: 'Kustuta', icon: 'trash', click: this.toggleDelete },
                    addEvent: { text: 'Lisa', icon: 'addEvent', click: this.toggleAddEvent},
                    tunniplaan: { text: 'Tunniplaan', click: this.changeView },
                    settings: { text: 'Seaded', icon: 'settings ', click: this.showSettings}
                },
                views: {
                    kodutood: { type: 'list' }, 
                },
                locale: etLocale,
                defaultTimedEventDuration: 0,
                events: this.getEvents,
                lazyFetching: true,
                progressiveEventRendering: true,
                contentHeight: "auto",
                initialView: 'kodutood',
                eventsSet: this.setVisibleRange,
                eventClick: this.onEventClick,
                headerToolbar: {
                    left: '',
                    center: '',
                    right: 'addEvent trash tunniplaan settings'
                }
            }
        }
    },
    methods: {
        setVisibleRange(events) {
            if(events.length === 0) return;
            const dates = events.map(event => new Date(new Date(event.start).toISOString().split('T')[0]));
            const minDate = new Date(Math.min(...dates));
            let maxDate = new Date(Math.max(...dates));
            maxDate.setDate(maxDate.getDate() + 2);
            this.calendar.setOption('visibleRange', {start: minDate.toISOString().split('T')[0], end: maxDate.toISOString().split('T')[0]});
        },
        onEventClick(info) {
            const { event, jsEvent } = info;
            const target = jsEvent.target.classList;
            if (target.contains('highlightIcon')) {
                if(!this.isLongPress) {
                    const isHigh = event.extendedProps.status === "high";
                    this.$store.dispatch('setExtendedProps', { props:{id:event.id, status:isHigh? "" : "high" , color: isHigh? "" : this.highlightColor}, update:true});
                } 
                this.isLongPress = false;
                return;
            }
            if (target.contains('deleteIcon')) {
                this.$store.dispatch('deleteEvent', {id:event.id, update:true});
                this.setTrashButtonVisibility(false);
                return
            }
            const isDone = event.extendedProps.status === "done";
            this.$store.dispatch('setExtendedProps', { props:{id:event.id, status:isDone? "" : "done" , color: ""}, update: true});
        },
        onLongPress(el) {
            this.isLongPress = true;
            const popover = new Popover(el.target, {
                content: "<div class='box red'></div><div class='box orange'></div><div class='box yellow'></div>",
                placement: 'top',
                trigger: 'manual',
                html: true,
                container: 'body'
            });
            popover.show();

            const closePopover = (e) => {
                popover.dispose();
                if (e.target.classList.contains('box')) {
                    this.changeSavedColor(e, el.target.id);
                }
                document.removeEventListener(eventType, closePopover);
            };

            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            const eventType = isMobile ? 'touchstart' : 'mousedown';

            document.addEventListener(eventType, closePopover, { once: true });
        },
        getEvents() {
            return Promise.resolve(this.$store.getters.getKoduEvents);
        },
        onScroll() {
            if (window.scrollY > 2) {
                document.querySelector(".listView .fc-header-toolbar").classList.add("shadow");
            } else {
                document.querySelector(".listView .fc-header-toolbar").classList.remove("shadow");
            }
        },
        changeView() {
            router.push('/tunniplaan');
        }, 
        changeSavedColor(e, id) {
            this.highlightColor = e.target.classList[1];
            localStorage.setItem("high", e.target.classList[1]);
            this.$store.dispatch('setExtendedProps', { props:{id:id, status:"high", color: this.highlightColor}, update: true});
        },
        showSettings() {
            this.$store.dispatch('changeSettingsVisibility');
        },
        toggleAddEvent() {
            if (this.isAddEventVisible) { this.setTrashButtonVisibility(); }
            this.isAddEventVisible = !this.isAddEventVisible;
        },
        toggleDelete(e) {
            this.isDelete = !this.isDelete;
            const iconElement = e.target.querySelector('span');
            if (iconElement) {
                if (this.isDelete) return iconElement.classList.replace("fc-icon-trash", "fc-icon-check");
                iconElement.classList.replace("fc-icon-check", "fc-icon-trash");
            } 
        },
        setTrashButtonVisibility() {
            const events = this.$store.getters.getKoduEvents;
            const isUserAdded = events.some(event => event.extendedProps.userAdded === 'true');
            const trashButton = document.querySelector(".fc-trash-button");
            if (!trashButton) return;
            const shouldDisplay = isUserAdded ? "" : "none";
            if (trashButton.style.display !== shouldDisplay) {
                trashButton.style.display = shouldDisplay;
                if (!isUserAdded && this.isDelete) this.toggleDelete({ target: trashButton });
            }
        },
        refetchEvents() {
            if (document.visibilityState === 'visible') this.$store.dispatch('fetchAllEvents');
        }, 
    },
    computed: {
        events() {
            return this.$store.getters.getKoduEvents;
        },
    },
    watch: {
        events: {
            handler() {
                this.calendar.refetchEvents();
            },
            deep: true
        }
    },
    mounted() {
        this.calendar = this.$refs.fullCalendar.getApi();
        this.setTrashButtonVisibility();
    },
    created() {
        window.addEventListener('visibilitychange', this.refetchEvents);
        window.addEventListener("scroll", this.onScroll);
    },
    beforeUnmount() {
        window.removeEventListener('visibilitychange', this.refetchEvents);
        window.removeEventListener("scroll", this.onScroll);
    }
}
</script>
<style>
    td.fc-list-event-title {
        padding: 0px !important;
    }
    .fc-list-event{
        --fc-list-event-hover-bg-color: rgb(0,0,0,0.05); 
    }
    .done{
        text-decoration: line-through;
    }
    .event {
        display: flex;
        align-items: stretch;
        justify-content: space-between;
    }
    .eventTitle {
        padding: 8px 0px 8px 14px;
    }
    .eventButton {
        display: flex;
        align-items: center;
        margin-right: 14px;
        -moz-user-select: -moz-none;
        -khtml-user-select: none;
        -webkit-user-select: none;
        -o-user-select: none;
        user-select: none;
    }
    .highlightIcon {
        -webkit-mask-image: url(../assets/highlighter.svg);
        -webkit-mask-position: center center;
        -webkit-mask-repeat: no-repeat;
        mask-image: url(../assets/highlighter.svg);
        mask-position: center center;
        mask-repeat: no-repeat;
        background-color: currentColor;
        min-width: 22.5px;
        min-height: 20px; 
    }
    .deleteIcon{
        -webkit-mask-image: url(../assets/trash.svg);
        -webkit-mask-position: center center;
        -webkit-mask-repeat: no-repeat;
        mask-image: url(../assets/trash.svg);
        mask-position: center center;
        mask-repeat: no-repeat;
        background-color: red;
        min-width: 16px;
        min-height: 16px; 
    }
    .listView .fc-header-toolbar {
        position: fixed; 
        z-index:50; 
        padding: 10px;
        background: var(--main-bg-color); 
        right: 0; 
        left: 0; 
        top:0;
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
        margin-left: 15px;
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
    
    @media (max-width: 500px) {
        .eventButton {
            margin-right: 0px !important;
            padding: 0px 25.25px 0px 21.25px;
        }
    }   
    @media (max-width: 395px) {
        .fc-list-event-time {
            white-space: normal !important;
        }
    }  
    @media (max-width: 345px) {
        .fc-list-table {
            font-size: round(down, 4.4vw, 1px) !important;
        }
    }   
</style>