<template>
  <form @submit.prevent="submitEmail">
    <input
      id="email"
      v-model="email"
      name="email"
      type="email"
      placeholder="Email"
      required
    />
    <button type="submit">{{ $t("auth.login") }}</button>
  </form>
</template>

<script setup lang="ts">
const email = ref("");
const emit = defineEmits<{
  (e: "submit", email: string): void;
}>();

function submitEmail() {
  emit("submit", email.value);
}
</script>

<style scoped>
input {
  margin: 0 0 15px;
  width: 100%;
}

button {
  width: 100%;
}
</style>
