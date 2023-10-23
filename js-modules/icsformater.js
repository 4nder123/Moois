function isUpperCase(str) {
    return str === str.toUpperCase() &&
           str !== str.toLowerCase();
}

module.exports = function(ics){
    let lines = ics.replace(/\t/g,"").split(/\r\n|\n|\r/).filter(elm => {
        return elm!="";
    });;
    let output = "";
    for(let i=0; i<lines.length; i++){
        let line = lines[i].split(":");
        if (isUpperCase(line[0]) && !/[0-9]/.test(line[0])){
            for(let j=0; j<line.length; j++){
                if (j==0){
                    output += "\n" + line[j] + ":";
                }
                else if(line.length > 2){
                    output += line[j] + ":";
                }
                else{
                    output += line[j] 
                }
            }
        }
        else{
            for(let j=0; j<line.length; j++){
                if(line[j].includes("DTSTART")|line[j].includes("DTSTAMP")){
                    output += "\n" + line[j]
                }
                else if(line.length > 1){
                    output += ":" + line[j];
                }
                else{
                    output += line[j] 
                }
            }
        }
    }
    return output
}