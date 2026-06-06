import { ListForm, ListUpdateForm, ListResponse, ListSummary } from "../types/list";
import api from "@/lib/axios";

export async function createList(body: ListForm): Promise<ListResponse> {
  const res = await api.post("/api/lists", body);
  return res.data?.data ?? res.data;
}

export type ListFilter = {
  year?: number;
  month?: number;
  day?: number;
};

export async function getListUser(filter: ListFilter = {}): Promise<ListResponse[]> {
  const params: Record<string, number> = {};
  if (filter.year) params.year = filter.year;
  if (filter.month) params.month = filter.month;
  if (filter.day) params.day = filter.day;

  const res = await api.get("/api/lists", { params });
  return res.data?.data ?? res.data;
}

export async function updateList(body: ListUpdateForm): Promise<ListResponse> {
  const res = await api.put("/api/lists", body);
  return res.data?.data ?? res.data;
}

export async function deleteList(id: string): Promise<void> {
  await api.delete("/api/lists", { data: { id } });
}

export async function getSummary(filter: ListFilter = {}): Promise<ListSummary> {
  const params: Record<string, number> = {};
  if (filter.year) params.year = filter.year;
  if (filter.month) params.month = filter.month;
  if (filter.day) params.day = filter.day;

  const res = await api.get("/api/lists/summary", { params });
  return res.data?.data ?? res.data;
}
export async function getWeekSummary(): Promise<ListSummary> {
  const res = await api.get("/api/lists/summary/week");
  return res.data?.data ?? res.data;
}
export async function getMonthSummary(): Promise<ListSummary> {
  const res = await api.get("/api/lists/summary/month");
  return res.data?.data ?? res.data;
}
