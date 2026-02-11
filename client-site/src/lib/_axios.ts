// lib/_axios.ts
import axios, { type AxiosInstance } from "axios";
import { baseUrl } from "./config";

const _axios: AxiosInstance = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export default _axios;
