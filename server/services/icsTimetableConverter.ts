import type { VEvent } from "node-ical";
import ical from "node-ical";

interface VEVENT extends VEvent {
  duration?: string;
  categories?: string[];
}

const categories = [
  { aliases: ["loeng", "lecture"], color: "#5089ee" },
  { aliases: ["praktikum", "practical session"], color: "#a3e8a7" },
  { aliases: ["e-õpe", "e-learning"], color: "#e5e5e5" },
  { aliases: ["praktika", "internship"], color: "#4caf50" },
  { aliases: ["kontrolltöö", "test"], color: "#ff5252" },
  { aliases: ["eksam/arvestus", "exam"], color: "#ff5252" },
  { aliases: ["korduseksam", "resit"], color: "#ff5252" },
  { aliases: ["konsultatsioon", "consultation hour"], color: "#ffdd83" },
  { aliases: ["seminar"], color: "#ffab88" },
  { aliases: ["kollokvium", "colloqium"], color: "#ff5252" },
];

const categoryColors = Object.fromEntries(
  categories.flatMap(({ aliases, color }) =>
    aliases.map((alias) => [alias.toLowerCase(), color]),
  ),
);

const getCategoryColor = (category: string): string => {
  return categoryColors[category.toLowerCase()] || "#5089ee";
};

const durationToMs = (duration: string) => {
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const [, hours = 0, minutes = 0, seconds = 0] =
    duration.match(regex)?.map(Number) || [];
  return (hours * 60 * 60 + minutes * 60 + seconds) * 1000;
};

const getWeekStart = (d: Date) => {
  const date = new Date(d),
    day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  return date.toLocaleDateString("en-GB");
};

const getDate = (datetime: Date): string => {
  return datetime.toISOString().split("T")[0];
};

const isExdate = (date: Date, exdates: Date[]) => {
  return exdates.some((exdate) => getDate(exdate) === getDate(date));
};

const parseEvent = (event: VEVENT, start: Date): TimetableEvent => {
  const end = event.duration
    ? new Date(start.getTime() + durationToMs(event.duration))
    : new Date(event.end);

  const isAllDay = start.getUTCHours() < 8;

  return {
    id: event.uid,
    title: event.summary || "",
    start: start.getTime(),
    end: end.getTime(),
    allDay: isAllDay,
    color: event.categories ? getCategoryColor(event.categories[0]) : "#5089ee",
    extendedProps: {
      description: [event.description?.trim(), event.location?.trim()]
        .filter(Boolean)
        .join("\n")
        .replace(/(\n)+/gm, "\n"),
    },
  };
};

export default function convertIcsToTimetable(data: string): TimetableEvents {
  const weeklyGroupedEvents: TimetableEvents = {};
  const icsObject = ical.parseICS(data);
  Object.values(icsObject)
    .filter((event) => event.type === "VEVENT")
    .forEach((event) => {
      const occurrences = event.rrule
        ? event.rrule.all()
        : [new Date(event.start)];
      const exdates = event.exdate
        ? Object.values(event.exdate).map((d) => new Date(String(d)))
        : [];
      occurrences.forEach((occurrence) => {
        if (isExdate(occurrence, exdates)) return;
        const weekKey = getWeekStart(occurrence);
        if (!weeklyGroupedEvents[weekKey]) weeklyGroupedEvents[weekKey] = [];
        const parsedEvent = parseEvent(event, occurrence);
        weeklyGroupedEvents[weekKey].push(parsedEvent);
      });
    });

  return weeklyGroupedEvents;
}
