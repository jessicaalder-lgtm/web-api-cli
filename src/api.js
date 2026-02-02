import axios from 'axios';
import 'dotenv/config';

// Create configured axios instance
const api = axios.create({
  baseURL: process.env.API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth
api.interceptors.request.use((config) => {
  if (process.env.API_KEY) {
    config.headers.Authorization = `Bearer ${process.env.API_KEY}`;
  }
  return config;
});

// Response interceptor for logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data || error.message);
    throw error;
  }
);

// HTTP request templates
export async function get(endpoint, params = {}) {
  const response = await api.get(endpoint, { params });
  return response.data;
}

export async function post(endpoint, data = {}) {
  const response = await api.post(endpoint, data);
  return response.data;
}

export async function put(endpoint, data = {}) {
  const response = await api.put(endpoint, data);
  return response.data;
}

export async function patch(endpoint, data = {}) {
  const response = await api.patch(endpoint, data);
  return response.data;
}

export async function del(endpoint) {
  const response = await api.delete(endpoint);
  return response.data;
}

// Raw request for custom configurations
export async function request(config) {
  const response = await api.request(config);
  return response.data;
}

// One-off request without base configuration
export async function rawRequest(url, options = {}) {
  const response = await axios({
    url,
    timeout: 30000,
    ...options,
  });
  return response.data;
}

export { api };
