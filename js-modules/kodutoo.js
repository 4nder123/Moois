import { Calendar } from 'https://cdn.skypack.dev/@fullcalendar/core';
import listPlugin from 'https://cdn.skypack.dev/@fullcalendar/list';
import etLocale from 'https://cdn.skypack.dev/@fullcalendar/core/locales/et';
import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";



const save = "ev-save"
const rm = "ev-remove"
const high_save = "high-save"
const high_rm = "high-remove"
const event_remove = "event-remove"
const event_add = "event-add"
let color = localStorage.getItem('high') || "rgb(255, 255, 0, 0.25)";
const highlightButton = "<div id='highlight' class='event_button' data-long-press-delay='500'><i id='highlight' class='fa-solid fa-highlighter fa-lg'></i></div>"
const deleteButton = "<div id='delete' class='event_button'><i id='delete' style='color:red;' class='fa fa-trash'></i></div>"
let deleteSelected = false;

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

function userEventDelete(event, eventTitleElement){
    if (event.extendedProps.status === "done") {
        eventTitleElement.innerHTML = `<div class='event_title'><s>${event.title}</s></div>${deleteButton}`;
    } else {
        eventTitleElement.innerHTML = `<div class='event_title'>${event.title}</div>${deleteButton}`;
    }
}

function setupEvent(event, eventTitleElement){
    if (event.extendedProps.status === "done") {
        eventTitleElement.innerHTML = `<div class='event_title'><s>${event.title}</s></div>`;
    } else {
        eventTitleElement.innerHTML = `<div class='event_title'>${event.title}</div>${highlightButton}`;
    }
}

function loadKodutoo(moodle) {
    const calendarEl = document.getElementById('kodutoo');
    const calendar = new Calendar(calendarEl, {
        plugins: [ listPlugin ],
        customButtons: {
            trash: {
                click: function() {
                    if(!deleteSelected) {
                        document.getElementById('kodutoo').getElementsByClassName("fc-trash-button")[0].innerHTML = '<i class="fa fa-check"></i>';
                        deleteSelected = true;
                    } else {
                        document.getElementById('kodutoo').getElementsByClassName("fc-trash-button")[0].innerHTML = '<i class="fa fa-trash"></i>';
                        deleteSelected = false;
                    }
                }
            },
            add_event: {
                click: function() {
                    document.getElementById('add').style.display='block';
                }
            },
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
                    document.getElementById('settings').style.display='block';
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
            if(event.extendedProps.userAdded){
                document.getElementById('kodutoo').getElementsByClassName("fc-trash-button")[0].addEventListener('click', (e)=>{
                    if(deleteSelected){
                        userEventDelete(event, info.el.getElementsByClassName('event')[0])
                    } else {
                        setupEvent(event, info.el.getElementsByClassName('event')[0])
                    }
                });
            }
            const handleClick = function (e) {
              const targetId = e.target.id;
              const isDone = event.extendedProps.status === "done"
              const isHigh = event.extendedProps.status === "high"
              if (info.el.contains(e.target)) {
                if (!isDone && targetId !== 'highlight' && targetId !== "delete") {
                  savetodb(eventId, save);
                  setExProps(event, "done", "" && targetId !== "delete") 
                } else if (isDone && targetId !== 'highlight') {
                  savetodb(eventId, rm);
                  setExProps(event, "", "") 
                } else if (!isHigh && targetId === 'highlight' && !longpress) {
                  savetodb([eventId, color], high_save);
                  setExProps(event, "high", color)
                } else if (isHigh && targetId === 'highlight' && !longpress) {
                  savetodb(eventId, high_rm);
                  setExProps(event, "", "") 
                } else if (targetId === "delete" && deleteSelected){
                    if(confirm("Kas olete kindel, et soovite kustutada kodutöö: " + event.title + "?")){
                        savetodb(eventId, event_remove);
                        event.remove();
                    }
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
            eventTitleElement.setAttribute("class", "event");
            if(info.event.extendedProps.userAdded && deleteSelected){
                userEventDelete(info.event, eventTitleElement);
            } else {
                setupEvent(info.event, eventTitleElement);
            }
            let arrayOfDomNodes = [ eventTitleElement ];
            return { domNodes: arrayOfDomNodes };
        },
        loading: function(isLoading){
            if(!isLoading){
                document.querySelector(".loader").classList.add("loader--hidden")
            }
        },
        eventsSet: function(info) {
            if(info.length === 0) return;
            const trash_button = document.getElementById('kodutoo').getElementsByClassName("fc-trash-button")[0]
            const isUserEvents = info.filter((event) => {
                if(event.extendedProps.userAdded){
                    return true;
                }
            });
            if(isUserEvents.length > 0 && trash_button.style.display === 'none'){
                trash_button.style.display = '';
            } else if(isUserEvents.length <= 0 && trash_button.style.display !== 'none'){
                deleteSelected = false;
                trash_button.innerHTML = '<i class="fa fa-trash"></i>';
                trash_button.style.display = 'none';
            }
        },
        lazyFetching: true,
        progressiveEventRendering: true,
        contentHeight: "auto",
        initialView: 'listYear',
        headerToolbar: {
            left: 'prev,next',
            center: '',
            right: 'add_event trash tunniplaan settings'
        }
    });
    calendar.render()
    document.getElementById('kodutoo').querySelector(".fc-header-toolbar").classList.add("kodutooheader");
    document.getElementById('kodutoo').getElementsByClassName("fc-view-harness")[0].style = "top: 55px;" ;
    document.getElementById('kodutoo').getElementsByClassName("fc-trash-button")[0].innerHTML = '<i class="fa fa-trash"></i>';
    document.getElementById('kodutoo').getElementsByClassName("fc-add_event-button")[0].innerHTML = '<i class="fa fa-plus"></i>';
    document.getElementById('kodutoo').getElementsByClassName("fc-settings-button")[0].innerHTML = '<i class="fa fa-gear"></i>';
    socket.on('updateUserData', (info, action) => {
        if(action !== event_add){
            const event = calendar.getEventById(typeof info === 'string'? info : info[0]);
            if(event){
                if (action === save) {
                    setExProps(event, "done", "");
                } else if (action === high_save){
                    setExProps(event, "high", info[1]);   
                }else if (action === event_remove) {
                    event.remove();      
                } else {
                    setExProps(event, "", "");
                } 
            } else if(action !== event_remove){
                calendar.refetchEvents();
            }
        } else if(!calendar.getEventById(info.id)){
             calendar.addEvent(info, true);
        }
    });
    return calendar
}

export { loadKodutoo, savetodb };