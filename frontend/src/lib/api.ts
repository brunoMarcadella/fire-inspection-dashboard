// frontend/src/lib/api.ts
import axios, { AxiosError } from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  timeout: 15000,
});

// (opcional) log simples de erros em dev
api.interceptors.response.use(
  (r) => r,
  (err: AxiosError) => {
    if (import.meta.env.DEV) {
      console.error("[API ERROR]", err.message, err.response?.status, err.config?.url);
    }
    return Promise.reject(err);
  }
);

/** GET com retry simples para maior resiliência */
export async function safeGet<T = any>(
  url: string,
  params?: any,
  tries = 2
): Promise<{ data: T }> {
  let lastErr: any;
  for (let i = 0; i <= tries; i++) {
    try {
      return await api.get<T>(url, { params });
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
  throw lastErr;
}
