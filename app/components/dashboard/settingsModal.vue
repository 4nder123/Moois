<template>
  <dialog class="modal">
    <form @submit.prevent="submit">
      <header>
        <h2>{{ $t("settings.title") }}</h2>
        <div class="header-actions">
          <select v-model="selectedLocale" class="langSelect" aria-label="Language">
            <option v-for="loc in availableLocales" :key="loc.code" :value="loc.code">
              {{ loc.name }}
            </option>
          </select>
          <button type="submit" class="close">&times;</button>
        </div>
      </header>
      <section>
        <p>
          {{ $t("settings.ois") }}
          <input
            id="ois"
            v-model="timetableUrl"
            name="ois"
            type="text"
            class="modal-input"
            placeholder="Õis"
          />
        </p>
        <p>
          {{ $t("settings.moodle") }}
          <input
            id="moodle"
            v-model="homeworkUrl"
            name="moodle"
            type="text"
            placeholder="Moodle"
            class="modal-input"
          />
        </p>
        <p>
          {{ $t("settings.defaultView.label") }}
          <select v-model="dashboardStore.defaultView" class="defaultView">
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
          <input id="switch" type="checkbox" v-model="isDarkMode" />
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

const dashboardStore = useDashboardStore();
const { locale, locales, setLocale } = useI18n();
const colorMode = useColorMode();
const selectedLocale = ref(locale.value);
const availableLocales = computed(() =>
  (locales.value as Array<{ code: string; name?: string }>)
    .filter((l) => l.code)
    .map((l) => ({
      code: l.code,
      name: l.name ?? l.code.toUpperCase(),
    })),
);

const isDarkMode = computed({
  get: () => colorMode.value === "dark",
  set: (value: boolean) => {
    colorMode.preference = value ? "dark" : "light";
  },
});

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
  () => locale.value,
  (value) => {
    if (selectedLocale.value !== value) selectedLocale.value = value;
  },
);

watch(
  () => selectedLocale.value,
  async (value) => {
    if (!value || value === locale.value) return;
    await setLocale(value);
  },
);

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

.header-actions {
  display: inline-flex;
  align-items: center;
  gap: 25px;
}

.langSelect {
  background: transparent;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 14px;
}

.langSelect option {
  color: #111111;
  background: #ffffff;
}

.langSelect:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.8);
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
