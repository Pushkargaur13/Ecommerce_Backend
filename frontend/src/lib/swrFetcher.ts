import api from './apiClient';

export async function swrFetcher<T = any>(url: string) {
  const res = await api.get<T>(url);
  return res.data;
}