const pressEvents = ["mousedown", "touchstart"];
const cancelEvents = ["mouseup", "mouseleave", "touchend"];
const PRESS_TIMEOUT = 500;

interface LongPressElement extends HTMLElement {
  _cleanup?: () => void;
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive("long-press", {
    mounted(el: LongPressElement) {
      let timer: ReturnType<typeof setTimeout> | null = null;
      let longPressTriggered = false;

      const start = (e: Event) => {
        if (e instanceof MouseEvent && e.button !== 0) return;
        longPressTriggered = false;
        timer = setTimeout(() => {
          longPressTriggered = true;
          el.dispatchEvent(new CustomEvent("onLongPress", { detail: e }));
        }, PRESS_TIMEOUT);
      };

      const cancel = () => {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      };

      const preventClick = (e: MouseEvent) => {
        if (longPressTriggered) {
          e.preventDefault();
          e.stopImmediatePropagation();
          e.stopPropagation();
          longPressTriggered = false;
        }
      };

      pressEvents.forEach((event) =>
        el.addEventListener(event, start, { passive: true }),
      );
      cancelEvents.forEach((event) =>
        el.addEventListener(event, cancel, { passive: true }),
      );

      el.addEventListener("click", preventClick, true);

      el._cleanup = () => {
        pressEvents.forEach((event) => el.removeEventListener(event, start));
        cancelEvents.forEach((event) => el.removeEventListener(event, cancel));
        el.removeEventListener("click", preventClick, true);
      };
    },
    unmounted(el: LongPressElement) {
      el._cleanup?.();
    },
  });
});
