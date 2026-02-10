// https://www.better-auth.com/docs/integrations/nitro
import type { EventHandler, H3Event } from "h3";

export const requireAuth: EventHandler = async (event: H3Event) => {
  const headers = event.headers;

  const session = await auth.api.getSession({
    headers: headers,
  });
  if (!session)
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  event.context.auth = session;
};
