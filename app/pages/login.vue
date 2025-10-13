<template>
  <div class="auth-page">
    <div class="loading" v-if="isLoading"></div>
    <div class="form">
      <div v-if="errorMsg" class="msgBox error">{{ errorMsg }}</div>
      <div v-if="message" class="msgBox success">{{ message }}</div>

      <form v-if="step === 'email'" autocomplete="off" @submit.prevent="login">
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

      <form v-else autocomplete="off" @submit.prevent="verifyOtp">
        <div class="otp-container">
          <input
            v-for="(digit, i) in otpDigits"
            :id="`otp-${i}`"
            :key="i"
            v-model="otpDigits[i]"
            type="text"
            inputmode="numeric"
            maxlength="1"
            class="otp-input"
            @input="handleInput($event, i)"
            @keydown="handleBackspace($event, i)"
            @paste="handlePaste"
          />
        </div>
        <button type="submit">{{ $t("auth.verify") }}</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: "/dashboard",
  },
});

const email = ref("");
const otpDigits = ref<string[]>(["", "", "", "", "", ""]);
const step = ref<"email" | "otp">("email");
const message = ref("");
const errorMsg = ref("");
const isLoading = ref(false);

function setMsgBox(msg: string, isError = false) {
  if (isError) {
    errorMsg.value = msg;
    message.value = "";
  } else {
    message.value = msg;
    errorMsg.value = "";
  }
}

async function login() {
  errorMsg.value = "";
  message.value = "";

  const { error } = await authClient.emailOtp.sendVerificationOtp({
    email: email.value,
    type: "sign-in",
  });

  if (error) {
    setMsgBox($t("auth.codeFailed") as string, true);
  } else {
    setMsgBox($t("auth.codeSent") as string);
    step.value = "otp";
    await nextTick();
    const firstInput = document.querySelector<HTMLInputElement>("#otp-0");
    firstInput?.focus();
  }
}

async function verifyOtp() {
  const otp = otpDigits.value.join("");

  if (otp.length < 6) {
    setMsgBox($t("auth.errorLength") as string, true);
    return;
  }
  const loading = setTimeout(() => isLoading.value = true, 300);
  try {
    const { error } = await authClient.signIn.emailOtp({
      email: email.value,
      otp,
    });
    if (error) {
      if (error.code === "TOO_MANY_ATTEMPTS") setMsgBox($t("auth.tooManyAttempts") as string, true);
      else setMsgBox($t("auth.errorCode") as string, true);
      return;
    }
    return navigateTo("/dashboard");
  } catch {
    setMsgBox($t("auth.errorUnexpected") as string, true);
  } finally {
    clearTimeout(loading);
    isLoading.value = false;
  }
}

function handleInput(event: Event, index: number) {
  const target = event.target as HTMLInputElement;
  const value = target.value.replace(/\D/g, "");
  otpDigits.value[index] = value.slice(0, 1);

  if (value && index < 5) {
    const next = document.querySelector<HTMLInputElement>(`#otp-${index + 1}`);
    next?.focus();
  }
}

function handleBackspace(event: KeyboardEvent, index: number) {
  if (event.key === "Backspace" && !otpDigits.value[index] && index > 0) {
    const prev = document.querySelector<HTMLInputElement>(`#otp-${index - 1}`);
    prev?.focus();
  }
}

function handlePaste(event: ClipboardEvent) {
  event.preventDefault();
  const pasted = event.clipboardData?.getData("text") ?? "";
  const digits = pasted.replace(/\D/g, "").slice(0, 6).split("");

  digits.forEach((d, i) => {
    otpDigits.value[i] = d;
  });

  const nextIndex = digits.length < 6 ? digits.length : 5;
  const next = document.querySelector<HTMLInputElement>(`#otp-${nextIndex}`);
  next?.focus();
}
</script>

<style scoped>
.auth-page {
  margin: auto;
  max-width: 360px;
  padding: 8% 0 0;
}

.form {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 360px;
  margin: 0 auto 100px;
  padding: 45px;
  text-align: center;
  background: #ffffff;
  border-radius: 4px;
  box-shadow:
    0 0 20px 0 rgba(0, 0, 0, 0.2),
    0 5px 5px 0 rgba(0, 0, 0, 0.24);
}

.form input {
  width: 100%;
  box-sizing: border-box;
  margin: 0 0 15px;
}

.form button {
  width: 100%;
  padding: 15px;
  border: 0;
  border-radius: 4px;
  background: #2c3e50;
  color: #ffffff;
  font-family: "Roboto", sans-serif;
  font-size: 14px;
  text-transform: uppercase;
  outline: 0;
  -webkit-transition: all 0.3 ease;
  transition: all 0.3 ease;
  cursor: pointer;
}

.form button:hover,
.form button:active,
.form button:focus {
  background: #222f3d;
}

@media (max-width: 360px) {
  .form {
    padding: 45px 30px;
  }
}

.otp-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
  gap: 0.5rem;
}

.otp-input {
  width: 2.5rem;
  height: 3rem;
  padding: 0.5rem;
  font-size: 1.5rem;
  text-align: center;
}

.otp-input:focus {
  border: 1px solid #2c3e50;
}

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
