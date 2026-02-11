import axios from "axios";
import { toast } from "sonner";
import { baseUrl } from "./config";

let token = sessionStorage.getItem("token");

export const _axios = axios.create({
  baseURL: baseUrl,
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

_axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {        
    if (error.response.status === 401) {
      localStorage.clear();
      sessionStorage.clear();
      toast.error("Session Expired! Login Again");
      window.location.href = "/";
      window.alert("Session Expired! Login Again");
    }
    return Promise.reject(error);
  }
);
