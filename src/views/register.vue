<template>
    <div class="login-page">
        <div class="form">
            <div v-if="error" class="error">{{ message }}</div>
            <form @submit.prevent="submit">
                <input type="email" name="email" id="email" placeholder="email" required/>
                <input type="password" name="password" id="password" placeholder="parool" required/>
                <button type="submit">registeeri</button>
                <p class="message">Kasutaja juba tehtud? <router-link :to="{ name: 'login' }">Logi sisse</router-link></p>
                <div v-if="passwordError.length" class="password-error">
                    <ul>
                        <li v-for="(error, index) in passwordError" :key="index">{{ error }}</li>
                    </ul>
                </div>
            </form>
        </div>
    </div>
</template>
<script>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

export default {
    name: "register",
    setup(){
        const router = useRouter();
        const error = ref(false);
        const message = ref("");
        const passwordError = ref([]);
    
        const validatePassword = (password) => {
            passwordError.value = [];
            if (password.length < 8) {
                passwordError.value.push("Parool peab olema vähemalt 8 tähemärki pikk!");
            }
            if (password.length > 64) {
                passwordError.value.push("Parool ei tohi olla pikem kui 64 tähemärki!");
            }
            if (password.includes(" ")) {
                passwordError.value.push("Parool ei tohi sisaldada tühikuid!");
            }
            if (!/[A-Z]/.test(password)) {
                passwordError.value.push("Parool peab sisaldama suurtähte!");
            }
            if (!/[a-z]/.test(password)) {
                passwordError.value.push("Parool peab sisaldama väiketähte!");
            }
            if (!/[0-9]/.test(password)) {
                passwordError.value.push("Parool peab sisaldama numbrit!");
            }
            return passwordError.value.length === 0;
        };

        const submit = async e => {
            const form = new FormData(e.target);
            const inputs = Object.fromEntries(form.entries())
            if (!validatePassword(inputs.password)) {
                return;
            }
            try {
                await axios.post("/api/user/register", inputs);
                await router.push({ name: 'login', params: { email: inputs.email, success: true } });
            } catch (err){
                error.value = true
                if (err.response?.status === 409) message.value = "Kasutaja juba olemas!";
                else message.value = "Registreerimise ajal tekkis viga. Palun proovige hiljem.";
            }
        };
        return {
            submit,
            error,
            message,
            passwordError
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
    .password-error {
        color: red;
        font-size: 13px;
        margin-top: 10px;
    }
    .password-error ul {
        list-style: none;
        padding-left: 0;
    }
    .password-error li {
        padding: 5px 0;
    }
    @media (max-width: 360px) {
        .form {
            padding: 45px 30px;
        }
    }
</style>