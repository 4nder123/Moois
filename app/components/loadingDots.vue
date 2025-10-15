<template>
  <div v-if="isLoading" class="loading"></div>
</template>

<script setup lang="ts">
const isLoading = ref(true);
const delay = 300;
let timeout: NodeJS.Timeout;

const start = () => {
  timeout = setTimeout(() => {
    isLoading.value = true;
  }, delay);
};

const stop = () => {
  clearTimeout(timeout);
  isLoading.value = false;
};

defineExpose({
  start,
  stop,
});

onBeforeMount(() => {
  stop();
});

onBeforeUnmount(() => {
  clearTimeout(timeout);
});
</script>

<style scoped>
.loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
}
.loading::after {
  content: "";
  width: 100px;
  aspect-ratio: 4;
  --_g: no-repeat radial-gradient(circle closest-side, #2c3e50 90%, #0000);
  background:
    var(--_g) 0% 50%,
    var(--_g) 50% 50%,
    var(--_g) 100% 50%;
  background-size: 33% 100%;
  animation: l7 900ms infinite linear;
}
@keyframes l7 {
  33% {
    background-size:
      33% 0%,
      33% 100%,
      33% 100%;
  }
  50% {
    background-size:
      33% 100%,
      33% 0%,
      33% 100%;
  }
  66% {
    background-size:
      33% 100%,
      33% 100%,
      33% 0%;
  }
}
</style>
