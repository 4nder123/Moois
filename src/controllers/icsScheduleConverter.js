const ical = require("node-ical");
const moment = require('moment');

const getColor = function(Category){
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

const convertDuration = (duration) => {
  const match = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(duration);
  const h = match[1] || 0, m = match[2] || 0, s = match[3] || 0;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

module.exports = function(icsData) {
  const icsObject = ical.parseICS(icsData);
  const events = Object.values(icsObject)
    .filter(event => event.type === "VEVENT")
    .map(event => {
      const start = moment(event.start);
      const end = moment(event.end);
      const duration = event.duration ? convertDuration(event.duration) : null;
      const isAllDay = start.format('HH:mm') <= "08:00";
      
      const exdates = event.exdate ? Object.values(event.exdate).map(exdate => moment(exdate).format('YYYY-MM-DDTHH:mm:ss')) : [];

      return {
        title: event.summary || "",
        start: start.format(),
        end: end.format(),
        rrule: event.rrule?.options || null,
        exdate: exdates,
        duration: isAllDay ? "" : duration,
        allDay: isAllDay,
        color: event.categories ? getColor(event.categories[0]) : "",
        extendedProps: {
          description: [event.description?.trim(), event.location?.trim()]
            .filter(Boolean)
            .join("<br>")
            .replace(/(\n)+/gm, "<br>"),
        },
      };
    });
  return events;
};