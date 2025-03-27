<template>
    <div class="error-page">
        <div class="error-div">
            <div class="error">Midagi läks valesti!<br>
                Proovige lehte värskendada.</div>
            <button @click="refreshPage">Värskenda</button>
        </div>
    </div>
</template>

<script>
export default {
    methods: {
        refreshPage() {
            window.location.reload();
        }
    }
};
</script>

<style scoped> 
    .error-page {
        max-width: 360px;
        padding: 8% 0 0;
        margin: auto;
    }
    .error-div {
        position: relative;
        z-index: 1;
        background: #FFFFFF;
        max-width: 360px;
        margin: 0 auto 100px;
        padding: 45px;
        text-align: center;
        box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24);
    }
    button {
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
        cursor: pointer;
    }
    .dark-mode .error-div {
        background: #242424;
    }
</style>