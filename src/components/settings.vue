<template>
    <div class="modal-background">
        <div class="modal">
            <form @submit.prevent="submit">
                <header>
                    <button type="submit" class="close">&times;</button>
                    <h2>Seadmed</h2>
                </header>
                <section>
                    <p>Õis kalendri link:
                        <input 
                            name="ois" 
                            type="text" 
                            id="ois" 
                            :value="oisUrl" 
                            class="modal-input" 
                            placeholder="Õis"
                        />
                    </p>
                    <p>Moodle kalendri link:
                        <input 
                            name="moodle" 
                            type="text" 
                            :value="moodleUrl" 
                            id="moodle" 
                            placeholder="Moodle" 
                            class="modal-input"
                        />
                    </p>
                    <p>Põhivaade:
                        <select class="pv-select" @change="this.changeDefaultPage">
                            <option value="tunniplaan">Tunniplaan</option>
                            <option value="kodutoo" :selected="this.defaultPage()" >Kodutoo</option>
                        </select>
                    </p>
                    <p>Tume režiim:
                        <input type="checkbox" v-on:click="this.toggleDarkmode" :checked="this.isDarkmode" id="switch" />
                        <label for="switch">Toggle</label>
                    </p>
                    <p>
                        <button type="button" class="logout-button" @click="logout">Logi välja</button>
                    </p>
                </section>
            </form>
        </div>
    </div>
</template>

<script>
    import {ref} from 'vue';
    import { useStore } from "vuex";

    export default {
        name: 'SettingsModal',
        setup(_, { emit }) {
            const store = useStore();
            const oisUrl = ref(store.getters.getOisUrl);
            const moodleUrl = ref(store.getters.getMoodleUrl);
            const submit = e => {
                const form = new FormData(e.target);
                const inputs = Object.fromEntries(form.entries());
                let didUpdate = false;
                if(oisUrl.value !== inputs.ois) { store.dispatch("setOis", {url:inputs.ois, update:true}); didUpdate = true; }
                if(moodleUrl.value !== inputs.moodle) { store.dispatch("setMoodle", {url:inputs.moodle, update:true}); didUpdate = true; }
                if(didUpdate) { store.dispatch("resetLoading"); store.dispatch("fetchAllEvents"); }
                emit('close');
            };
            return {
                submit,
                oisUrl,
                moodleUrl
            }
        },
        computed: {
            isDarkmode() {
                return this.$store.getters.isDarkmode;
            }
        },
        methods: {
            defaultPage() {
                return localStorage.getItem('defaultPage') === 'true';
            },
            logout() {
                this.$emit('logout');
            },
            toggleDarkmode() {
                document.body.classList.contains("dark-mode")? document.body.classList.remove("dark-mode"): document.body.classList.add("dark-mode");
                this.$store.dispatch('toggleDarkmode');
            },
            changeDefaultPage() {
                localStorage.setItem('defaultPage', localStorage.getItem('defaultPage') === 'true'? 'false' : 'true');
            }
        },
    };
</script>

<style scoped>
    .modal-background {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 999;
    }

    .modal {
        margin: 10% auto;
        max-width: 570px;
        box-shadow: 0 5px 8px rgba(0, 0, 0, 0.2), 0 7px 20px rgba(0, 0, 0, 0.17);
    }

    .modal header {
        background: #2c3e50;
        padding: 15px;
        color: #ffffff;
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
    }

    .modal header h2 {
        margin: 0;
    }

    .modal section {
        padding: 10px 20px;
        background: #fff;
    }

    .close {
        background: none;
        border: none;
        color: #fff;
        font-size: 30px;
        float: right;
        cursor: pointer;
    }

    .close:hover {
        color: #000;
    }

    .logout-button {
        background: #2c3e50;
        color: #ffffff;
        padding: 10px;
        font-family: "Roboto", sans-serif;
        text-transform: uppercase;
        border: none;
        border-radius: 4px;
        font-size: 14px;
    }
    .logout-button:hover,.logout-button:active,.logout-button:focus {
        background: #222f3d;
    }
    input[type=checkbox]{
        height: 0;
        width: 0;
        visibility: hidden;
    }


    label[for="switch"] {
        cursor: pointer;
        text-indent: -9999px;
        width: 50px;
        height: 30px;
        background: grey;
        display: block;
        border-radius: 30px;
        position: relative;
    }

    label[for="switch"]:after {
        content: '';
        position: absolute;
        top: 5px;
        left: 5px;
        width: 20px;
        height: 20px;
        background: #fff;
        border-radius: 20px;
        transition: 0.3s;
    }

    input:checked + label[for="switch"] {
        background: #2c3e50;
    }

    input:checked + label[for="switch"]:after {
        left: calc(100% - 5px);
        transform: translateX(-100%);
    }

    .pv-select {
        font-family: "Roboto", sans-serif;
        background: #f0f0f0;
        width: 100%;
        border: none;
        font-size: 14px;
        color:black;
        box-sizing: border-box;
        border-radius: 4px;
        -webkit-border-radius: 4px;
        height: 48px;
        text-indent: 11px;
    }

    .pv-select:focus {
        outline: none;
    }
</style>
