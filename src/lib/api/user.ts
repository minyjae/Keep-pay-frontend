import { UserResponse } from "../types/user";
import api from "@/lib/axios";


export async function getUser(): Promise<UserResponse> {
    const res = await api.get("/api/users");
    return res.data?.data ?? res.data;
}