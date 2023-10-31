import { Calendar } from 'https://cdn.skypack.dev/@fullcalendar/core';
import listPlugin from 'https://cdn.skypack.dev/@fullcalendar/list';
import etLocale from 'https://cdn.skypack.dev/@fullcalendar/core/locales/et';

function savetodb(evdone){
    fetch("/savedone", {method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(evdone)
    })
}
function loadKodutoo(moodle, evstatus) {
    const calendarEl = document.getElementById('kodutoo');
    evstatus = evstatus || []
    localStorage.setItem("evstatus", evstatus)
    const calendar = new Calendar(calendarEl, {
        plugins: [ listPlugin ],
        customButtons: {
            tunniplaan: {
                text: 'Tunniplaan',
                click: function() {
                    window.name = 'tunniplaan'
                    document.getElementById('tunniplaan').style.display='block';
                    document.getElementById('kodutoo').style.display='none';
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
        defaultTimedEventDuration: 0,
        events: {
            url: '/getevents',
            method: 'POST',
            extraParams: {
                calurl: moodle
            }
        },
        eventDidMount: function(info) {
            let done = evstatus.includes(info.event.title);
            const eventTitleElement = info.el.getElementsByClassName("fc-list-event-title")[0];
            if (done) {
                eventTitleElement.innerHTML = "<a><s>" + info.event.title + "</s></a>";
            }
            info.el.addEventListener("click", function (e) {
                if (info.el.contains(e.target) && !done) {
                    evstatus.push(info.event.title);
                    localStorage.setItem("evstatus", evstatus);
                    savetodb(evstatus);
                    eventTitleElement.innerHTML = "<a><s>" + info.event.title + "</s></a>";
                    done = true;
                } 
                else if (info.el.contains(e.target) && done) {
                    evstatus = evstatus.filter(item => item !== info.event.title);
                    localStorage.setItem("evstatus", evstatus);
                    savetodb(evstatus);
                    eventTitleElement.innerHTML = "<a>" + info.event.title + "</a>";
                    done = false;
                }
            });   
        },
        eventSourceSuccess: function(content) {
            if(content.length !== 0){
                let evstatusclean = evstatus
                for(let i = 0; i < evstatus.length; i++){
                    if(!content.find(evdone => evdone.title === evstatus[i])){
                        evstatusclean = evstatusclean.filter(item => item !== evstatus[i]);
                    }
                }
                evstatus = evstatusclean;
                localStorage.setItem("evstatus", evstatus)
                savetodb(evstatus)
            }
        },
        loading: function(isLoading){
            if(!isLoading){
                document.querySelector(".loader").classList.add("loader--hidden")
            }
        },
        progressiveEventRendering: true,
        contentHeight: "auto",
        initialView: 'listYear',
        headerToolbar: {
            left: 'prev,next',
            center: '',
            right: 'tunniplaan settings'
        }
    });
    calendar.render()
    document.getElementById('kodutoo').querySelector(".fc-header-toolbar").classList.add("kodutooheader");
    document.getElementById('kodutoo').getElementsByClassName("fc-view-harness")[0].style = "top: 55px;" ;
    document.getElementById('kodutoo').getElementsByClassName("fc-settings-button")[0].innerHTML = '<i class="fa fa-gear"></i>';

    return calendar
}

export default loadKodutoo;