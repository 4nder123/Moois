(function(){"use strict";var e={4609:function(e,t,s){var o=s(5130),n=s(6768),i=s(4232);function a(e,t,s,o,a,r){const l=(0,n.g2)("christmasLights"),d=(0,n.g2)("Settings"),c=(0,n.g2)("router-view");return(0,n.uX)(),(0,n.CE)("div",{class:(0,i.C4)({loading:this.isLoading})},[this.isLoading||11!==(new Date).getMonth()?(0,n.Q3)("",!0):((0,n.uX)(),(0,n.Wv)(l,{key:0})),this.isSettingsVisible?((0,n.uX)(),(0,n.Wv)(d,{key:1,onClose:this.closeSettings,onLogout:this.logout},null,8,["onClose","onLogout"])):(0,n.Q3)("",!0),this.isLoading?(0,n.Q3)("",!0):((0,n.uX)(),(0,n.Wv)(c,{key:2}))],2)}s(4114);const r={class:"modal-background"},l={class:"modal"},d=["value"],c=["value"],u=["selected"],h=["checked"];function p(e,t,s,i,a,p){return(0,n.uX)(),(0,n.CE)("div",r,[(0,n.Lk)("div",l,[(0,n.Lk)("form",{onSubmit:t[3]||(t[3]=(0,o.D$)(((...e)=>i.submit&&i.submit(...e)),["prevent"]))},[t[10]||(t[10]=(0,n.Lk)("header",null,[(0,n.Lk)("button",{type:"submit",class:"close"},"×"),(0,n.Lk)("h2",null,"Seadmed")],-1)),(0,n.Lk)("section",null,[(0,n.Lk)("p",null,[t[4]||(t[4]=(0,n.eW)("Õis kalendri link: ")),(0,n.Lk)("input",{name:"ois",type:"text",id:"ois",value:i.oisUrl,class:"modal-input",placeholder:"Õis"},null,8,d)]),(0,n.Lk)("p",null,[t[5]||(t[5]=(0,n.eW)("Moodle kalendri link: ")),(0,n.Lk)("input",{name:"moodle",type:"text",value:i.moodleUrl,id:"moodle",placeholder:"Moodle",class:"modal-input"},null,8,c)]),(0,n.Lk)("p",null,[t[7]||(t[7]=(0,n.eW)("Põhivaade: ")),(0,n.Lk)("select",{class:"pv-select",onChange:t[0]||(t[0]=(...e)=>this.changeDefaultPage&&this.changeDefaultPage(...e))},[t[6]||(t[6]=(0,n.Lk)("option",{value:"tunniplaan"},"Tunniplaan",-1)),(0,n.Lk)("option",{value:"kodutoo",selected:this.defaultPage()},"Kodutoo",8,u)],32)]),(0,n.Lk)("p",null,[t[8]||(t[8]=(0,n.eW)("Tume režiim: ")),(0,n.Lk)("input",{type:"checkbox",onClick:t[1]||(t[1]=(...e)=>this.toggleDarkmode&&this.toggleDarkmode(...e)),checked:this.isDarkmode,id:"switch"},null,8,h),t[9]||(t[9]=(0,n.Lk)("label",{for:"switch"},"Toggle",-1))]),(0,n.Lk)("p",null,[(0,n.Lk)("button",{type:"button",class:"logout-button",onClick:t[2]||(t[2]=(...e)=>p.logout&&p.logout(...e))},"Logi välja")])])],32)])])}var m=s(144),g=s(782),v={name:"SettingsModal",setup(e,{emit:t}){const s=(0,g.Pj)(),o=(0,m.KR)(s.getters.getOisUrl),n=(0,m.KR)(s.getters.getMoodleUrl),i=e=>{const i=new FormData(e.target),a=Object.fromEntries(i.entries());let r=!1;o.value!==a.ois&&(s.dispatch("setOis",{url:a.ois,update:!0}),r=!0),n.value!==a.moodle&&(s.dispatch("setMoodle",{url:a.moodle,update:!0}),r=!0),r&&(s.dispatch("resetLoading"),s.dispatch("fetchAllEvents")),t("close")};return{submit:i,oisUrl:o,moodleUrl:n}},computed:{isDarkmode(){return this.$store.getters.isDarkmode}},methods:{defaultPage(){return"true"===localStorage.getItem("defaultPage")},logout(){this.$emit("logout")},toggleDarkmode(){document.body.classList.contains("dark-mode")?document.body.classList.remove("dark-mode"):document.body.classList.add("dark-mode"),this.$store.dispatch("toggleDarkmode")},changeDefaultPage(){localStorage.setItem("defaultPage","true"===localStorage.getItem("defaultPage")?"false":"true")}}},f=s(1241);const k=(0,f.A)(v,[["render",p],["__scopeId","data-v-7498ee9a"]]);var w=k,E=s(1387);function b(e,t,s,o,i,a){const r=(0,n.g2)("FullCalendar");return(0,n.uX)(),(0,n.Wv)(r,{class:"calendar",ref:"fullCalendar",options:i.calendarOptions},null,8,["options"])}s(7642),s(8004),s(3853),s(5876),s(2475),s(5024),s(1698);var L=s(3535),y=s(4273),D=s(9842),A=s(7412),S=s(8077),P={name:"tunniplaan",components:{FullCalendar:L.A},data(){return{popover:null,calendar:null,calendarOptions:{plugins:[A.A,D.A],customButtons:{kodutood:{text:"Kodutööd",click:this.changeView},settings:{text:"Seaded",icon:"settings",click:this.showSettings}},hiddenDays:[0,6],locale:y.A,timeZone:"Europe/Tallinn",initialView:"timeGridWeek",nowIndicator:!0,slotMinTime:"08:00",slotMaxTime:"21:00",contentHeight:"auto",slotEventOverlap:!1,allDaySlot:!1,lazyFetching:!0,progressiveEventRendering:!0,eventTextColor:"black",eventClick:this.eventClick,events:this.getEvents,eventSourceSuccess:this.setupEventsView,eventDidMount:this.setupEvent,headerToolbar:{left:"prev,next today",center:"title",right:"timeGridWeek,timeGridDay kodutood settings"}}}},methods:{setupEventsView(e){let t=new Set([0,6]);e.forEach((e=>{const s=new Date(e.start).getDay();6===s?t.delete(6):0===s&&t.clear()})),this.calendar.setOption("hiddenDays",Array.from(t)),this.calendar.setOption("allDaySlot",e.some((e=>e.allDay)))},setupEvent(e){e.event.extendedProps.description&&e.el.setAttribute("data-bs-content",e.event.extendedProps.description)},sizeUpdate(){this.calendar.updateSize(),this.popover&&this.popover.update()},changeView(){Se.push("/kodutood")},getEvents(e){const t=new Date(e.start);t.setDate(t.getDate()+(1-t.getDay()+7)%7);const s=new Date(t);return s.setDate(s.getDate()+6),Promise.resolve(this.$store.getters.getTunniEvents(t,s))},showSettings(){this.$store.dispatch("changeSettingsVisibility")},refetchEvents(){"visible"===document.visibilityState&&this.$store.dispatch("fetchAllEvents").then((()=>this.calendar.refetchEvents()))},eventClick(e){const t=e.el,s=t.classList.contains("selected");this.clearEventSelection(),s||t.classList.add("selected")},clearEventSelection(){document.querySelectorAll(".fc-event.selected").forEach((e=>{e.classList.remove("selected"),e.blur()}))},handleOutsideClick(e){e.target.closest(".fc-event")||this.clearEventSelection()}},mounted(){this.calendar=this.$refs.fullCalendar.getApi(),this.popover=new S.AM(document.body,{selector:".fc-event",offset:[0,0],placement:"top",trigger:"focus",html:!0})},created(){window.addEventListener("visibilitychange",this.refetchEvents),window.addEventListener("resize",this.sizeUpdate),window.addEventListener("click",this.handleOutsideClick)},beforeUnmount(){this.popover.dispose(),window.removeEventListener("visibilitychange",this.refetchEvents),window.removeEventListener("resize",this.sizeUpdate),window.removeEventListener("click",this.handleOutsideClick)}};const C=(0,f.A)(P,[["render",b]]);var x=C;const $={key:0,class:"eventButton deleteIcon"},V=["id"];function U(e,t,s,o,a,r){const l=(0,n.g2)("addEvent"),d=(0,n.g2)("FullCalendar"),c=(0,n.gN)("long-press");return(0,n.uX)(),(0,n.CE)(n.FK,null,[this.isAddEventVisible?((0,n.uX)(),(0,n.Wv)(l,{key:0,onClose:this.toggleAddEvent},null,8,["onClose"])):(0,n.Q3)("",!0),(0,n.bF)(d,{class:"listView",ref:"fullCalendar",options:a.calendarOptions},{eventContent:(0,n.k6)((e=>[(0,n.Lk)("div",{class:(0,i.C4)(["event",e.event.extendedProps.color])},[(0,n.Lk)("div",{class:(0,i.C4)(["eventTitle",e.event.extendedProps.status])},(0,i.v_)(e.event.title.replace(/(\S{25})/g,"$1​")),3),"true"===e.event.extendedProps.userAdded&&a.isDelete?((0,n.uX)(),(0,n.CE)("div",$)):"done"!==e.event.extendedProps.status?(0,n.bo)(((0,n.uX)(),(0,n.CE)("div",{key:1,id:e.event.id,class:"eventButton highlightIcon","on:onLongPress":t[0]||(t[0]=(...e)=>r.onLongPress&&r.onLongPress(...e))},null,40,V)),[[c]]):(0,n.Q3)("",!0)],2)])),_:1},8,["options"])],64)}const O={id:"add",class:"modal-background"},j={class:"modal"},T={class:"datetime-flex"},I={class:"date"},K={class:"time"};function M(e,t,s,i,a,r){const l=(0,n.g2)("flat-pickr");return(0,n.uX)(),(0,n.CE)("div",O,[(0,n.Lk)("div",j,[(0,n.Lk)("header",null,[(0,n.Lk)("button",{id:"close-button",class:"close",onClick:t[0]||(t[0]=(...e)=>i.close&&i.close(...e))},"×"),t[4]||(t[4]=(0,n.Lk)("h2",null,"Lisa kodutöö",-1))]),(0,n.Lk)("section",null,[(0,n.Lk)("form",{id:"datetimeadd",onSubmit:t[3]||(t[3]=(0,o.D$)(((...e)=>i.submit&&i.submit(...e)),["prevent"]))},[t[6]||(t[6]=(0,n.Lk)("p",null,"Kodutöö pealkiri:",-1)),t[7]||(t[7]=(0,n.Lk)("input",{type:"text",name:"title",class:"modal-input",pattern:"\\S.*",placeholder:"Sisesta pealkiri",autocomplete:"off",maxlength:"240",required:""},null,-1)),t[8]||(t[8]=(0,n.Lk)("p",null,"Kuupäev:",-1)),(0,n.Lk)("div",T,[(0,n.Lk)("div",I,[(0,n.bF)(l,{modelValue:e.date,"onUpdate:modelValue":t[1]||(t[1]=t=>e.date=t),config:i.dateConfig,class:"datetime",name:"date"},null,8,["modelValue","config"])]),(0,n.Lk)("div",K,[(0,n.bF)(l,{modelValue:e.date,"onUpdate:modelValue":t[2]||(t[2]=t=>e.date=t),config:i.timeConfig,class:"datetime",name:"time"},null,8,["modelValue","config"])]),t[5]||(t[5]=(0,n.Lk)("div",{class:"submit"},[(0,n.Lk)("button",{id:"add-button",type:"submit",class:"add-button"},[(0,n.Lk)("span",{class:"fc-icon fc-icon-addEvent",role:"img"})])],-1))])],32)])])])}var _=s(4653),z=(s(4496),{name:"addEventModal",components:{flatPickr:_.A},setup(e,{emit:t}){const s=(0,g.Pj)(),o=(0,m.KR)({enableTime:!0,noCalendar:!0,dateFormat:"H:i",defaultDate:"00:00",time_24hr:!0,wrap:!0}),n=(0,m.KR)({locale:"et",altInput:!0,altFormat:"F j, Y",dateFormat:"Y-m-d",minDate:Date.now(),maxDate:new Date((new Date).setFullYear(new Date(Date.now()).getFullYear()+2)),defaultDate:Date.now(),wrap:!0}),i=e=>{const t=new FormData(e.target),o=Object.fromEntries(t.entries()),n={id:crypto.randomUUID(),title:o.title,start:o.date+"T"+o.time,extendedProps:{userAdded:"true",status:"",color:""}};s.dispatch("addEvent",{event:n,update:!0}),a()},a=()=>{t("close")};return{timeConfig:o,dateConfig:n,submit:i,close:a}}});const F=(0,f.A)(z,[["render",M],["__scopeId","data-v-61636555"]]);var R=F,X=s(5248);const B=["mousedown","touchstart"],W=["mouseup","mouseleave","touchend","touchcancel"],q=500,H={mounted(e){let t=null;const s=s=>{"mousedown"===s.type&&0!==s.button||(t=setTimeout((()=>{e.dispatchEvent(new CustomEvent("onLongPress",{detail:s}))}),q))},o=e=>{t&&(clearTimeout(t),t=null)};B.forEach((t=>e.addEventListener(t,s,{passive:!0}))),W.forEach((t=>e.addEventListener(t,o,{passive:!0}))),e._cleanup=()=>{B.forEach((t=>e.removeEventListener(t,s))),W.forEach((t=>e.removeEventListener(t,o)))}},unmounted(e){e._cleanup()}};var Q={name:"kodutood",components:{FullCalendar:L.A,addEvent:R},directives:{longPress:H},data(){return{isAddEventVisible:!1,isLongPress:!1,isDelete:!1,highlightColor:localStorage.getItem("high")?localStorage.getItem("high"):"red",calendarOptions:{plugins:[X.A],customButtons:{trash:{text:"Kustuta",icon:"trash",click:this.toggleDelete},addEvent:{text:"Lisa",icon:"addEvent",click:this.toggleAddEvent},tunniplaan:{text:"Tunniplaan",click:this.changeView},settings:{text:"Seaded",icon:"settings ",click:this.showSettings}},views:{kodutood:{type:"list"}},locale:y.A,defaultTimedEventDuration:0,events:this.getEvents,lazyFetching:!0,progressiveEventRendering:!0,contentHeight:"auto",initialView:"kodutood",eventsSet:this.setVisibleRange,eventClick:this.onEventClick,headerToolbar:{left:"",center:"",right:"addEvent trash tunniplaan settings"}}}},methods:{setVisibleRange(e){if(0===e.length)return;const t=e.map((e=>new Date(new Date(e.start).toISOString().split("T")[0]))),s=new Date(Math.min(...t));let o=new Date(Math.max(...t));o.setDate(o.getDate()+2),this.calendar.setOption("visibleRange",{start:s.toISOString().split("T")[0],end:o.toISOString().split("T")[0]})},onEventClick(e){const{event:t,jsEvent:s}=e,o=s.target.classList;if(o.contains("highlightIcon")){if(!this.isLongPress){const e="high"===t.extendedProps.status;this.$store.dispatch("setExtendedProps",{props:{id:t.id,status:e?"":"high",color:e?"":this.highlightColor},update:!0})}return void(this.isLongPress=!1)}if(o.contains("deleteIcon"))return this.$store.dispatch("deleteEvent",{id:t.id,update:!0}),void this.setTrashButtonVisibility(!1);const n="done"===t.extendedProps.status;this.$store.dispatch("setExtendedProps",{props:{id:t.id,status:n?"":"done",color:""},update:!0})},onLongPress(e){this.isLongPress=!0;const t=new S.AM(e.target,{content:"<div class='box red'></div><div class='box orange'></div><div class='box yellow'></div>",placement:"top",trigger:"manual",html:!0,container:"body"});t.show();const s=o=>{t.dispose(),o.target.classList.contains("box")&&this.changeSavedColor(o,e.target.id),document.removeEventListener("mousedown",s)};document.addEventListener("mousedown",s,{once:!0})},getEvents(){return Promise.resolve(this.$store.getters.getKoduEvents)},onScroll(){window.scrollY>2?document.querySelector(".listView .fc-header-toolbar").classList.add("shadow"):document.querySelector(".listView .fc-header-toolbar").classList.remove("shadow")},changeView(){Se.push("/tunniplaan")},changeSavedColor(e,t){this.highlightColor=e.target.classList[1],localStorage.setItem("high",e.target.classList[1]),this.$store.dispatch("setExtendedProps",{props:{id:t,status:"high",color:this.highlightColor},update:!0})},showSettings(){this.$store.dispatch("changeSettingsVisibility")},toggleAddEvent(){this.isAddEventVisible&&this.setTrashButtonVisibility(),this.isAddEventVisible=!this.isAddEventVisible},toggleDelete(e){this.isDelete=!this.isDelete;const t=e.target.querySelector("span");if(t){if(this.isDelete)return t.classList.replace("fc-icon-trash","fc-icon-check");t.classList.replace("fc-icon-check","fc-icon-trash")}},setTrashButtonVisibility(){const e=this.$store.getters.getKoduEvents,t=e.some((e=>"true"===e.extendedProps.userAdded)),s=document.querySelector(".fc-trash-button");if(!s)return;const o=t?"":"none";s.style.display!==o&&(s.style.display=o,!t&&this.isDelete&&this.toggleDelete({target:s}))},refetchEvents(){"visible"===document.visibilityState&&this.$store.dispatch("fetchAllEvents")}},computed:{events(){return this.$store.getters.getKoduEvents}},watch:{events:{handler(){this.calendar.refetchEvents()},deep:!0}},mounted(){this.calendar=this.$refs.fullCalendar.getApi(),this.setTrashButtonVisibility()},created(){window.addEventListener("visibilitychange",this.refetchEvents),window.addEventListener("scroll",this.onScroll)},beforeUnmount(){window.removeEventListener("visibilitychange",this.refetchEvents),window.removeEventListener("scroll",this.onScroll)}};const Y=(0,f.A)(Q,[["render",U]]);var G=Y;const N={class:"login-page"},Z={class:"form"},J={key:0,class:"error"},ee={key:1,class:"success"},te={class:"message"};function se(e,t,s,a,r,l){const d=(0,n.g2)("router-link");return(0,n.uX)(),(0,n.CE)("div",N,[(0,n.Lk)("div",Z,[a.error?((0,n.uX)(),(0,n.CE)("div",J,(0,i.v_)(a.message),1)):(0,n.Q3)("",!0),this.success&&!a.error?((0,n.uX)(),(0,n.CE)("div",ee,"Kasutaja loodud!")):(0,n.Q3)("",!0),(0,n.Lk)("form",{onSubmit:t[1]||(t[1]=(0,o.D$)(((...e)=>a.submit&&a.submit(...e)),["prevent"]))},[(0,n.bo)((0,n.Lk)("input",{name:"email",type:"email",id:"email","onUpdate:modelValue":t[0]||(t[0]=e=>a.email=e),placeholder:"email",required:""},null,512),[[o.Jo,a.email]]),t[4]||(t[4]=(0,n.Lk)("input",{name:"password",type:"password",id:"password",placeholder:"parool",required:""},null,-1)),t[5]||(t[5]=(0,n.Lk)("button",{type:"submit"},"logi sisse",-1)),(0,n.Lk)("p",te,[t[3]||(t[3]=(0,n.eW)("Ei ole kasutaja? ")),(0,n.bF)(d,{to:{name:"register"}},{default:(0,n.k6)((()=>t[2]||(t[2]=[(0,n.eW)("Loo kasutaja")]))),_:1})])],32)])])}var oe=s(6695),ne=s(1714),ie=s(6415),ae=(0,g.y$)({strict:!0,state:{oisUrl:"",moodleUrl:"",koduEvents:[],loading:!0,tunniEvents:[],settings:!1,isDarkmode:void 0!==localStorage.getItem("dark_mode")&&"true"===localStorage.getItem("dark_mode")},getters:{isDarkmode:e=>e.isDarkmode,getSettingsVisibility:e=>e.settings,getLoading:e=>e.loading,getMoodleUrl:e=>e.moodleUrl,getOisUrl:e=>e.oisUrl,getKoduEvents:e=>e.koduEvents,getTunniEvents:e=>(t,s)=>{const o=re(new Date(t)),n=re(new Date(s)),i=[];return e.tunniEvents.forEach((e=>{const t=new Date(e.start);if(e.rrule){const t={freq:2===e.rrule.freq?ie.p3.WEEKLY:ie.p3.DAILY,dtstart:new Date(e.rrule.dtstart),interval:e.rrule.interval||1,until:e.rrule.until?new Date(e.rrule.until):null,byweekday:e.rrule.byweekday||null},s=new ie.p3(t);s.between(o,n,!0).length>0&&i.push(e)}else t>=o&&t<=n&&i.push(e)})),i}},mutations:{changeSettingsVisibility(e){e.settings=!e.settings},setKoduEvents(e,t){e.koduEvents=t},setTunniEvents(e,t){e.tunniEvents=t},setLoading(e,t){e.loading=t},addEvent(e,t){e.koduEvents.some((e=>e.id===t.id))||e.koduEvents.push(t)},deleteEvent(e,t){e.koduEvents=e.koduEvents.filter((e=>e.id!==t))},setExtendedProps(e,{props:t,update:s}){const{id:o,status:n,color:i}=t,a=e.koduEvents.find((e=>e.id===o));a&&a.extendedProps&&(s&&("done"===n?oe.A.post(`/api/events/homework/done/${o}`).catch((()=>{})):""===n&&"done"===a.extendedProps.status?oe.A.delete(`/api/events/homework/done/${o}`).catch((()=>{})):"high"===n?oe.A.post(`/api/events/homework/highlight/${o}/${i}`).catch((()=>{})):""===n&&"high"===a.extendedProps.status&&oe.A.delete(`/api/events/homework/highlight/${o}`).catch((()=>{}))),a.extendedProps.status=n,a.extendedProps.color=i)},toggleDarkmode(e){localStorage.setItem("dark_mode",!e.isDarkmode),e.isDarkmode=!e.isDarkmode},setOis(e,t){e.oisUrl=t},setMoodle(e,t){e.moodleUrl=t},setUserInfo(e,t){e.oisUrl=t.ois,e.moodleUrl=t.moodle}},actions:{async fetchUserInfo({commit:e}){try{const{data:t}=await oe.A.get("/api/user/");e("setUserInfo",t)}catch(t){throw e("setLoading",!1),t}},setOis({commit:e},{url:t,update:s}){s&&oe.A.put("/api/user/ois",{url:t}).catch((()=>{})),e("setOis",t)},setMoodle({commit:e},{url:t,update:s}){s&&oe.A.put("/api/user/moodle",{url:t}).catch((()=>{})),e("setMoodle",t)},addEvent({commit:e},{event:t,update:s}){s&&oe.A.post("/api/events/homework/",t).catch((()=>{})),e("addEvent",t)},deleteEvent({commit:e},{id:t,update:s}){s&&oe.A.delete(`/api/events/homework/${t}`).catch((()=>{})),e("deleteEvent",t)},setExtendedProps({commit:e},{props:t,update:s}){e("setExtendedProps",{props:t,update:s})},changeSettingsVisibility({commit:e}){e("changeSettingsVisibility")},toggleDarkmode({commit:e}){e("toggleDarkmode")},resetLoading({commit:e}){e("setLoading",!0)},async fetchKoduEvents({commit:e,state:t}){try{const{data:s}=await oe.A.get(`/api/events/homework/${encodeURIComponent(t.moodleUrl)}`);e("setKoduEvents",s)}catch{}},async fetchTunniEvents({commit:e,state:t}){try{if(!t.oisUrl)return void e("setTunniEvents",[]);const{data:s}=await oe.A.get(`/api/events/schedule/${encodeURIComponent(t.oisUrl)}`);e("setTunniEvents",s)}catch{}},async fetchAllEvents({dispatch:e,commit:t}){try{await Promise.all([e("fetchKoduEvents"),e("fetchTunniEvents")])}finally{t("setLoading",!1)}}}});function re(e){return new Date(e.setHours(0,0,0,0))}const le="https://moois.mooo.com",de=(0,ne.io)(le,{transports:["polling","websocket"],reconnectionAttempts:1/0,reconnectionDelay:1e3,reconnectionDelayMax:5e3,autoConnect:!1,secure:!0,extraHeaders:{authorization:null}}),ce=()=>{"/kodutood"!==Se.currentRoute.value.fullPath&&"/tunniplaan"!==Se.currentRoute.value.fullPath||(de.io.opts.extraHeaders.authorization=oe.A.defaults.headers.common["Authorization"],de.connect())},ue=()=>{de.disconnected||de.disconnect()};de.on("connect_error",(e=>{oe.A.post("/api/user/refresh",{},{withCredentials:!0}).then((({data:e})=>{de.disconnect(),oe.A.defaults.headers.common["Authorization"]="Bearer "+e.token,de.io.opts.extraHeaders.authorization="Bearer "+e.token,de.connect()})).catch((()=>{ue()}))})),de.on("addEvent",(e=>{ae.dispatch("addEvent",{event:e,update:!1})})),de.on("deleteEvent",(e=>{ae.dispatch("deleteEvent",{id:e,update:!1})})),de.on("addDone",(e=>{ae.dispatch("setExtendedProps",{props:{id:e,status:"done",color:""},update:!1})})),de.on("removeDone",(e=>{ae.dispatch("setExtendedProps",{props:{id:e,status:"",color:""},update:!1})})),de.on("addHighlight",(({id:e,color:t})=>{ae.dispatch("setExtendedProps",{props:{id:e,status:"high",color:t},update:!1})})),de.on("removeHighlight",(e=>{ae.dispatch("setExtendedProps",{props:{id:e,status:"",color:""},update:!1})})),de.on("updateOis",(e=>{ae.dispatch("setOis",{url:e,update:!1}),ae.dispatch("resetLoading"),ae.dispatch("fetchAllEvents")})),de.on("updateMoodle",(e=>{ae.dispatch("setMoodle",{url:e,update:!1}),ae.dispatch("resetLoading"),ae.dispatch("fetchAllEvents")}));var he={name:"login",props:["email","success"],setup(e){const t=(0,m.KR)(!1),s=(0,m.KR)(""),o=(0,g.Pj)(),n=(0,m.KR)(e.email||""),i=async e=>{const n=new FormData(e.target),i=Object.fromEntries(n.entries());try{const{data:e}=await oe.A.post("/api/user/login",i,{withCredentials:!0});oe.A.defaults.headers.common["Authorization"]=`Bearer ${e.token}`,o.dispatch("resetLoading"),await o.dispatch("fetchUserInfo"),o.dispatch("fetchAllEvents"),await Se.push("/"),ce()}catch(a){t.value=!0,403===a.response?.status?s.value="Ligipääs keelatud!":s.value="Email või parool on vale!"}};return{email:n,submit:i,error:t,message:s}}};const pe=(0,f.A)(he,[["render",se],["__scopeId","data-v-aa5c1d52"]]);var me=pe;const ge={class:"login-page"},ve={class:"form"},fe={key:0,class:"error"},ke={class:"message"},we={key:0,class:"password-error"};function Ee(e,t,s,a,r,l){const d=(0,n.g2)("router-link");return(0,n.uX)(),(0,n.CE)("div",ge,[(0,n.Lk)("div",ve,[a.error?((0,n.uX)(),(0,n.CE)("div",fe,(0,i.v_)(a.message),1)):(0,n.Q3)("",!0),(0,n.Lk)("form",{onSubmit:t[0]||(t[0]=(0,o.D$)(((...e)=>a.submit&&a.submit(...e)),["prevent"]))},[t[3]||(t[3]=(0,n.Lk)("input",{type:"email",name:"email",id:"email",placeholder:"email",required:""},null,-1)),t[4]||(t[4]=(0,n.Lk)("input",{type:"password",name:"password",id:"password",placeholder:"parool",required:""},null,-1)),t[5]||(t[5]=(0,n.Lk)("button",{type:"submit"},"registeeri",-1)),(0,n.Lk)("p",ke,[t[2]||(t[2]=(0,n.eW)("Kasutaja juba tehtud? ")),(0,n.bF)(d,{to:{name:"login"}},{default:(0,n.k6)((()=>t[1]||(t[1]=[(0,n.eW)("Logi sisse")]))),_:1})]),a.passwordError.length?((0,n.uX)(),(0,n.CE)("div",we,[(0,n.Lk)("ul",null,[((0,n.uX)(!0),(0,n.CE)(n.FK,null,(0,n.pI)(a.passwordError,((e,t)=>((0,n.uX)(),(0,n.CE)("li",{key:t},(0,i.v_)(e),1)))),128))])])):(0,n.Q3)("",!0)],32)])])}var be={name:"register",setup(){const e=(0,E.rd)(),t=(0,m.KR)(!1),s=(0,m.KR)(""),o=(0,m.KR)([]),n=e=>(o.value=[],e.length<8&&o.value.push("Parool peab olema vähemalt 8 tähemärki pikk!"),e.length>64&&o.value.push("Parool ei tohi olla pikem kui 64 tähemärki!"),e.includes(" ")&&o.value.push("Parool ei tohi sisaldada tühikuid!"),/[A-Z]/.test(e)||o.value.push("Parool peab sisaldama suurtähte!"),/[a-z]/.test(e)||o.value.push("Parool peab sisaldama väiketähte!"),/[0-9]/.test(e)||o.value.push("Parool peab sisaldama numbrit!"),0===o.value.length),i=async o=>{const i=new FormData(o.target),a=Object.fromEntries(i.entries());if(n(a.password))try{await oe.A.post("/api/user/register",a),await e.push({name:"login",params:{email:a.email,success:!0}})}catch(r){t.value=!0,409===r.response?.status?s.value="Kasutaja juba olemas!":s.value="Registreerimise ajal tekkis viga. Palun proovige hiljem."}};return{submit:i,error:t,message:s,passwordError:o}}};const Le=(0,f.A)(be,[["render",Ee],["__scopeId","data-v-1530ba56"]]);var ye=Le;const De=[{path:"/kodutood",name:"kodutood",component:G},{path:"/tunniplaan",name:"tunniplaan",component:x},{path:"/login/:email?/:success?",name:"login",props:!0,component:me},{path:"/register",name:"register",component:ye}],Ae=(0,E.aE)({history:(0,E.sC)(),routes:De});Ae.beforeEach(((e,t,s)=>{const o=()=>"true"===localStorage.getItem("defaultPage")?"/kodutood":"/tunniplaan";if("/"===e.path||""===e.path){const e=o();return["/kodutood","/tunniplaan"].includes(window.name)||(window.name=e),s(window.name||e)}if(["/login","/register"].includes(e.path))return ae.getters.getSettingsVisibility&&ae.dispatch("changeSettingsVisibility"),ue(),s();window.name=e.path,s()}));var Se=Ae;const Pe={class:"strand"};function Ce(e,t,s,o,i,a){return(0,n.uX)(),(0,n.CE)("ul",Pe)}var xe={methods:{createStrand(){const e=document.querySelector(".strand");e.innerHTML="";const t=document.body.clientWidth,s=Math.floor(t/52);for(let o=0;o<s;o++){const t=document.createElement("li");if(0===o){const e=document.createElement("div");e.className="wire",t.appendChild(e)}e.appendChild(t)}}},mounted(){this.createStrand(),window.addEventListener("resize",this.createStrand)},unmounted(){window.removeEventListener("resize",this.createStrand)}};const $e=(0,f.A)(xe,[["render",Ce]]);var Ve=$e,Ue={name:"home",components:{christmasLights:Ve,Settings:w},computed:{isLoading(){return this.$store.getters.getLoading},isSettingsVisible(){return this.$store.getters.getSettingsVisibility},isDarkmode(){return this.$store.getters.isDarkmode}},methods:{async logout(){await oe.A.post("/api/user/logout",{},{withCredentials:!0}),oe.A.defaults.headers.common["Authorization"]="",window.name="",this.closeSettings(),await Se.push("/login")},closeSettings(){this.$store.dispatch("changeSettingsVisibility")}},async mounted(){this.isDarkmode&&document.body.classList.add("dark-mode");try{await this.$store.dispatch("fetchUserInfo"),this.$store.dispatch("fetchAllEvents"),ce()}catch{}},created(){this.beforeUnloadListener=()=>ue(),this.pageShowListener=e=>{e.persisted&&ce()},window.addEventListener("beforeunload",this.beforeUnloadListener),window.addEventListener("pageshow",this.pageShowListener)},beforeUnmount(){window.removeEventListener("beforeunload",this.beforeUnloadListener),window.removeEventListener("pageshow",this.pageShowListener)}};const Oe=(0,f.A)(Ue,[["render",a]]);var je=Oe;let Te=!1,Ie=[];const Ke=(e,t=null)=>{Ie.forEach((s=>{e?s.reject(e):s.resolve(t)})),Ie=[]};oe.A.interceptors.request.use((async e=>{const t=["kodutood","tunniplaan",void 0].includes(Se.currentRoute.value.name),s="/api/user/refresh"===e.url;if(!e.headers["Authorization"]&&!s&&t){if(Te)return new Promise(((e,t)=>{Ie.push({resolve:e,reject:t})})).then((t=>(e.headers["Authorization"]=`Bearer ${t}`,e))).catch((e=>Promise.reject(e)));Te=!0;try{const{data:t}=await oe.A.post("/api/user/refresh",{},{withCredentials:!0});oe.A.defaults.headers.common["Authorization"]=`Bearer ${t.token}`,Ke(null,t.token),e.headers["Authorization"]=`Bearer ${t.token}`}catch(o){return Ke(o,null),await Se.push("/login"),Promise.reject(o)}finally{Te=!1}}return e}),(e=>Promise.reject(e))),oe.A.interceptors.response.use((e=>e),(async e=>{const t=e.config;if(401===e.response?.status&&!t._retry){if(t._retry=!0,Te)return new Promise(((e,t)=>{Ie.push({resolve:e,reject:t})})).then((e=>(t.headers["Authorization"]=`Bearer ${e}`,(0,oe.A)(t)))).catch((e=>Promise.reject(e)));Te=!0;try{const{data:e}=await oe.A.post("/api/user/refresh",{},{withCredentials:!0});return oe.A.defaults.headers.common["Authorization"]=`Bearer ${e.token}`,t.headers["Authorization"]=`Bearer ${e.token}`,Ke(null,e.token),(0,oe.A)(t)}catch(e){return Ke(e,null),await Se.push("/login"),Promise.reject(e)}finally{Te=!1}}return Promise.reject(e)})),(0,o.Ef)(je).use(ae).use(Se).mount("#app")}},t={};function s(o){var n=t[o];if(void 0!==n)return n.exports;var i=t[o]={exports:{}};return e[o].call(i.exports,i,i.exports,s),i.exports}s.m=e,function(){var e=[];s.O=function(t,o,n,i){if(!o){var a=1/0;for(c=0;c<e.length;c++){o=e[c][0],n=e[c][1],i=e[c][2];for(var r=!0,l=0;l<o.length;l++)(!1&i||a>=i)&&Object.keys(s.O).every((function(e){return s.O[e](o[l])}))?o.splice(l--,1):(r=!1,i<a&&(a=i));if(r){e.splice(c--,1);var d=n();void 0!==d&&(t=d)}}return t}i=i||0;for(var c=e.length;c>0&&e[c-1][2]>i;c--)e[c]=e[c-1];e[c]=[o,n,i]}}(),function(){s.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return s.d(t,{a:t}),t}}(),function(){s.d=function(e,t){for(var o in t)s.o(t,o)&&!s.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})}}(),function(){s.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}()}(),function(){s.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)}}(),function(){s.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}}(),function(){var e={524:0};s.O.j=function(t){return 0===e[t]};var t=function(t,o){var n,i,a=o[0],r=o[1],l=o[2],d=0;if(a.some((function(t){return 0!==e[t]}))){for(n in r)s.o(r,n)&&(s.m[n]=r[n]);if(l)var c=l(s)}for(t&&t(o);d<a.length;d++)i=a[d],s.o(e,i)&&e[i]&&e[i][0](),e[i]=0;return s.O(c)},o=self["webpackChunkMoois"]=self["webpackChunkMoois"]||[];o.forEach(t.bind(null,0)),o.push=t.bind(null,o.push.bind(o))}();var o=s.O(void 0,[504],(function(){return s(4609)}));o=s.O(o)})();
//# sourceMappingURL=app.ad91f368.js.map