import { Calendar } from 'https://cdn.skypack.dev/@fullcalendar/core';
import etLocale from 'https://cdn.skypack.dev/@fullcalendar/core/locales/et';
import timeGridPlugin from 'https://cdn.skypack.dev/@fullcalendar/timegrid';
import iCalendarPlugin from 'https://cdn.skypack.dev/@fullcalendar/icalendar';

function loadTunniplaan(ois){
    const calendarEl = document.getElementById('tunniplaan');
    const calendar = new Calendar(calendarEl, {
        plugins: [iCalendarPlugin, timeGridPlugin],
        customButtons: {
            kodutood: {
                text: 'Kodutööd',
                click: function() {
                    window.name = 'kodutoo'
                    document.getElementById('tunniplaan').style.display='none';
                    document.getElementById('kodutoo').style.display='block';
                }
            },
            settings: {
                click: function() {
                    document.getElementById('my-modal').style.display='block';
                    if(localStorage.getItem("dark_mode") === "true"){
                        document.getElementById('switch').checked = true;
                    }
                }
            }
        },
        hiddenDays: [0, 6],
        locale: etLocale,
        timeZone: 'Europe/Tallinn',
        initialView: 'timeGridWeek',
        nowIndicator: true,
        slotMinTime: '08:00',
        slotMaxTime: '21:00',
        contentHeight: 'auto',
        slotEventOverlap: false,
        allDaySlot: false,
        firstDay: -1,
        events: {
            url: '/getevents?calurl='+ois,
            format: 'ics',
        },
        eventSourceSuccess: function(content, response) {
            let allday = false;
            for (let i = 0; i< content.length; i++) {
                if(content[i].start.split("T").pop() === "00:00:00"){
                    content[i]["allDay"] = true;
                    calendar.setOption("allDaySlot", true);
                    allday = true;
                }
            }
            if(!allday) {calendar.setOption("allDaySlot", false);}
        },
        eventDidMount: function(info) {
            info.el.closest('div').style.zIndex = 1;
            if(info.event.extendedProps.organizer){
                info.event.setProp("color", info.event.extendedProps.organizer);
            }
            if(info.event.extendedProps.description || info.event.extendedProps.location){
                const description = (info.event.extendedProps.description ? info.event.extendedProps.description.trim() + "<br>" : "") 
                + (info.event.extendedProps.location ? info.event.extendedProps.location.trim() : "");
                var tooltip = new bootstrap.Tooltip(info.el, {
                    title: description.replace(new RegExp(`(\\n)+`, 'gm'), "<br>"),
                    placement: 'top',
                    trigger: 'manual',
                    html: true,
                    container: 'body'
                });
                let visable = false;
                document.addEventListener("click", function(e){
                    if(info.el.contains(e.target) && !visable){
                        tooltip.show();
                        visable = true;
                    } else if(visable){
                        tooltip.hide();
                        visable = false;
                    }
                });
                window.addEventListener("resize", function(){
                    if(visable){
                        tooltip.hide();
                        visable = false;
                    } 
                });
            }
        },
        lazyFetching: true,
        progressiveEventRendering: true,
        defaultAllDayEventDuration:{ days: 5 },
        eventTextColor: 'black',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridWeek,timeGridDay kodutood settings'
        }
    })
    calendar.render();
    document.getElementById('tunniplaan').getElementsByClassName("fc-settings-button")[0].innerHTML = '<i class="fa fa-gear"></i>';
    return calendar;
}

export default loadTunniplaan;