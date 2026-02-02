<template>
  <form autocomplete="off" @submit.prevent="submitOtp">
    <div class="otp-container">
      <input
        v-for="(digit, i) in otpDigits"
        :id="`otp-${i}`"
        :key="i"
        v-model="otpDigits[i]"
        type="text"
        inputmode="numeric"
        maxlength="1"
        @input="handleInput($event, i)"
        @keydown="handleBackspace($event, i)"
        @paste="handlePaste"
      />
    </div>
    <button type="submit" class="auth-btn">{{ $t("auth.verify") }}</button>
  </form>
</template>

<script setup lang="ts">
const otpDigits = ref<string[]>(["", "", "", "", "", ""]);

const emit = defineEmits<{
  (e: "verify", otp: string): void;
}>();

function submitOtp() {
  emit("verify", otpDigits.value.join(""));
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
  digits.forEach((d, i) => (otpDigits.value[i] = d));

  nextTick(() => {
    const nextIndex = digits.length < 6 ? digits.length : 5;
    const next = document.querySelector<HTMLInputElement>(`#otp-${nextIndex}`);
    next?.focus();
    if (otpDigits.value.join("").length === 6) submitOtp();
  });
}

onMounted(() => {
  const firstInput = document.querySelector<HTMLInputElement>("#otp-0");
  firstInput?.focus();
});
</script>

<style scoped>
form {
  width: 100%;
}

.otp-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

input {
  width: 2.5rem;
  height: 3rem;
  padding: 0.5rem;
  font-size: 1.5rem;
  text-align: center;
  margin: 0 0 15px;
}

input:focus {
  border: 1px solid #2c3e50;
}

button {
  width: 100%;
}
</style>
