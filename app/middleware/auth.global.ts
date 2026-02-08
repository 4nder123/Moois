export default defineNuxtRouteMiddleware(async (to) => {
  const localePath = useLocalePath();
  const authMeta = to.meta.auth as {
    unauthenticatedOnly: boolean;
    navigateUnauthenticatedTo?: string;
    navigateAuthenticatedTo?: string;
  };

  if (import.meta.client) return;
  if (!authMeta) return;

  const { data: session } = await authClient.useSession(useFetch);
  const loggedIn = !!session.value;

  if (authMeta.unauthenticatedOnly && loggedIn) {
    if (to.path === authMeta.navigateAuthenticatedTo) return;
    if (!authMeta.navigateAuthenticatedTo) return;
    return navigateTo(localePath(authMeta.navigateAuthenticatedTo), {
      replace: true,
    });
  }

  if (!authMeta.unauthenticatedOnly && !loggedIn) {
    if (to.path === authMeta.navigateUnauthenticatedTo) return;
    if (!authMeta.navigateUnauthenticatedTo) return;
    return navigateTo(localePath(authMeta.navigateUnauthenticatedTo), {
      replace: true,
    });
  }
});
