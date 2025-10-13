<template>
    <div :class="['msgBox', isError ? 'error' : 'success']">{{ message }}</div>
</template>

<script setup lang="ts">
defineProps<{
    message: string;
    isError: boolean;
}>();
</script>

<style scoped>
.msgBox {
  width: 100%;
  margin-bottom: 10px;
  padding: 10px;
  box-sizing: border-box;
  border: 1px solid;
  text-align: center;
}

.error {
  background-color: #fee;
  border-color: #edd;
  color: #a66;
}

.success {
  background-color: #efe;
  border-color: #dcd;
  color: #9a9;
}
</style>
