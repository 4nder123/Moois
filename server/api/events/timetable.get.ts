import { getEvents } from "~~/server/controllers/timetableController";

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({
    headers: event.headers,
  });

  if (!session)
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  return await getEvents(event, session.user.id);
});
