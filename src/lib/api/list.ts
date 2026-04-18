import { ListForm, ListResponse } from "../types/list";
import api from "@/lib/axios";

export async function createList(body: ListForm): Promise<ListResponse> {
    const res = await api.post("/lists", body);
    return res.data?.data ?? res.data;
}

export async function getListUser(): Promise<ListResponse[]> {
    const res = await api.get("/lists")
    return res.data?.data ?? res.data
}