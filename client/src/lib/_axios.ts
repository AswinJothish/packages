// lib/_axios.ts
import axios, { type AxiosInstance } from 'axios';
// import { baseUrl } from './config'; // Ensure baseUrl is defined correctly

const _axios: AxiosInstance = axios.create({
  baseURL: 'http://localhost:4000/api/user',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default _axios;
