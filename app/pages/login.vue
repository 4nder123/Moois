<template>
  <div class="auth-page">
    <LoadingDots ref="loader" />
    <div class="auth-form">
      <LoginMsgBox v-if="message" :message="message" :is-error="msgIsError" />
      <LoginEmailForm v-if="step === 'email'" @submit="handleEmailSubmit" />
      <LoginOtpForm v-else @verify="handleVerifyOtp" />
    </div>
  </div>
</template>

<script setup lang="ts">
import LoadingDots from "~/components/loadingDots.vue";

definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: "/dashboard",
  },
});
const step = ref<"email" | "otp">("email");
const loader = ref<InstanceType<typeof LoadingDots> | null>(null);
const email = ref("");
const message = ref("");
const msgIsError = ref(false);
const localePath = useLocalePath();

function setMsgBox(msg: string, isError = false) {
  message.value = msg;
  msgIsError.value = isError;
}

async function requestOTP(email: string) {
  const res = await authClient.emailOtp.sendVerificationOtp({
    email,
    type: "sign-in",
  });
  return res;
}

async function verifyOTP(email: string, otp: string) {
  const res = await authClient.signIn.emailOtp({ email, otp });
  return res;
}

async function handleEmailSubmit(submittedEmail: string) {
  email.value = submittedEmail;
  try {
    loader.value?.start();
    const { error } = await requestOTP(email.value);
    if (error) return setMsgBox($t("auth.codeFailed"), true);
    setMsgBox($t("auth.codeSent"));
    step.value = "otp";
  } catch {
    setMsgBox($t("auth.errorUnexpected"), true);
  } finally {
    loader.value?.stop();
  }
}

async function handleVerifyOtp(otp: string) {
  if (otp.length < 6) return setMsgBox($t("auth.errorLength"), true);
  try {
    loader.value?.start();
    const { error } = await verifyOTP(email.value, otp);
    if (error) {
      const errorMessage =
        error.code === "TOO_MANY_ATTEMPTS"
          ? $t("auth.tooManyAttempts")
          : $t("auth.errorCode");
      loader.value?.stop();
      return setMsgBox(errorMessage, true);
    }
    return navigateTo(localePath("/dashboard"), { replace: true });
  } catch {
    setMsgBox($t("auth.errorUnexpected"), true);
    loader.value?.stop();
  }
}
</script>

<style scoped>
.auth-page {
  margin: auto;
  max-width: 360px;
  padding: 8% 0 0;
}

.auth-form {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto 100px;
  padding: 45px;
  text-align: center;
  background: #ffffff;
  border-radius: 4px;
  box-shadow:
    0 0 20px 0 rgba(0, 0, 0, 0.2),
    0 5px 5px 0 rgba(0, 0, 0, 0.24);
}

@media (max-width: 360px) {
  .auth-form {
    padding: 45px 20px;
  }
}
</style>
