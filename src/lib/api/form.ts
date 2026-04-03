import { ListForm } from "../types/list";
import api from "@/lib/axios";

export async function createList(
    body: ListForm
): Promise<ListForm> {
    const res = await api.post("/lists", body);
    return res.data;
}