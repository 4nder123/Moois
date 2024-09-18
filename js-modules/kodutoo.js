import { Calendar } from 'https://cdn.skypack.dev/@fullcalendar/core';
import listPlugin from 'https://cdn.skypack.dev/@fullcalendar/list';
import etLocale from 'https://cdn.skypack.dev/@fullcalendar/core/locales/et';
import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";



const save = "ev-save"
const rm = "ev-remove"
const high_save = "high-save"
const high_rm = "high-remove"
let color = localStorage.getItem('high') || "rgb(255, 255, 0, 0.25)";
const highlightButton = "<div id='highlight' style='display:table-cell;text-align:right;vertical-align:middle;height:100%;padding-left:10px;' data-long-press-delay='500'><i id='highlight' class='fa-solid fa-highlighter fa-lg'></i></div>"
const socket = io.connect('http://localhost:3000',{
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    forceNew: true,
    secure: true 
});
socket.on("connect", () => {
    socket.emit('liveUpdate');
});

function changeHighColor(new_color){
    localStorage.setItem("high", new_color);
    color = new_color;
}

function setExProps(event, status, color){
    event.setExtendedProp("status", status);
    event.setExtendedProp("color", color);
    highlightEvent(event.id, color)
}

function savetodb(evdone, action){
    try {
        fetch("/savedone", {method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({"info":evdone, "action": action})
        })
    } catch (err){
        console.log(err);
    }
}

function highlightEvent(event_id, color){
    const eventRow = document.querySelector("[id='"+event_id+"']").closest('tr');
    eventRow.style.backgroundColor = color;
}


function loadKodutoo(moodle) {
    const calendarEl = document.getElementById('kodutoo');
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
            url: '/getevents?' + new URLSearchParams({calurl:moodle})
        },
        eventDidMount: function(info) {
            const event = info.event;  
            const eventId = info.event.id;
            let tooltip = null;
            let longpress = false;
            
            const handleClick = function (e) {
              const targetId = e.target.id;
              const isDone = event.extendedProps.status === "done"
              const isHigh = event.extendedProps.status === "high"
              if (info.el.contains(e.target)) {
                if (!isDone && targetId !== 'highlight') {
                  savetodb(eventId, save);
                  setExProps(event, "done", "") 
                } else if (isDone && targetId !== 'highlight') {
                  savetodb(eventId, rm);
                  setExProps(event, "", "") 
                } else if (!isHigh && targetId === 'highlight' && !longpress) {
                  savetodb([eventId, color], high_save);
                  setExProps(event, "high", color)
                } else if (isHigh && targetId === 'highlight' && !longpress) {
                  savetodb(eventId, high_rm);
                  setExProps(event, "", "") 
                }
              }
            };

            const handleLongClick = function (e) {
                if(e.target.id === 'highlight' && tooltip === null){
                    longpress = true;
                    tooltip = new bootstrap.Tooltip(e.target, {
                        title: "<div class='box red'></div><div class='box orange'></div><div class='box yellow'></div>",
                        placement: 'top',
                        trigger: 'manual',
                        html: true,
                        container: 'body'
                    });
                    tooltip.show()
                    document.querySelector('.red').addEventListener("mousedown", function (e){
                        changeHighColor('rgb(255, 0, 0, 0.25)')
                        savetodb([eventId, color], high_save);
                        setExProps(event, "high", color) ;
                    })
                    document.querySelector('.orange').addEventListener("mousedown", function (e){
                        changeHighColor('rgb(255, 165, 0, 0.3)');
                        savetodb([eventId, color], high_save);
                        setExProps(event, "high", color);
                    })
                    document.querySelector('.yellow').addEventListener("mousedown", function (e){
                        changeHighColor('rgb(255, 255, 0, 0.25)');
                        savetodb([eventId, color], high_save);
                        setExProps(event, "high", color);
                    })
                    document.addEventListener("mousedown", function () {
                        if(tooltip !== null){
                            tooltip.dispose()
                            tooltip = null
                        }
                        longpress = false;
                    });
                }
            }
            highlightEvent(eventId, event.extendedProps.color);
            info.el.addEventListener("click", handleClick);
            info.el.addEventListener('long-press', handleLongClick);
        },
        eventContent: function(info) {
            let eventTitleElement = document.createElement('div');
            const eventTitle = info.event.title;
            eventTitleElement.setAttribute("id", info.event.id);
            eventTitleElement.style.display =  "table";
            eventTitleElement.style.width = "100%";
            if (info.event.extendedProps.status === "done") {
                eventTitleElement.innerHTML = `<a><s>${eventTitle}</s></a>`;
            } else {
                eventTitleElement.innerHTML = `<a>${eventTitle}</a>${highlightButton}`;
            }
            let arrayOfDomNodes = [ eventTitleElement ];
            return { domNodes: arrayOfDomNodes };
        },
        loading: function(isLoading){
            if(!isLoading){
                document.querySelector(".loader").classList.add("loader--hidden")
            }
        },
        lazyFetching: true,
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
    socket.on('updateUserData', (id, action) => {
        const eventId = calendar.getEventById(typeof id === 'string'? id : id[0]);
        if(eventId){
            if (action === save) {
                setExProps(eventId, "done", "")
            } else if (action === high_save){
                setExProps(eventId, "high", id[1])          
            } else {
                setExProps(eventId, "", "")
            }
        } else {
            calendar.refetchEvents();
        }
    });
    return calendar
}

export default loadKodutoo;