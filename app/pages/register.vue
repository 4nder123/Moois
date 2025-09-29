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
      <form @submit.prevent="">
        <input
          type="email"
          name="email"
          id="email"
          placeholder="email"
          required
        />
        <input
          type="password"
          name="password"
          id="password"
          placeholder="parool"
          required
        />
        <button type="submit">{{ $t("auth.register") }}</button>
        <p class="message">
          {{ $t("auth.haveAccount") }}
          <NuxtLink to="/login">{{ $t("auth.login") }}</NuxtLink>
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped></style>
