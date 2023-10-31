import { Calendar } from 'https://cdn.skypack.dev/@fullcalendar/core';
import etLocale from 'https://cdn.skypack.dev/@fullcalendar/core/locales/et';
import timeGridPlugin from 'https://cdn.skypack.dev/@fullcalendar/timegrid';
import rrulePlugin from 'https://cdn.skypack.dev/@fullcalendar/rrule';

function loadTunniplaan(ois){
    const calendarEl = document.getElementById('tunniplaan')
    const calendar = new Calendar(calendarEl, {
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
        locale: etLocale,
        timeZone: 'Europe/Tallinn',
        plugins: [rrulePlugin, timeGridPlugin],
        initialView: 'timeGridWeek',
        nowIndicator: true,
        weekends: false,
        slotMinTime: '08:00',
        slotMaxTime: '21:00',
        contentHeight: 'auto',
        slotEventOverlap: false,
        allDaySlot: false,
        firstDay: -1,
        eventDidMount: function(info) {
            if(typeof(info.event.extendedProps.description) != "undefined"){
                var tooltip = new bootstrap.Tooltip(info.el, {
                    title: info.event.extendedProps.description.replace(new RegExp(`(\\n)+`, 'gm'), "<br>").replace(/\\n/gm,''),
                    placement: 'top',
                    trigger: 'manual',
                    html: true,
                    container: 'body'
                });

                let visable = false;
                document.addEventListener("click", function(e){
                    if(info.el.contains(e.target) && !visable){
                        tooltip.show()
                        visable = true
                    }
                    else if(visable){
                        tooltip.hide()
                        visable = false
                    }
                })
                window.addEventListener("resize", function(){
                    if(visable){
                        tooltip.hide()
                        visable = false
                    } 
                })
            }
        },
        lazyFetching: true,
        progressiveEventRendering: true,
        events: {
            url: '/getevents',
            method: 'POST',
            extraParams: {
                calurl: ois,
            }
        },
        eventTextColor: 'black',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridWeek,timeGridDay kodutood settings'
        }
    })
    calendar.render()
    document.getElementById('tunniplaan').getElementsByClassName("fc-settings-button")[0].innerHTML = '<i class="fa fa-gear"></i>';
    return calendar;
}

export default loadTunniplaan;