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
    case "seminar":
      return "#ffab88"
    case "kollokvium":
      return "#ff5252";
    default:
      return "#5089ee";
  }
}
module.exports = function(icsData){  
  const lines = icsData.split("\r\n")
  const newlines = []
  for (let i = 0; i < lines.length; ++i) {
    if(lines[i].includes('CATEGORIES')){
      newlines.push(lines[i])
      newlines.push("ORGANIZER:"+color(lines[i].split(":")[1]))
      continue
    }
    if(lines[i].includes('ORGANIZER')){
      continue;
    }
    newlines.push(lines[i])
  }
  return newlines.join('\n');
};