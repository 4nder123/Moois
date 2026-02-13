import type { H3Event } from "h3";
import { getHomeworkStates, getUserHomeworks } from "../services/database";
import icsHomeworkConverter from "../services/icsHomeworkConverter";

const allowedHosts = ["moodle"];

const addExtendedProps = async (
  userId: string,
  iCalEvents: EventBase[],
  userEvents: EventBase[],
) => {
  const states = await getHomeworkStates(userId);
  const stateMap = new Map(states.map((state) => [state.homeworkId, state]));
  const userEventIds = new Set(userEvents.map((e) => e.id));

  const allEvents = [...iCalEvents, ...userEvents];

  return allEvents.map((event) => {
    const state = stateMap.get(event.id);

    return {
      ...event,
      extendedProps: {
        status: state?.status ?? null,
        color: state?.color ?? null,
        userAdded: userEventIds.has(event.id),
      },
    };
  });
};

const getUserEvents = async (userId: string) => {
  try {
    const events = await getUserHomeworks(userId);
    return events.map((event) => ({
      ...event,
      start: event.start.getTime(),
    }));
  } catch (event) {
    console.log(event);
    return [];
  }
};
const getICalEvents = async (event: H3Event, urlString: string) => {
  try {
    const url = new URL(urlString);
    if (!urlString || !allowedHosts.some((host) => url.hostname.includes(host)))
      return [];
    return await getEventJson(icsHomeworkConverter, event, url.toString());
  } catch (event) {
    console.log(event);
    return [];
  }
};

export const getEvents = async (
  event: H3Event,
  userId: string,
  url: string,
) => {
  try {
    const [iCalEvents, userEvents] = await Promise.all([
      getICalEvents(event, url),
      getUserEvents(userId),
    ]);
    return await addExtendedProps(userId, iCalEvents, userEvents);
  } catch (event) {
    console.log(event);
    return [];
  }
};
