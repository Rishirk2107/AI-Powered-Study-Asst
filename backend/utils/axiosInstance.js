const axios = require('axios');

/**
 * Axios instance for external API calls
 * Base URL is configurable via environment variables
 * Note: dotenv.config() should be called in server.js before this module is imported
 */
const baseURL = process.env.GENAI_API_BASE_URL || 'http://localhost:8000';

console.log(`[AxiosInstance] Initialized with baseURL: ${baseURL}`);

const axiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Add request/response interceptors for logging or error handling
axiosInstance.interceptors.request.use(
  (config) => {
    const fullUrl = `${baseURL}${config.url}`;
    console.log(`[API Request] ${config.method.toUpperCase()} ${fullUrl}`);
    console.log(`[API Request] baseURL: ${baseURL}, config.url: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error.message);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    const fullUrl = `${baseURL}${response.config.url}`;
    console.log(`[API Response] ${response.status} ${fullUrl}`);
    return response;
  },
  (error) => {
    console.error('[API Response Error]', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

module.exports = axiosInstance;
