<template>
    <div id="add" class="modal-background">
        <div class="modal">
            <header>
                <button id="close-button" class="close" @click="close">&times;</button>
                <h2>Lisa kodutöö</h2>
            </header>
            <section>
                <form id="datetimeadd" @submit.prevent="submit">
                    <p>Kodutöö pealkiri:</p>
                    <input type="text" name="title" class="modal-input" pattern="\S.*" placeholder="Sisesta pealkiri" autocomplete="off" maxlength="240" required>

                    <p>Kuupäev:</p>
                    <div class="datetime-flex">
                        <div class="date">
                            <flat-pickr
                                v-model="date"
                                :config="dateConfig"
                                class="datetime"
                                name="date"/>
                        </div>
                        <div class="time">
                            <flat-pickr
                                v-model="date"
                                :config="timeConfig"
                                class="datetime"
                                name="time"/>
                        </div>
                        <div class="submit">
                            <button id="add-button" type="submit" class="add-button">
                                <span class="fc-icon fc-icon-addEvent" role="img"></span>
                            </button>
                        </div>
                    </div>
                </form>
            </section>
        </div>
    </div>
</template>

<script>
    import {ref} from 'vue';
    import flatPickr from 'vue-flatpickr-component'; 
    import { useStore } from "vuex";
    import "flatpickr/dist/l10n/et";
    import 'flatpickr/dist/flatpickr.css';

    export default {
        name: 'addEventModal',
        components: {
            flatPickr
        },
        setup(_, { emit }) {
            const store = useStore();
            const timeConfig = ref({
                enableTime: true,
                noCalendar: true,
                dateFormat: "H:i",
                defaultDate: "00:00",
                time_24hr: true,
                wrap: true      
            });
            const dateConfig = ref({
                locale: "et",
                altInput: true,
                altFormat: "F j, Y",
                dateFormat: "Y-m-d",
                minDate: Date.now(),
                maxDate: new Date(new Date().setFullYear(new Date(Date.now()).getFullYear() + 2)),
                defaultDate: Date.now(),
                wrap: true
            });
            const submit = e => {
                const form = new FormData(e.target);
                const inputs = Object.fromEntries(form.entries());
                const event = {id:crypto.randomUUID(), title:inputs.title, start:inputs.date + "T" + inputs.time, extendedProps: {userAdded: 'true', status: "", color: ""}};
                store.dispatch('addEvent', {event:event, update:true});
                close();
            };
            const close = () => {
                emit('close');
            };
            return { 
                timeConfig,
                dateConfig,
                submit,
                close
            };
        },
    }
</script>

<style> 
    .datetime {
        font-family: "Roboto", sans-serif;
        outline: 0;
        background: #f2f2f2;
        border: 0;
        padding: 15px;
        box-sizing: border-box;
        font-size: 14px;
        width: 200px;
        color: black;
        -webkit-appearance: none;
        appearance: none;
    }
    .flatpickr-months .flatpickr-prev-month:hover svg,
    .flatpickr-months .flatpickr-next-month:hover svg {
        fill: #4e5f72 !important;
    }
    .flatpickr-calendar:before, .flatpickr-calendar:after {
        border: none !important;
    }
    .flatpickr-time input:hover, .flatpickr-time input:focus {
        border-radius: 5px;
    }
    .flatpickr-calendar.hasTime .flatpickr-time {
        border-top: none !important;
    }
    .flatpickr-day.selected, .flatpickr-day.startRange, 
    .flatpickr-day.endRange, .flatpickr-day.selected.inRange, 
    .flatpickr-day.startRange.inRange, .flatpickr-day.endRange.inRange, 
    .flatpickr-day.selected:focus, .flatpickr-day.startRange:focus, 
    .flatpickr-day.endRange:focus, .flatpickr-day.selected:hover, 
    .flatpickr-day.startRange:hover, .flatpickr-day.endRange:hover, 
    .flatpickr-day.selected.prevMonthDay, .flatpickr-day.startRange.prevMonthDay, 
    .flatpickr-day.endRange.prevMonthDay, .flatpickr-day.selected.nextMonthDay, 
    .flatpickr-day.startRange.nextMonthDay, .flatpickr-day.endRange.nextMonthDay{
        background: #2c3e50 !important;
        border-color: #2c3e50 !important;
        color: #bbbbbb !important; 
    }
    .flatpickr-day.inRange, .flatpickr-day.prevMonthDay.inRange, 
    .flatpickr-day.nextMonthDay.inRange, .flatpickr-day.today.inRange, 
    .flatpickr-day.prevMonthDay.today.inRange, .flatpickr-day.nextMonthDay.today.inRange, 
    .flatpickr-day:hover, .flatpickr-day.prevMonthDay:hover, 
    .flatpickr-day.nextMonthDay:hover, .flatpickr-day:focus, 
    .flatpickr-day.prevMonthDay:focus, .flatpickr-day.nextMonthDay:focus, 
    .flatpickr-day.flatpickr-disabled:hover {
        background: #e6e6e6;
        border-color: #e6e6e6;
    }
    .flatpickr-day.flatpickr-disabled:hover, .flatpickr-day.prevMonthDay, .flatpickr-day.nextMonthDay {
        color: #aaa;
    }
    .flatpickr-day.flatpickr-disabled {
        color: rgba(57, 57, 57, 0.3);
    }
</style>

<style scoped>
    .modal-background {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 999;
    }
    .modal {
        margin: 10% auto;
        max-width: 570px;
        box-shadow: 0 5px 8px rgba(0, 0, 0, 0.2), 0 7px 20px rgba(0, 0, 0, 0.17);
    }

    .modal header {
        background: #2c3e50;
        padding: 15px;
        color: #ffffff;
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
    }

    .modal header h2 {
        margin: 0;
    }

    .modal section {
        padding: 10px 20px;
        background: #fff;
    }
    .fc-icon.fc-icon-addEvent {
        font-size: 1em;
        width: 1em;
        margin-bottom: -2px;
        max-height: none;
        max-width: none;
    }
    .close {
        background: none;
        border: none;
        color: #fff;
        font-size: 30px;
        float: right;
        cursor: pointer;
    }

    .close:hover {
        color: #000;
    }
    .add-button {
        border-radius: 4px;
        background: #2c3e50;
        border: 0;
        padding: 15px 16.875px;
        color: #FFFFFF;
        font-size: 14px;
    }
    .add-button:hover, .add-button:active, .add-button:focus {
        background: #222f3d;
    }
    .datetime-flex {
        display: flex;
        flex-wrap: wrap;
        align-items: center; 
        column-gap: 5px;
    }
    .date, .time {
        flex-basis: 0; 
        margin-bottom: 16px;
    }

    .submit {
        margin-bottom: 16px; 
        display: inline-flex;
        align-items: center;
        margin-left: auto;
    }
</style>
