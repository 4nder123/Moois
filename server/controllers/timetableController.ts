import type { H3Event } from "h3";
import icsTimetableConverter from "../services/icsTimetableConverter";

const allowedHosts = ["ois2", "tahvel"];

export const getEvents = async (event: H3Event, urlString: string) => {
  try {
    if (!urlString) return [];
    const url = new URL(urlString);
    if (!allowedHosts.some((host) => url.hostname.includes(host)))
      throw createError({ statusCode: 400, message: "Invalid URL host" });

    return await getEventJson(icsTimetableConverter, event, url.toString());
  } catch (event) {
    console.log(event);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to process schedule",
    });
  }
};
