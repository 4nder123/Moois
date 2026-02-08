<template>
  <dialog class="modal">
      <header>
        <h2>{{ $t("filter.title") }}</h2>
        <button type="button" class="close" @click="close">&times;</button>
      </header>
      <section>
        <div class="done-option">
            {{ $t("filter.showDone") }}
            <input type="checkbox" :checked="!filter.includes('done')" id="filter-switch" />
            <label for="filter-switch" @click="setFilter('done')">Toggle</label>
        </div>
        <div class="color-options">
            <span>{{ $t("filter.color") }}</span>
            <button
                v-for="color in colors"
                :key="color.name"
                class="color-btn"
                :class="{ selected: !filter.includes(color.name) }"
                @click="setFilter(color.name)"
            >
                <span :class="['color-circle', color.name]"></span>
                {{ color.label }}
            </button>
        </div>
      </section>
    </dialog>
</template>

<script setup lang="ts">
type FilterItem = "done" | "red" | "orange" | "yellow";

const emit = defineEmits<{
  (e: "close"): void;
}>();

const store = useDashboardStore();
const filter = computed(() => store.filter as FilterItem[]);

const colors = [
  { name: "red", label: $t("filter.red") },
  { name: "orange", label: $t("filter.orange") },
  { name: "yellow", label: $t("filter.yellow") },
] as const;

const setFilter = (item: FilterItem) => {
  if (filter.value.includes(item)) {
    store.removeFilter(item);
    return;
  }
  store.addFilter(item);
};

const close = () => {
  emit("close");
};
</script>

<style scoped> 
.modal {
        max-width: 400px !important;
    }
.color-options {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 20px;
    }
    .color-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        border: 2px solid grey;
        background-color: inherit;
        border-radius: 20px;
        padding: 5px 12px !important;
        cursor: pointer;
        text-transform: none;
        color: inherit;
        font-weight: 500;
    }
    .color-btn.selected {
        border: 2px solid #2c3e50;
    }
    .color-circle {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        display: inline-block;
    }
    .color-circle.red {
        background-color: #ff0000;
    }
    .color-circle.yellow {
        background-color: #ffd700;
    }
    .color-circle.orange {
        background-color: #ffa500;
    }

    input[type=checkbox]{
        height: 0;
        width: 0;
        visibility: hidden;
    }
    label[for="filter-switch"] {
        cursor: pointer;
        text-indent: -9999px;
        width: 50px;
        height: 30px;
        background: grey;
        display: block;
        border-radius: 30px;
        position: relative;
    }

    label[for="filter-switch"]:after {
        content: '';
        position: absolute;
        top: 5px;
        left: 5px;
        width: 20px;
        height: 20px;
        background: #fff;
        border-radius: 20px;
        transition: 0.3s;
    }

    input:checked + label[for="filter-switch"] {
        background: #2c3e50;
    }

    input:checked + label[for="filter-switch"]:after {
        left: calc(100% - 5px);
        transform: translateX(-100%);
    }
    .done-option {
        display: flex;
        align-items: center;
    }
</style>