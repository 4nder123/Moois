const axios = require('axios')
const fs = require('fs')
const path = require('path');
const ical = require("node-ical");

const exprops = "extendedProps";

const ainekoodid = {}

const getdone = function(id){
    if (fs.existsSync(path.join(__dirname, '../database/user-saved-info/'+id+'.json'))) {
        return fs.readFileSync(path.join(__dirname, '../database/user-saved-info/'+id+'.json')).toString()
    }
    else{
        return '{"done": [], "highlight":[]}'
    }
}

const evjson = function(ev){
  for(var key in ev){
    for(var key2 in ev){
        if(key!=key2){
            if(ev[key].title.replace(/\w+[.!?]?$/, '')==ev[key2].title.replace(/\w+[.!?]?$/, '') && ev[key].start.slice(0,-13) == ev[key2].start.slice(0,-13)){
                ev[key2].title = ev[key2].title.replace(/\w+[.!?]?$/, '')
                ev[key2].start = ev[key].start
                ev.splice(key, 1)
            }
        }
    }
  }
  return ev
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
  const icsObject = ical.parseICS(icsData);
  // Get the done and highlight info from the file
  const info = JSON.parse(getdone(id));
  const done = info.done;
  const highlight = info.highlight;

  // Initialize arrays
  const events = [];
  const isdone = [];
  const ishigh = [];
  // Iterate over the values of the icsObject and extract the events
  for (const event of Object.values(icsObject)) {
    
    if (event.type === "VEVENT") {
      // Create a new event object with the desired properties
      const newEvent = {
        id: event.uid,
        start: event.start.toISOString(),
        end: event.end.toISOString(),
        title: event.summary,
        [exprops]: { status: "", color: "" },
      };

      // Get the course name from the categories property if it exists
      if(event.categories){
        const courseName = await aine(event.categories.toString());
        newEvent.title = courseName + " - " + newEvent.title;
      }
      // Check if the event is done or highlighted and update the status and color accordingly
      // Push the new event to the events array
      events.push(newEvent);
    }
  }
  const cleanarray = evjson(events)
  for(let i = 0; i < cleanarray.length; i++){
    if (done.includes(cleanarray[i].id)) {
      isdone.push(cleanarray[i].id);
      cleanarray[i].extendedProps.status = "done";
    } else {
      const foundhighlight = highlight.find((high) => high[0] === cleanarray[i].id);
      if (foundhighlight) {
        ishigh.push(foundhighlight);
        cleanarray[i].extendedProps.status = "high";
        cleanarray[i].extendedProps.color = foundhighlight[1];
      }
    }
  }
  
  if(fs.existsSync(path.join(__dirname, '../database/user-saved-info/'+id+'.json'))){
    fs.writeFileSync(path.join(__dirname, '../database/user-saved-info/'+id+'.json'),JSON.stringify({"done":isdone, "highlight":ishigh}))
  }
  return cleanarray;
};
