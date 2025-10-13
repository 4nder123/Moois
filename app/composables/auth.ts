export function useAuth() {
  async function refresh() {
   try {
      const result = await authClient.useSession($fetch);
      return result?.data?.value ?? null;
    } catch{
      return null;
    }
  }

  async function requestOTP(email: string) {
    const res = await authClient.emailOtp.sendVerificationOtp({ email, type: "sign-in" });
    return res;
  }

  async function verifyOTP(email: string, otp: string) {
    const res = await authClient.signIn.emailOtp({ email, otp });
    await refresh();
    return res;
  }

  async function signOut() {
    await authClient.signOut();
    await refresh();
  }

  return {
    refresh,
    requestOTP,
    verifyOTP,
    signOut,
  };
}
