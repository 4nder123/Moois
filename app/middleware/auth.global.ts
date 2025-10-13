export default defineNuxtRouteMiddleware(async (to) => {
  const authMeta = to.meta.auth as {
    unauthenticatedOnly: boolean;
    navigateUnauthenticatedTo?: string;
    navigateAuthenticatedTo?: string; 
  };

  if (!authMeta) return;

  const {data: session} = await authClient.useSession(useFetch);
  const loggedIn = !!session.value;

  if (authMeta.unauthenticatedOnly && loggedIn) {
    if(to.path === authMeta.navigateAuthenticatedTo) return;
    return navigateTo(authMeta.navigateAuthenticatedTo);
  }

  if (!authMeta.unauthenticatedOnly && !loggedIn) {
    if (to.path === authMeta.navigateUnauthenticatedTo) return;
    return navigateTo(authMeta.navigateUnauthenticatedTo);
  }
});

