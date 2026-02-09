import axios from "axios";
import icsTimetableConverter from "~~/server/services/icsTimetableConverter";
import { getCachedOrFetch } from "~~/server/utils/cache";

const allowedHosts = ["ois2", "tahvel"];

const getTimetableUrl = async (userId: string): Promise<string> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  if (!user.timetableUrl) return "";
  return user.timetableUrl;
};

export const getEvents = async (userId: string) => {
  try {
    const urlString = await getTimetableUrl(userId);
    if (!urlString) return [];

    // Include URL in cache key so cache auto-invalidates when URL changes
    const cacheKey = `timetable-${urlString}`;
    return await getCachedOrFetch(cacheKey, async () => {
      const url = new URL(urlString);
      if (!allowedHosts.some((host) => url.hostname.includes(host)))
        throw createError({ statusCode: 400, message: "Invalid URL host" });

      const { data } = await axios.get(url.toString(), { timeout: 8000 });
      return await icsTimetableConverter(data.toString());
    });
  } catch {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to process schedule",
    });
  }
};
