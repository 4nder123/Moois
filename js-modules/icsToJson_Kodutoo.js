const axios = require('axios')
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
const CATEGORIES = "CATEGORIES";

const keyMap = {
  [START_DATE]: "start",
  [END_DATE]: "end",
  [DESCRIPTION]: "description",
  [SUMMARY]: "title",
  [LOCATION]: "location",
};
let ainekoodid = {"ERROR":"ERROR"}
const clean = string => unescape(string).trim();

const aine = async (ainekood) => {
    if(ainekood in ainekoodid){
      return ainekoodid[ainekood];
    }
    else{
      const aine = await axios.get("https://ois2.ut.ee/api/courses/"+ ainekood)
      const ainejson = aine.data
      ainekoodid[ainekood] = ainejson["title"]["et"]
      return ainejson["title"]["et"]
    }
}

module.exports = async icsData => {
  const array = [];
  let currentObj = {};
  let lastKey = "";

  const lines = icsData.split(NEW_LINE);
  let ainenim = "";
  let title = "";
  let isAlarm = false;
  
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
        } else if (value === ALARM) {
          isAlarm = true;
        }
        break;
      case EVENT_END:
        currentObj[keyMap[SUMMARY]] = ainenim + " - " + title;
        isAlarm = false;
        if (value === EVENT) array.push(currentObj);
        break;
      case START_DATE:
        currentObj[keyMap[START_DATE]] = value;
        break;
      case END_DATE:
        currentObj[keyMap[END_DATE]] = value;
        break;
      case DESCRIPTION:
        if (!isAlarm) currentObj[keyMap[DESCRIPTION]] = clean(value);
        break;
      case SUMMARY:
        title = value;
        break;
      case LOCATION:
        currentObj[keyMap[LOCATION]] = clean(value);
        break;
      case CATEGORIES:
          ainenim = await aine(value);
      default:
        continue;
    }
  }
  return array;
};