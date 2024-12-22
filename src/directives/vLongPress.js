const pressEvents = ['mousedown', 'touchstart'];
const cancelEvents = ['mouseup', 'mouseleave', 'touchend'];
const PRESS_TIMEOUT = 500;

export const vLongPress = {
    mounted(el) {
        let timer = null;
        const start = (e) => {
            if (e.type === 'mousedown' && e.button !== 0) return;
            timer = setTimeout(() => {
                el.dispatchEvent(new CustomEvent('onLongPress', { detail: e }));
            }, PRESS_TIMEOUT);
        };

        const cancel = (e) => {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
        };

        pressEvents.forEach((event) => el.addEventListener(event, start, {passive: true}));
        cancelEvents.forEach((event) => el.addEventListener(event, cancel, {passive: true}));

        el._cleanup = () => {
            pressEvents.forEach((event) => el.removeEventListener(event, start));
            cancelEvents.forEach((event) => el.removeEventListener(event, cancel));
        };
    },
    unmounted(el) {
        el._cleanup();
    },
};
