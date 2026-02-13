import { getEvents } from "~~/server/controllers/timetableController";

export default defineEventHandler({
  onRequest: [requireAuth],
  handler: async (event) => {
    const user = event.context.auth.user;
    return await getEvents(event, user.timetableUrl);
  },
});
