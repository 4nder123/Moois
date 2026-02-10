import { getEvents } from "~~/server/controllers/timetableController";

export default defineEventHandler({
  onRequest: [requireAuth],
  handler: async (event) => {
    return await getEvents(event, event.context.auth.user.id);
  },
});
