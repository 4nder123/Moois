import { Calendar } from 'https://cdn.skypack.dev/@fullcalendar/core';
import listPlugin from 'https://cdn.skypack.dev/@fullcalendar/list';
import etLocale from 'https://cdn.skypack.dev/@fullcalendar/core/locales/et';

const save = "ev-save"
const rm = "ev-remove"
const high_save = "high-save"
const high_rm = "high-remove"
let color = localStorage.getItem('high') || "rgb(255, 255, 0, 0.25)";
const highlightButton = "<div class='high' style='float:right;' data-long-press-delay='500'><i id='highlight' class='fa-solid fa-highlighter fa-lg'></i></div>"

function changeColor(){
    console.log('change')
}

function savetodb(evdone, action){
    fetch("/savedone", {method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"info":evdone, "action": action})
    })
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
            url: '/getevents',
            method: 'POST',
            extraParams: {
                calurl: moodle
            }
        },
        eventDidMount: function(info) {
            let done = info.event.extendedProps.status === "done";
            let isHighlighted = info.event.extendedProps.status === "high";
            let highcolor = info.event.extendedProps.color
            let longpress = false;
            let tooltip = null;
          
            const eventTitleElement = info.el.querySelector(".fc-list-event-title");
            const eventTitle = info.event.title;
            
            const handleClick = function (e) {
              const targetId = e.target.id;
              if (info.el.contains(e.target)) {
                if (!done && targetId !== 'highlight') {
                  savetodb(eventTitle, save);
                  savetodb(eventTitle, high_rm);
                  isHighlighted = false;
                  info.el.style.backgroundColor = "";
                  eventTitleElement.innerHTML = `<a><s>${eventTitle}</s></a>`;
                  done = true;
                } else if (done && targetId !== 'highlight') {
                  savetodb(eventTitle, rm);
                  eventTitleElement.innerHTML = `<a>${eventTitle}</a>${highlightButton}`;
                  done = false;
                } else if (!isHighlighted && targetId === 'highlight' && !longpress) {
                  savetodb([eventTitle, color], high_save);
                  isHighlighted = true;
                  info.el.style.backgroundColor = color;
                } else if (isHighlighted && targetId === 'highlight' && !longpress) {
                  savetodb(eventTitle, high_rm);
                  isHighlighted = false;
                  info.el.style.backgroundColor = "";
                }
              }
            };

            const handleLongClick = function (e) {
                if(e.target.id === 'highlight'){
                    longpress = true;
                    tooltip = new bootstrap.Tooltip(e.target, {
                        title: "<div class='box red'></div><div class='box orange'></div><div class='box yellow'></div>",
                        placement: 'top',
                        trigger: 'manual',
                        html: true,
                        container: 'body'
                    });
                    tooltip.show()
                    document.querySelector('.red').addEventListener("click", function (e){
                        localStorage.setItem('high','rgb(255, 0, 0, 0.25)');
                        color = 'rgb(255, 0, 0, 0.25)';
                        savetodb([eventTitle, color], high_save);
                        info.el.style.backgroundColor = color;
                    })
                    document.querySelector('.orange').addEventListener("click", function (e){
                        localStorage.setItem('high','rgb(255, 165, 0, 0.3)');
                        color = 'rgb(255, 165, 0, 0.25)';
                        savetodb([eventTitle, color], high_save);
                        info.el.style.backgroundColor = color;
                    })
                    document.querySelector('.yellow').addEventListener("click", function (e){
                        localStorage.setItem('high','rgb(255, 255, 0, 0.25)');
                        color = 'rgb(255, 255, 0, 0.25)';
                        savetodb([eventTitle, color], high_save);
                        info.el.style.backgroundColor = color;
                    })
                }
            }

            const disposeTooltip = function (e) {
                if(!longpress && tooltip !== null){
                    tooltip.dispose()
                    tooltip = null
                }
                longpress = false;
            }

            if (done) {
                eventTitleElement.innerHTML = `<a><s>${eventTitle}</s></a>`;
            } else if (isHighlighted) {
                info.el.style.backgroundColor = highcolor;
                eventTitleElement.innerHTML = `<a>${eventTitle}</a>${highlightButton}`;
            } else {
                eventTitleElement.innerHTML = `<a>${eventTitle}</a>${highlightButton}`;
            }
          
            info.el.addEventListener("click", handleClick);
            info.el.addEventListener('long-press', handleLongClick);
            document.addEventListener("click", disposeTooltip)
          
            return function() {
              info.el.removeEventListener("click", handleClick);
              info.el.removeEventListener('long-press', handleLongClick);
              document.removeEventListener("click", disposeTooltip)
            };
          },
        loading: function(isLoading){
            if(!isLoading){
                document.querySelector(".loader").classList.add("loader--hidden")
            }
        },
        lazyFetching: true,
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