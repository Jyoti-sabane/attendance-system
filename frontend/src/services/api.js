import axios from 'axios';

// Use the production API URL
const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Rest of your code remains the same...
export const adminAPI = {
  // ... your existing API calls
};

export default api;
