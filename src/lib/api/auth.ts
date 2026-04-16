import { RegisterForm, LoginForm } from "../types/auth";
import api from "@/lib/axios";

export async function registerUser(body: RegisterForm): Promise<void> {
    await api.post("/auth/register", {
        email: body.email,
        password: body.password,
        display_name: body.displayname,
    });
}

export async function loginUser(body: LoginForm): Promise<{ token: string }> {
    const res = await api.post("/auth/login", body);
    return res.data?.data ?? res.data;
}
