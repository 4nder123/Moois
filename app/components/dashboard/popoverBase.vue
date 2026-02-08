<template>
  <div ref="popover" popover="manual" :style="positionCss">
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { CSSProperties } from "vue";

const props = defineProps<{
  position?: "top" | "bottom" | "left" | "right";
}>();

const popover = ref<HTMLElement | null>(null);
const anchorEl = ref<HTMLElement | null>(null);
const positionCss = ref<CSSProperties>({});
const isOpen = ref(false);

const resetAnchor = () => {
  if (anchorEl.value) {
    anchorEl.value.blur();
    anchorEl.value = null;
  }
};

const showPopover = (el: HTMLElement) => {
  if (!popover.value) return;
  anchorEl.value = el;
  popover.value.showPopover();
  isOpen.value = true;
  nextTick(() => updatePosition());
  window.addEventListener("resize", hidePopover);
  document.addEventListener("click", handleOutsideClick);
};

const hidePopover = () => {
  if (!popover.value) return;
  popover.value.hidePopover();
  isOpen.value = false;
  resetAnchor();
  cleanupListeners();
};

const updatePosition = () => {
  if (!anchorEl.value || !popover.value) return;
  positionCss.value = calculatePosition(anchorEl.value);
};

const calculatePosition = (el: HTMLElement): CSSProperties => {
  if (!popover.value) return {};
  const pop = popover.value;
  const triggerRect = el.getBoundingClientRect();
  const popRect = pop.getBoundingClientRect();
  const pos = props.position ?? "top";
  let top = window.pageYOffset;
  let left = window.pageXOffset;

  switch (pos) {
    case "bottom":
      top += triggerRect.bottom;
      left += triggerRect.left + triggerRect.width / 2 - popRect.width / 2;
      break;
    case "top":
      top += triggerRect.top - popRect.height;
      left += triggerRect.left + triggerRect.width / 2 - popRect.width / 2;
      break;
    case "left":
      top += triggerRect.top + triggerRect.height / 2 - popRect.height / 2;
      left += triggerRect.left - popRect.width;
      break;
    case "right":
      top += triggerRect.top + triggerRect.height / 2 - popRect.height / 2;
      left += triggerRect.right;
      break;
  }

  left = Math.max(0, Math.min(left, document.body.scrollWidth - popRect.width));

  return {
    top: `${Math.floor(top)}px`,
    left: `${Math.floor(left)}px`,
  };
};

const handleOutsideClick = (e: Event) => {
  if (!popover.value || !isOpen.value) return;
  const target = e.target as Node;
  if (!anchorEl.value?.contains(target)) {
    hidePopover();
  }
};

const cleanupListeners = () => {
  window.removeEventListener("resize", hidePopover);
  document.removeEventListener("click", handleOutsideClick);
};

onBeforeUnmount(() => {
  cleanupListeners();
});

defineExpose({ showPopover, hidePopover });
</script>

<style scoped>
[popover] {
  position: sticky;
  margin: 0;
  padding: 0.5rem 1rem;
  width: max-content;
  max-width: 300px;
  background-color: var(--popover-bg-color, white);
  color: var(--popover-text-color, inherit);
  border: 1px solid var(--popover-border-color, #ccc);
  border-radius: 0.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  line-height: 1.4;
  text-align: center;
  white-space: pre-line;
  z-index: 10000;
  inset: unset;
}
</style>
