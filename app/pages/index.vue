<template>
  <div class="landing">
    <header class="landing-header">
      <button class="login-button" type="button" @click="goToLogin">
        {{ $t("auth.login") }}
      </button>
    </header>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: "/dashboard",
  },
});

const localePath = useLocalePath();
const goToLogin = () => {
  navigateTo(localePath("/login"));
};
</script>

<style scoped>
.landing {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.landing-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 16px 24px;
}

.brand {
  font-weight: 700;
  font-size: 20px;
}

.login-button {
  padding: 10px 18px;
  border-radius: 8px;
}
</style>
