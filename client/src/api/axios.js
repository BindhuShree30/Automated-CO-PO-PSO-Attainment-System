import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api/v1",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

/**
 * ---------------------------------------------------------
 * Request Interceptor
 * ---------------------------------------------------------
 *
 * Attaches the access token to every authenticated request.
 */
api.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("access");

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        console.log(
            "API REQUEST:",
            config.method?.toUpperCase(),
            `${config.baseURL}${config.url}`
        );

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * ---------------------------------------------------------
 * Response Interceptor
 * ---------------------------------------------------------
 */
api.interceptors.response.use(
    (response) => {
        console.log(
            "API RESPONSE:",
            response.status,
            response.config.url,
            response.data
        );

        return response;
    },

    async (error) => {
        console.error(
            "API ERROR:",
            error.response?.status,
            error.config?.url,
            error.response?.data || error.message
        );

        /**
         * ---------------------------------------------------
         * Handle Unauthorized Requests
         * ---------------------------------------------------
         */
        if (error.response?.status === 401) {
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            localStorage.removeItem("user");
            localStorage.removeItem("token");
        }

        return Promise.reject(error);
    }
);

export default api;