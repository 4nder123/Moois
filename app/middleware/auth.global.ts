async function isUserLoggedIn() {
  try {
    const { data } = await authClient.getSession();
    return !!data?.session;
  } catch {
    return false;
  }
}

export default defineNuxtRouteMiddleware(async (to) => {
  const authMeta = to.meta.auth as {
    unauthenticatedOnly?: boolean;
    navigateUnauthenticatedTo?: string;
    navigateAuthenticatedTo?: string;
  };
  if (!authMeta) return;

  const isLoggedIn = await isUserLoggedIn();

  if (authMeta.unauthenticatedOnly === false && !isLoggedIn) {
    return navigateTo(authMeta.navigateUnauthenticatedTo || "/login");
  }

  if (authMeta.unauthenticatedOnly && isLoggedIn) {
    return navigateTo(authMeta.navigateAuthenticatedTo || "/dashboard");
  }
});
