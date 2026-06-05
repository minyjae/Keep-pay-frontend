import { ListForm, ListUpdateForm, ListResponse, ListSummary } from "../types/list";
import api from "@/lib/axios";

export async function createList(body: ListForm): Promise<ListResponse> {
  const res = await api.post("/api/lists", body);
  return res.data?.data ?? res.data;
}

export async function getListUser(): Promise<ListResponse[]> {
  const res = await api.get("/api/lists");
  return res.data?.data ?? res.data;
}

export async function updateList(body: ListUpdateForm): Promise<ListResponse> {
  const res = await api.put("/api/lists", body);
  return res.data?.data ?? res.data;
}

export async function deleteList(id: string): Promise<void> {
  await api.delete("/api/lists", { data: { id } });
}

export async function getSummary(): Promise<ListSummary> {
  const res = await api.get("/api/lists/summary");
  return res.data?.data ?? res.data;
}
