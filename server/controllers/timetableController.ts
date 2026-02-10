import type { H3Event } from 'h3'

const allowedHosts = ["ois2", "tahvel"];

const getTimetableUrl = async (userId: string): Promise<string> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  if (!user.timetableUrl) return "";
  return user.timetableUrl;
};

export const getEvents = async (event: H3Event, userId: string) => {
  try {
    const urlString = await getTimetableUrl(userId);
    if (!urlString) return [];
    const url = new URL(urlString);
    if (!allowedHosts.some((host) => url.hostname.includes(host)))
      throw createError({ statusCode: 400, message: "Invalid URL host" });

    return await getTimetableJson(event, url.toString());
  } catch (event) {
    console.log(event);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to process schedule",
    });
  }
};
