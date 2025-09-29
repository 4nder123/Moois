<script setup lang="ts">
import "~/assets/css/auth.css";

definePageMeta({
  layout: "auth",
});
</script>

<template>
  <div class="auth-page">
    <div class="form">
      <div v-if="false" class="error"></div>
      <div v-if="false" class="success">{{ $t("auth.accountCreated") }}</div>
      <form @submit.prevent="">
        <input
          name="email"
          type="email"
          id="email"
          placeholder="email"
          required
        />
        <input
          name="password"
          type="password"
          id="password"
          placeholder="parool"
          required
        />
        <button type="submit">{{ $t("auth.login") }}</button>
        <p class="message">
          {{ $t("auth.noAccount") }}
          <NuxtLink to="/register"> {{ $t("auth.createAccount") }} </NuxtLink>
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped></style>
