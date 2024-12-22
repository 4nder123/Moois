const axios = require('axios')
const ical = require("node-ical");
const moment = require('moment');
const { getUserEventData, updateUserEventData } = require('./database')

const exProps = "extendedProps";
const courseIds = {};

const getCourse = async (courseId) => {
    if (courseId in courseIds) return courseIds[courseId];
    const validCourseId = courseId.match(/^[A-Z, 0-9]+[.][0-9]+[.][0-9]+/);
    if (validCourseId) {
        try {
            const courseName = await axios.get("https://ois2.ut.ee/api/courses/" + validCourseId.toString());
            const courseJson = courseName.data;
            courseIds[courseId] = courseJson["title"]["et"];
            return courseJson["title"]["et"];
        } catch (error) {
            console.log("API request failed:", error);
        }
    }
    return (courseIds[courseId] = courseId);
};


const processEvents = async function(icsObject) {
  const eventMap = new Map();
  for (const event of Object.values(icsObject)) {
    if (event.type === "VEVENT") {
      const newEvent = {
        id: event.uid,
        start: event.start.toISOString(),
        end: event.end.toISOString(),
        title: event.summary,
        [exProps]: { status: "", color: "" },
      };

      if(event.categories){
        const courseName = await getCourse(event.categories.toString());
        newEvent.title = courseName + " - " + newEvent.title;
      }

      const key = newEvent.start.slice(0,-13);
      if(!eventMap.has(key)) {
        eventMap.set(key, [newEvent]);
      } else {
        const title = newEvent.title.replace(/\w+[.!?]?$/, '');
        const duplicateEvent = eventMap.get(key).find(event => event.title.replace(/\w+[.!?]?$/, '') === title);
        if(duplicateEvent) {
          duplicateEvent.title = title;
          duplicateEvent.end = newEvent.start;
        } else {
          eventMap.get(key).push(newEvent);
        }
      }
    }
  }
  return Array.from(eventMap.values()).flat();
}

module.exports = async(icsData, id) => {
  const icsObject = ical.parseICS(icsData);
  const evData = JSON.parse(getUserEventData(id));
  const done = new Set(evData.done);
  const highlight = new Map(evData.highlight.map(([id, color]) => [id, color]));
  const userEvents = evData.events.filter(event => moment().diff(event.start, "days") <= 5);

  const events = (await processEvents(icsObject)).concat(JSON.parse(JSON.stringify(userEvents)));
  const isDone = [];
  const isHigh = [];
  events.forEach(event => {
    const { id, extendedProps } = event;
    if (done.has(id)) {
        isDone.push(id);
        extendedProps.status = "done";
    } else {
        if (highlight.has(id)) {
            const color = highlight.get(id);
            extendedProps.status = "high";
            extendedProps.color = color;
            isHigh.push([id, color]);
        }
    }
  });
  updateUserEventData(id, isDone, isHigh, userEvents);
  return events;
};
