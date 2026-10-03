import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api/v1",
    withCredentials: true,
});

/**
 * ---------------------------------------------------------
 * Request Interceptor
 * ---------------------------------------------------------
 *
 * Attaches the access token to authenticated requests.
 *
 * For normal JSON requests:
 *   Content-Type = application/json
 *
 * For FormData uploads:
 *   Do NOT set Content-Type manually.
 *   The browser/Axios will automatically add:
 *   multipart/form-data; boundary=...
 */
api.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("access");

        if (accessToken) {
            config.headers.Authorization =
                `Bearer ${accessToken}`;
        }

        /**
         * Do not force application/json for file uploads.
         */
        if (config.data instanceof FormData) {
            delete config.headers["Content-Type"];
        } else {
            config.headers["Content-Type"] =
                "application/json";
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