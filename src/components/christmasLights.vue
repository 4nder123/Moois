<template>
    <ul class="strand"></ul>
</template>

<script>
    export default {
        methods: {
            createStrand() {
                const strand = document.querySelector(".strand");
                strand.innerHTML = "";
                const width = document.body.clientWidth;

                const lightCount = Math.floor(width / 52);
                for (let i = 0; i < lightCount; i++) {
                    const li = document.createElement("li");
                    if (i === 0) {
                        const wire = document.createElement("div");
                        wire.className = "wire";
                        li.appendChild(wire);
                    }
                    strand.appendChild(li);
                }
            }
        },
        mounted() {
            this.createStrand();
            window.addEventListener("resize", this.createStrand);
        }, 
        unmounted() {
            window.removeEventListener("resize", this.createStrand);
        }
    }

</script>

<style>
    #app:has(.strand) .fc-header-toolbar {
        margin-bottom: 55px !important;
    }
    #app:has(.strand) .fc-view-harness:has(.fc-kodutood-view) {
        top: 95px !important;
    }
    #app:has(.login-page) .strand{
        margin: 0 0 0 0;
        z-index: 99999;
    }
    #app:has(.login-page) .strand{
        top:0;
    }
    @media (max-width: 500px) {
        #app:has(.calendar) .strand {
            margin: 8vw 0 0 0px;
        }
    }
    .strand {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        position: absolute;
        z-index: 1;
        margin: 40px 0 0 0;
        padding: 0;
        pointer-events: none;
        width: 100%;
        left: 50%;
        transform: translateX(-50%);
    }
    .strand li {
        position: relative;
        animation-fill-mode: both;
        animation-iteration-count: infinite;
        list-style: none;
        margin: 0;
        padding: 0;
        width: 12px;
        height: 28px;
        border-radius: 50%;
        margin: 20px;
        display: inline-block;
        background: #f02241;
        box-shadow: 0px 4.66667px 24px 3px #f02241;
        animation-name: flash-1;
        animation-duration: 2s;
    }

    .strand li:nth-child(2n+1) {
        background: #42b261;
        box-shadow: 0px 4.66667px 24px 3px rgba(0, 255, 255, 0.5);
        animation-name: flash-2;
        animation-duration: 0.4s;
    }

    .strand li:nth-child(4n+2) {
        background: #e6be9a;
        box-shadow: 0px 4.66667px 24px 3px #e6be9a;
        animation-name: flash-3;
        animation-duration: 1.1s;
    }

    .strand li:nth-child(odd) {
        animation-duration: 1.8s;
    }

    .strand li:nth-child(3n+1) {
        animation-duration: 1.4s;
    }

    .strand li:before {
        content: "";
        position: absolute;
        background: #3f3f3f;
        width: 10px;
        height: 9.33333px;
        border-radius: 3px;
        top: -4.66667px;
        left: 1px;
    }
    .strand li .wire {
        content: "";
        top: -14px;
        left: -49px;
        position: absolute;
        width: 52px;
        height: 18.66667px;
        border-bottom: solid #3f3f3f 2px;
        border-radius: 50%;
    }

    .strand li:after {
        content: "";
        top: -14px;
        left: 9px;
        position: absolute;
        width: 52px;
        height: 18.66667px;
        border-bottom: solid #3f3f3f 2px;
        border-radius: 50%;
    }

    @keyframes flash-1 {
        0%, 100% {
            background: #f02241;
            box-shadow: 0px 4.66667px 24px 3px #f02241;
        }
        50% {
            background: rgba(240, 34, 65, 0.4);
            box-shadow: 0px 4.66667px 24px 3px rgba(240, 35, 65, 0.2);
        }
    }

    @keyframes flash-2 {
        0%, 100% {
            background: #42b261;
            box-shadow: 0px 4.66667px 24px 3px #42b261;
        }
        50% {
            background: rgba(66, 178, 97, 0.4);
            box-shadow: 0px 4.66667px 24px 3px rgba(66, 178, 97, 0.2);
        }
    }

    @keyframes flash-3 {
        0%, 100% {
            background: #e6be9a;
            box-shadow: 0px 4.66667px 24px 3px #e6be9a;
        }
        50% {
            background: rgba(230, 194, 154, 0.4);
            box-shadow: 0px 4.66667px 24px 3px rgba(230, 194, 154, 0.2);
        }
    }
</style>
