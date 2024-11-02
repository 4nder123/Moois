const axios = require('axios')
const fs = require('fs')
const path = require('path');
const ical = require("node-ical");
const moment = require('moment');

const exprops = "extendedProps";
const ainekoodid = {}

const getEventData = function(id){
    if (fs.existsSync(path.join(__dirname, '../database/user-saved-info/'+id+'.json'))) {
        return fs.readFileSync(path.join(__dirname, '../database/user-saved-info/'+id+'.json')).toString()
    }
    else{
        return '{"done": [], "highlight":[], "events":[]}'
    }
}

const getAine = async (ainekood) => {
    if(ainekood in ainekoodid) return ainekoodid[ainekood];
    const validAinekood = ainekood.match(/^[A-Z, 0-9]+[.][0-9]+[.][0-9]+/);
    if(validAinekood) {
      try {
        const aineNimi = await axios.get("https://ois2.ut.ee/api/courses/"+ validAinekood.toString());
        const aineJson = aineNimi.data;
        ainekoodid[ainekood] = aineJson["title"]["et"];
        return aineJson["title"]["et"];
      } catch {
        console.log("API päring ebaõnnestus:", error);
      }
    }
    return (ainekoodid[ainekood] = ainekood);
}

const updateUserInfo = async function(id, isDone, isHigh, userEvents) {
  const filePath = path.join(__dirname, '../database/user-saved-info/', `${id}.json`);
  if (fs.existsSync(filePath)) {
      const userData = JSON.stringify({
          done: isDone,
          highlight: isHigh,
          events: userEvents,
      });
      try {
          await fs.promises.writeFile(filePath, userData);
      } catch (error) {
          console.log('Error writing to file:', error);
      }
  }
}

const processEvents = async function(icsObject) {
  const eventMap = new Map();
  for (const event of Object.values(icsObject)) {
    if (event.type === "VEVENT") {
      const newEvent = {
        id: event.uid,
        start: event.start.toISOString(),
        end: event.end.toISOString(),
        title: event.summary,
        [exprops]: { status: "", color: "" },
      };

      if(event.categories){
        const courseName = await getAine(event.categories.toString());
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
  const evData = JSON.parse(getEventData(id));
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
  updateUserInfo(id, isDone, isHigh, userEvents);
  return events;
};
