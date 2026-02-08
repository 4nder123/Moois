<template>
    <dialog ref="dialogEl" class="modal">
        <div class="modal-content">
        <header>
            <h2>{{ $t("addEvent.title") }}</h2>
            <button type="button" class="close" @click="close">&times;</button>
        </header>
        <section>
            <form id="datetimeadd" @submit.prevent="submit">
                <p>{{ $t("addEvent.subject") }}</p>
                <input v-model="title" type="text" name="title" class="modal-input" pattern="\S.*" :placeholder="$t('addEvent.subjectPlaceholder')" autocomplete="off" maxlength="240" required>

                <p>{{ $t("addEvent.dueDate") }}</p>
                <div class="datetime-flex">
                    <div class="date">
                        <FlatPickr
                            v-model="date"
                            :config="dateConfig"
                            class="picker"
                            name="date"/>
                    </div>
                    <div class="time">
                        <FlatPickr
                            v-model="time"
                            :config="timeConfig"
                            class="picker"
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
        <div class="modal-background"></div>
    </dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import FlatPickr from "vue-flatpickr-component";
import { Estonian } from "flatpickr/dist/l10n/et.js";
import { english } from "flatpickr/dist/l10n/default.js";
import "flatpickr/dist/flatpickr.css";

const dialogEl = ref<HTMLElement | null>(null);

const emit = defineEmits<{
    (e: "close"): void;
    (e: "event-added", payload: HomeworkEvent): void;
}>();

const title = ref("");
const date = ref<string | Date | null>(new Date());
const time = ref<string | Date | null>("00:00");

const timeConfig = ref({
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",
    time_24hr: true,
});

const { locale } = useI18n();
const dateConfig = computed(() => ({
    locale: locale.value === "et" ? Estonian : english,
    altInput: true,
    altFormat: "F j, Y",
    dateFormat: "Y-m-d",
    minDate: Date.now(),
    maxDate: new Date(new Date().setFullYear(new Date(Date.now()).getFullYear() + 2)),
}));



const submit = (e: SubmitEvent) => {
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const titleValue = String(formData.get("title") ?? "").trim();
    const dateValue = String(formData.get("date") ?? "").trim();
    const timeValue = String(formData.get("time") ?? "").trim();

    if (!titleValue || !dateValue || !timeValue) return;
    const event: HomeworkEvent = {
        id: crypto.randomUUID(),
        title: titleValue,
        start: new Date(`${dateValue}T${timeValue}`).getTime(),
        end: new Date(`${dateValue}T${timeValue}`).getTime(),
        extendedProps: {
            userAdded: true,
            status: "",
            color: "",
        },
    };

    emit("event-added", event);
    resetForm();
};

const close = () => {
    resetForm();
    emit("close");
};

const resetForm = () => {
    title.value = "";
    date.value = new Date();
    time.value = "00:00";
};
</script>

<style> 
    .picker {
        width: auto !important;
        min-width: 0;
    }
    .modal {
        position: fixed;
        inset: 0;
        margin: auto;
        z-index: 999;
    }
    .modal-content{
        position: relative;
        z-index: 9999;
        background: inherit;
    }
    .modal-background {
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1000;
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
        color: #FFFFFF !important; 
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
    .add-button {
        aspect-ratio: 1 / 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }
    .add-button:hover, .add-button:active, .add-button:focus {
        background: #222f3d;
    }
    .datetime-flex {
        display: grid;
        grid-template-columns: auto auto 40px;
        align-items: stretch;
        column-gap: 8px;
        row-gap: 16px;
    }
    .date,
    .time {
        flex: 0 0 auto;
        min-width: 0;
    }
    .submit {
        display: inline-flex;
        align-items: stretch;
        justify-content: flex-end;
    }

    @media (max-width: 550px) {
        .datetime-flex {
            grid-template-columns: 1fr 40px;
            grid-template-areas:
                "date date"
                "time submit";
        }
        .date {
            grid-area: date;
        }
        .time {
            grid-area: time;
        }
        .submit {
            grid-area: submit;
        }
    }

</style>