const axios = require('axios')

const LINEFIX = /\\n|\\|\t|\r\n|\n|\r/gm

const EVENT = "VEVENT";
const EVENT_START = "BEGIN";
const EVENT_END = "END";
const START_DATE = "DTSTART";
const END_DATE = "DTEND";
const SUMMARY = "SUMMARY";
const CATEGORIES = "CATEGORIES";
const allicsparm = 'BEGIN|METHOD|PROIDID|DTSTAMP|UID|DTSTART|CLASS|CREATED|DESCRIPTION|GEO|LAST-MOD|LOCATION|ORGANIZER|PRIORITY|SEQ|STATUS|SUMMARY|TRANSP|URL|RECURID|RRULE|DTEND|DURATION|ATTACH|ATTENDEE|CATEGORIES|COMMENTCONTACT|EXDATE|RSTATUS|RELATED|RESOURCES|RDATE|X-PROP|IANA-PROP|END'
const wantedicsparm = 'BEGIN|DTSTART|SUMMARY|DTEND|CATEGORIES|END';

const keyMap = {
  [START_DATE]: "start",
  [END_DATE]: "end",
  [SUMMARY]: "title",
};

let ainekoodid = {}

const aine = async (ainekood) => {
    if(ainekood in ainekoodid){
      return ainekoodid[ainekood];
    }
    else{
      try{
        let ainekoodmatch = ainekood.match(/^[A-Z, 0-9]+[.][0-9]+[.][0-9]+/)
        if(ainekoodmatch !== null){
          const aine = await axios.get("https://ois2.ut.ee/api/courses/"+ ainekoodmatch.toString())
          const ainejson = aine.data
          ainekoodid[ainekood] = ainejson["title"]["et"]
          return ainejson["title"]["et"]
        }
        else{
          return ainekood
        }
      }
      catch{
        return ainekood
      }
    }
}

module.exports = async(icsData) => {
  const array = [];
  let currentObj = {};

  const lines = icsData.replace(LINEFIX, '').match(new RegExp(`(${wantedicsparm}+:).+?(?=${allicsparm}.+:)`, "gm"));
  let ainenim = "";
  let title = "";

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
        if (value === EVENT) currentObj = {};
        break;
      case EVENT_END:
        if(ainenim != ""){
          currentObj[keyMap[SUMMARY]] = ainenim + " - " + title;
        }
        else{
          currentObj[keyMap[SUMMARY]] = title;
        }
        ainenim = "";
        title = "";
        if (value === EVENT) array.push(currentObj);
        break;
      case START_DATE:
        currentObj[keyMap[START_DATE]] = value;
        break;
      case END_DATE:
        currentObj[keyMap[END_DATE]] = value;
        break;
      case SUMMARY:
        title = value;
        break;
      case CATEGORIES:
        ainenim = await aine(value);
        break;
      default:
        continue;
    }
  }
  return array;
};