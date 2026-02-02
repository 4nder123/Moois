<template>
  <dialog class="modal">
    <form @submit.prevent="submit">
      <header>
        <h2>{{ $t("settings.title") }}</h2>
        <button type="submit" class="close">&times;</button>
      </header>
      <section>
        <p>
          {{ $t("settings.ois") }}
          <input
            id="ois"
            name="ois"
            type="text"
            class="modal-input"
            placeholder="Õis"
            v-model="timetableUrl"
          />
        </p>
        <p>
          {{ $t("settings.moodle") }}
          <input
            id="moodle"
            name="moodle"
            type="text"
            placeholder="Moodle"
            class="modal-input"
            v-model="homeworkUrl"
          />
        </p>
        <p>
          {{ $t("settings.defaultView.label") }}
          <select v-model="store.defaultView" class="defaultView">
            <option value="timetable">
              {{ $t("settings.defaultView.timetable") }}
            </option>
            <option value="homework">
              {{ $t("settings.defaultView.homework") }}
            </option>
          </select>
        </p>
        <p>
          {{ $t("settings.darkMode") }}
          <input id="switch" type="checkbox" />
          <label for="switch"></label>
        </p>
        <p>
          <button type="button" class="logout-button" @click="logout">
            {{ $t("settings.logout") }}
          </button>
        </p>
      </section>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import "~/assets/css/modal.css";

const props = defineProps<{
  eventUrls: { homework: string; timetable: string };
}>();

const timetableUrl = ref("");
const homeworkUrl = ref("");

const store = useDashboardStore();

const emit = defineEmits<{
  (
    e: "close",
    urls: Partial<{ timetableUrl: string; homeworkUrl: string }>,
  ): void;
  (e: "logout"): void;
}>();

const submit = () => {
  const original = props.eventUrls ?? { timetable: "", homework: "" };
  const changed: Partial<{ timetableUrl: string; homeworkUrl: string }> = {};

  if ((timetableUrl.value ?? "") !== (original.timetable ?? "")) {
    changed.timetableUrl = timetableUrl.value;
  }
  if ((homeworkUrl.value ?? "") !== (original.homework ?? "")) {
    changed.homeworkUrl = homeworkUrl.value;
  }
  emit("close", changed);
};
const logout = async () => {
  emit("logout");
};

watch(
  () => props.eventUrls,
  (v) => {
    timetableUrl.value = v?.timetable ?? "";
    homeworkUrl.value = v?.homework ?? "";
  },
  { immediate: true },
);
</script>

<style scoped>
input[type="checkbox"] {
  height: 0;
  width: 0;
  visibility: hidden;
}

label[for="switch"] {
  cursor: pointer;
  text-indent: -9999px;
  width: 50px;
  height: 30px;
  background: grey;
  display: block;
  border-radius: 30px;
  position: relative;
}

label[for="switch"]:after {
  content: "";
  position: absolute;
  top: 5px;
  left: 5px;
  width: 20px;
  height: 20px;
  background: #fff;
  border-radius: 20px;
  transition: 0.3s;
}

input:checked + label[for="switch"] {
  background: #2c3e50;
}

input:checked + label[for="switch"]:after {
  left: calc(100% - 5px);
  transform: translateX(-100%);
}

.defaultView {
  background: #f0f0f0;
  width: 100%;
  border: none;
  font-size: 14px;
  color: black;
  box-sizing: border-box;
  border-radius: 4px;
  -webkit-border-radius: 4px;
  height: 48px;
  text-indent: 11px;
}

.defaultView:focus {
  outline: none;
}
</style>
