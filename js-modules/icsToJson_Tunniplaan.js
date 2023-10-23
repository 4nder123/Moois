const NEW_LINE = /\r\n|\n|\r/;

const EVENT = "VEVENT";
const EVENT_START = "BEGIN";
const EVENT_END = "END";
const START_DATE = "DTSTART";
const END_DATE = "DTEND";
const DESCRIPTION = "DESCRIPTION";
const SUMMARY = "SUMMARY";
const LOCATION = "LOCATION";
const ALARM = "VALARM";
const RRULE = "RRULE";
const DURATION = "DURATION";
const CATEGORIES = "CATEGORIES";
const COLOR = "COLOR";
const EXDATE = "EXDATE";

const keyMap = {
  [START_DATE]: "start",
  [END_DATE]: "end",
  [DESCRIPTION]: "description",
  [SUMMARY]: "title",
  [LOCATION]: "location",
  [RRULE]: "rrule",
  [DURATION]: "duration",
  [COLOR]: "color",
  [EXDATE]: "exdate"
};

const clean = string => unescape(string).trim();
const color = function(Category){
  switch(Category){
    case "loeng":
      return "#5089ee";
    case "praktikum":
      return "#a3e8a7";
    case "e-õpe":
      return "#e5e5e5";
    case "praktika":
      return "#4caf50";
    case "kontrolltöö":
      return "#ff5252";
    case "eksam/arvestus":
      return "#ff5252";
    case "korduseksam":
      return "#ff5252";
    case "konsultatsioon":
      return "#ffdd83";
  }
}
module.exports = function(icsData){
  const array = [];
  let currentObj = {};
  let lastKey = "";

  const lines = icsData.split(NEW_LINE);
  let startdate = ""
  let location = ""
  let isAlarm = false;
  let isDesc = false;
  for (let i = 0, iLen = lines.length; i < iLen; ++i) {
    const line = lines[i];
    const lineData = line.split(":");

    let key = lineData[0];
    let s = "";
    if (lineData.length > 2){
      for(let i = 0; lineData.length > i; i++){
        if(i==0){
          continue;
        }
        if(i==1){
          s += lineData[i]
          continue
        }
        s += ":"+lineData[i]
      }
    }
    else{
      s = lineData[1];
    }
    const value = s;
    if (key.indexOf(";") !== -1) {
      const keyParts = key.split(";");
      key = keyParts[0];
      // Maybe do something with that second part later
    }

    if (lineData.length < 2) {
      if (key.startsWith(" ") && lastKey !== undefined && lastKey.length) {
        currentObj[lastKey] += clean(line.substr(1));
      }
      continue;
    } else {
      lastKey = keyMap[key];
    }

    switch (key) {
      case EVENT_START:
        if (value === EVENT) {
          currentObj = {};
          isDesc = false;
          location=""
        } else if (value === ALARM) {
          isAlarm = true;
        }
        break;
      case EVENT_END:
        isAlarm = false;
        if (value === EVENT) array.push(currentObj);
        break;
      case START_DATE:
        startdate = value;
        break;
      case END_DATE:
        currentObj[keyMap[END_DATE]] = value;
        break;
      case DESCRIPTION:
        isDesc = true;
        if (!isAlarm) currentObj[keyMap[DESCRIPTION]] = clean(value) +"\\n\\n"+ location;
        break;
      case SUMMARY:
        currentObj[keyMap[SUMMARY]] = clean(value);
        break;
      case LOCATION:
        location = clean(value);
        break;
      case DURATION:
        currentObj[keyMap[DURATION]] = clean(value).replace(/[PT]/g,'').replace(/H/g,':').replace(/M/g,':').replace(/S/g,':');
        break;
      case CATEGORIES:
        currentObj[keyMap[COLOR]] = color(clean(value))
        break;
      case EXDATE:
        currentObj[keyMap[EXDATE]] = value.split(",")
        break;
      case RRULE:
        currentObj[keyMap[RRULE]] = "DTSTART;TZID=Europe/Tallinn:"+startdate+"Z;\nRRULE:"+clean(value);
        break;
      default:
        continue;
    }
    if(isDesc == false){
      if (!isAlarm) currentObj[keyMap[DESCRIPTION]] = location;
    }
  }
  return array;
};