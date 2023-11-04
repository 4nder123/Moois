const axios = require('axios')
const fs = require('fs')
const path = require('path');

const LINEFIX = /\\n|\\|\t|\r\n|\n|\r/gm

const EVENT = "VEVENT";
const EVENT_START = "BEGIN";
const EVENT_END = "END";
const START_DATE = "DTSTART";
const END_DATE = "DTEND";
const SUMMARY = "SUMMARY";
const CATEGORIES = "CATEGORIES";
const exprops = "extendedProps";
const allicsparm = 'BEGIN|METHOD|PROIDID|DTSTAMP|UID|DTSTART|CLASS|CREATED|DESCRIPTION|GEO|LAST-MOD|LOCATION|ORGANIZER|PRIORITY|SEQ|STATUS|SUMMARY|TRANSP|URL|RECURID|RRULE|DTEND|DURATION|ATTACH|ATTENDEE|CATEGORIES|COMMENTCONTACT|EXDATE|RSTATUS|RELATED|RESOURCES|RDATE|X-PROP|IANA-PROP|END'
const wantedicsparm = 'BEGIN|DTSTART|SUMMARY|DTEND|CATEGORIES|END';

const keyMap = {
  [START_DATE]: "start",
  [END_DATE]: "end",
  [SUMMARY]: "title",
};

let ainekoodid = {}

const getdone = function(id){
    if (fs.existsSync(path.join(__dirname, '../database/user-saved-info/'+id+'.json'))) {
        return fs.readFileSync(path.join(__dirname, '../database/user-saved-info/'+id+'.json')).toString()
    }
    else{
        return '{"done": [], "highlight":[]}'
    }
}

const evjson = function(events){
  return events.filter((event, index) => {
    for (let i = 0; i < index; i++) {
      if (
        event.title.replace(/\w+[.!?]?$/, '') === events[i].title.replace(/\w+[.!?]?$/, '') &&
        event.start.slice(0, -7) === events[i].start.slice(0, -7)
      ) {
        return false;
      }
    }
    return true;
  });
}

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

module.exports = async(icsData, id) => {
  const array = [];
  let currentObj = {};
  const info = JSON.parse(getdone(id));
  const done = info.done
  const highlight = info.highlight
  const isdone = [];
  const ishigh = [];
  const lines = icsData.replace(LINEFIX, '').match(new RegExp(`(${wantedicsparm}+:).+?(?=${allicsparm}.+:)`, "gm"));
  lines.push("END:VEVENT");
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
        currentObj[exprops] = {"status": "", "color": ""}
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
  const cleanarray = evjson(array)
  let foundhighlight = ""
  for(let i = 0; i < cleanarray.length; i++){
    if(done.includes(cleanarray[i].title)){
      isdone.push(cleanarray[i].title)
      cleanarray[i].extendedProps.status = 'done'
    } 
    else{
      foundhighlight = highlight.find(high => high[0] === cleanarray[i].title)
      if(foundhighlight){
        ishigh.push(foundhighlight)
        cleanarray[i].extendedProps.status = 'high'
        cleanarray[i].extendedProps.color =  foundhighlight[1]
      }
    }
  }
  
  if(fs.existsSync(path.join(__dirname, '../database/user-saved-info/'+id+'.json'))){
    fs.writeFileSync(path.join(__dirname, '../database/user-saved-info/'+id+'.json'),JSON.stringify({"done":isdone, "highlight":ishigh}))
  }
  return cleanarray;
};