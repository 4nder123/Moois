import type { VEvent } from "node-ical";
import ical from "node-ical";
import axios from "axios";
import type { HomeworkEvent } from "~~/shared/types/event.types";

interface VEVENT extends VEvent {
  categories?: string[];
}

const courseIds: Record<string, string> = {};

const getCourse = async (courseId: string) => {
  if (courseId in courseIds) return courseIds[courseId];
  const validCourseId = courseId.match(/^[A-Z, 0-9]+[.][0-9]+[.][0-9]+/);
  if (validCourseId) {
    try {
      const courseName = await axios.get(
        "https://ois2.ut.ee/api/courses/" + validCourseId.toString(),
      );
      const courseJson = courseName.data;
      courseIds[courseId] = courseJson["title"]["et"];
      return courseJson["title"]["et"];
    } catch (error) {
      console.log("API request failed:", error);
    }
  }
  return (courseIds[courseId] = courseId);
};

const parseEvent = async (event: VEVENT): Promise<HomeworkEvent> => {
  const title = event.categories
    ? (await getCourse(event.categories[0])) + " - " + event.summary
    : event.summary;
  return {
    id: event.uid,
    title: title,
    start: new Date(event.start).getTime(),
    end: new Date(event.end).getTime(),
    extendedProps: {
      userAdded: false,
      status: "",
      color: "",
    },
  };
};

export default async function convertIcsToHomework(
  icsData: string,
): Promise<HomeworkEvent[]> {
  const icsObject = ical.parseICS(icsData);

  const eventPromises = Object.values(icsObject)
    .filter((event) => event.type === "VEVENT")
    .map(async (eventObj) => {
      return await parseEvent(eventObj as VEVENT);
    });

  const events = await Promise.all(eventPromises);
  return events;
}
