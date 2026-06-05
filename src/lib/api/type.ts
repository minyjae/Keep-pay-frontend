import { TypeResponse } from "../types/type";
import api from "@/lib/axios";

export async function getTypes(): Promise<TypeResponse[]> {
  const res = await api.get("/api/types");
  return res.data?.data ?? res.data;
}
