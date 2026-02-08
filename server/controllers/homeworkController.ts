import axios from "axios";
import icsHomeworkConverter from "~~/server/services/icsHomeworkConverter";
import { getCachedOrFetch } from "~~/server/utils/cache";

const allowedHosts = ["moodle"];

const getHomeworkUrl = async (userId: string): Promise<string> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  if (!user.homeworkUrl) return "";
  return user.homeworkUrl;
};

const attachExtendedProps = async (userId: string, events: HomeworkEvent[]) => {
  const states = await prisma.iCalHomeworkState.findMany({
    where: { userId },
    select: { homeworkId: true, status: true, color: true },
  });

  const stateMap = new Map(
    states.map((s) => [s.homeworkId, { status: s.status, color: s.color }]),
  );
  return events.map((ev) => {
    const state = stateMap.get(ev.id);
    return {
      ...ev,
      extendedProps: {
        userAdded: false,
        status: state?.status ?? "",
        color: state?.color ?? "",
      },
    };
  });
};

const getUserHomeworkEvents = async (
  userId: string,
): Promise<HomeworkEvent[]> => {
  const userHomeworks = await prisma.userHomework.findMany({
    where: { userId },
    select: { id: true, title: true, start: true, status: true, color: true },
  });

  return userHomeworks.map((hw) => ({
    id: hw.id,
    title: hw.title,
    start: hw.start.getTime(),
    end: hw.start.getTime(),
    extendedProps: {
      userAdded: true,
      status: hw.status ?? "",
      color: hw.color ?? "",
    },
  }));
};

export const getEvents = async (userId: string) => {
  const userHomeworkEvents = await getUserHomeworkEvents(userId);

  try {
    const urlString = await getHomeworkUrl(userId);
    if (!urlString) return userHomeworkEvents;
    
    const cacheKey = `homework-${urlString}`;
    const icsEvents = await getCachedOrFetch(
      cacheKey,
      async () => {
        const url = new URL(urlString);
        if (!allowedHosts.some((host) => url.hostname.includes(host)))
          throw createError({ statusCode: 400, message: "Invalid URL host" });

        const { data } = await axios.get(url.toString(), { timeout: 8000 });
        return await icsHomeworkConverter(data.toString());
      }
    );
    
    const icsWithProps = await attachExtendedProps(userId, icsEvents);
    return [...icsWithProps, ...userHomeworkEvents];
  } catch (event) {
    console.log(event);
    return userHomeworkEvents;
  }
};
