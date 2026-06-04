import { ListForm, ListUpdateForm, ListResponse } from "../types/list";
import api from "@/lib/axios";

export async function createList(body: ListForm): Promise<ListResponse> {
  const res = await api.post("/lists", body);
  return res.data?.data ?? res.data;
}

export async function getListUser(): Promise<ListResponse[]> {
  const res = await api.get("/lists");
  return res.data?.data ?? res.data;
}

export async function updateList(body: ListUpdateForm): Promise<ListResponse> {
  const res = await api.put("/lists", body);
  return res.data?.data ?? res.data;
}

export async function deleteList(id: string): Promise<void> {
  await api.delete("/lists", { data: { id } });
}
