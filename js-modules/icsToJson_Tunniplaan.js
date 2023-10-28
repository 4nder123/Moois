const LINEFIX = /\r\n|\n|\r|\t/gm
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

const allicsparm = 'BEGIN|METHOD|PROIDID|DTSTAMP|UID|DTSTART|CLASS|CREATED|DESCRIPTION|GEO|LAST-MOD|LOCATION|ORGANIZER|PRIORITY|SEQ|STATUS|SUMMARY|TRANSP|URL|RECURID|RRULE|DTEND|DURATION|ATTACH|ATTENDEE|CATEGORIES|COMMENTCONTACT|EXDATE|RSTATUS|RELATED|RESOURCES|RDATE|X-PROP|IANA-PROP|END'
const wantedicsparm = 'BEGIN|DTSTART|DESCRIPTION|LOCATION|SUMMARY|RRULE|DTEND|DURATION|CATEGORIES|EXDATE|END';

// \\n|\\
const keyMap = {
  [START_DATE]: "start",
  [END_DATE]: "end",
  [DESCRIPTION]: "description",
  [SUMMARY]: "title",
  [RRULE]: "rrule",
  [DURATION]: "duration",
  [COLOR]: "color",
  [EXDATE]: "exdate"
};

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
  
  const lines = icsData.replace(LINEFIX, '').match(new RegExp(`(${wantedicsparm}+:).+?(?=${allicsparm}.+:)`, "gm"));
  let startdate = ""
  let location = ""
  let rrule = ""
  let dec = ""
  for (let i = 0, iLen = lines.length; i < iLen; ++i) {
    const line = lines[i];
    const lineData = line.split(":");
    let key = lineData[0];
    let value = lineData.slice(1).join(":");

    if (key.indexOf(";") !== -1) {
      const keyParts = key.split(";");
      key = keyParts[0];
    }
    
    switch (key) {
      case EVENT_START:
        if (value === EVENT){
          startdate = ""
          location = ""
          rrule = ""
          dec = ""
          currentObj = {}
        };
        break;
      case EVENT_END:
        if (value === EVENT) {
          currentObj[keyMap[DESCRIPTION]] = dec !== "" ? dec + "\n" + location : location;
          currentObj[keyMap[RRULE]] = "DTSTART;TZID=Europe/Tallinn:"+startdate+"Z;\nRRULE:"+rrule;
          array.push(currentObj)
        }
        break;
      case START_DATE:
        startdate = value;
        break;
      case END_DATE:
        currentObj[keyMap[END_DATE]] = value;
        break;
      case DESCRIPTION:
        dec = value.replace(/\b[\\n]{2,}/gm,"\n")
        break;
      case SUMMARY:
        currentObj[keyMap[SUMMARY]] = value;
        break;
      case LOCATION:
        location = value;
        break;
      case DURATION:
        currentObj[keyMap[DURATION]] = value.replace(/[PT]/g,'').replace(/H/g,':').replace(/M/g,':').replace(/S/g,'');
        break;
      case CATEGORIES:
        currentObj[keyMap[COLOR]] = color(value)
        break;
      case EXDATE:
        currentObj[keyMap[EXDATE]] = value.replace(/\s/g,"").split(",")
        break;
      case RRULE:
        rrule = value
        break;
      default:
        continue;
    }
  }
  return array;
};