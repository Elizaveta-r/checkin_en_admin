import axios from "axios";
import { store } from "../../store/store";
import { logout } from "../../store/slices/userSlice";

// export const API_URL = "http://192.168.0.121:6480/v1"; // local test home
// export const API_URL = "http://192.168.3.94:6480/v1"; // local test
// export const API_URL = "https://digital.tab-is.com:7082"; // dev
// export const API_URL = "https://pulse.tab-is.com:6443/v1"; // prod
export const API_URL = "https://api.24checkin.ru/v1";

const $host = axios.create({
  baseURL: API_URL,
});

const $authHost = axios.create({
  baseURL: API_URL,
});

$authHost.interceptors.request.use((config) => {
  const token = localStorage.getItem("@storage_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

// Перехватчик ответов - проверяем токен
$authHost.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("⚠️ Token is invalid or has expired!");

      localStorage.clear();
      store.dispatch(logout());

      const channel = new BroadcastChannel("auth");
      channel.postMessage("logout");
      channel.close();

      window.location.replace("/platform/auth");
    }
    return Promise.reject(error);
  },
);

export { $authHost, $host };
