import axios from "axios";
import router from "@/router";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

axios.interceptors.request.use(
    async (config) => {
        const isAuthRoute = ["kodutood", "tunniplaan", undefined].includes(router.currentRoute.value.name);
        const isRefreshEndpoint = config.url === "/api/user/refresh";

        if (!config.headers['Authorization'] && !isRefreshEndpoint && isAuthRoute) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    config.headers['Authorization'] = `Bearer ${token}`;
                    return config;
                }).catch(err => Promise.reject(err));
            }

            isRefreshing = true;

            try {
                const { data } = await axios.post('/api/user/refresh', {}, { withCredentials: true });
                axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                processQueue(null, data.token);
                config.headers['Authorization'] = `Bearer ${data.token}`;
            } catch (err) {
                processQueue(err, null);
                await router.push("/login");
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

axios.interceptors.response.use(
    (response) => response,
    async (err) => {
        const originalRequest = err.config;

        if (err.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                    return axios(originalRequest);
                }).catch(err => Promise.reject(err));
            }

            isRefreshing = true;

            try {
                const { data } = await axios.post('/api/user/refresh', {}, { withCredentials: true });
                axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                originalRequest.headers['Authorization'] = `Bearer ${data.token}`;
                processQueue(null, data.token);
                return axios(originalRequest);
            } catch (err) {
                processQueue(err, null);
                await router.push("/login");
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(err);
    }
);
