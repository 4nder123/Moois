<template>
    <div class="login-page">
            <div class="form">
                <div v-if="error" class="error">{{ message }}</div>
                <div v-if="this.success && !error" class="success">Kasutaja loodud!</div>
                <form @submit.prevent="submit">
                    <input name="email" type="email" id="email" v-model="email" placeholder="email" required/>
                    <input name="password" type="password" id="password" placeholder="parool" required/>
                    <button type="submit">logi sisse</button>
                    <p class="message">Ei ole kasutaja? <router-link :to="{ name: 'register' }">Loo kasutaja</router-link></p>
                </form>
            </div>
      </div>
</template>
<script>
import { ref } from 'vue';
import axios from 'axios';
import router from '../router/index';
import { SocketConnect } from '@/socket';
import { useStore } from "vuex";

export default {
    name: "login",
    props: ['email', 'success'], 
    setup(props){
        const error = ref(false);
        const message = ref("");
        const store = useStore();
        const email = ref(props.email || '');

        const submit = async e => {
            const form = new FormData(e.target);
            const inputs = Object.fromEntries(form.entries())
            try {
                const { data } = await axios.post("/api/user/login", inputs, {
                    withCredentials: true
                });

                axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                store.dispatch('resetLoading');
                await store.dispatch('fetchUserInfo');
                store.dispatch('fetchAllEvents');
                await router.push("/");
                SocketConnect();
            } catch (err){
                error.value = true
                if (err.response?.status === 403) message.value = "Ligipääs keelatud!";
                else message.value = "Email või parool on vale!";
            }
        };
        return {
            email,
            submit,
            error,
            message
        };
    }
}
</script>

<style scoped> 
    .login-page {
        max-width: 360px;
        padding: 8% 0 0;
        margin: auto;
    }
    .form {
        position: relative;
        z-index: 1;
        background: #FFFFFF;
        max-width: 360px;
        margin: 0 auto 100px;
        padding: 45px;
        text-align: center;
        box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24);
    }
    .form input {
        margin: 0 0 15px;
    }
    .form button {
        border-radius: 4px;
        font-family: "Roboto", sans-serif;
        text-transform: uppercase;
        outline: 0;
        background: #2c3e50;
        width: 100%;
        border: 0;
        padding: 15px;
        color: #FFFFFF;
        font-size: 14px;
        -webkit-transition: all 0.3 ease;
        transition: all 0.3 ease;
        cursor: pointer;
    }
    .form button:hover,.form button:active,.form button:focus {
        background: #222f3d;
    }
    .form .message {
        margin: 15px 0 0;
        color: #b3b3b3;
        font-size: 12px;
    }
    .form .message a {
        color: #2c3e50;
        text-decoration: none;
    }
    @media (max-width: 360px) {
        .form {
            padding: 45px 30px;
        }
    }

</style>