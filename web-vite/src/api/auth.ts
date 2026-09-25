import { apiClient } from "./client";

export type Account = {
  username: string;
  name: string;
  email: string;
  role: string;
};

export async function login(username: string, password: string) {
  const response = await apiClient.post<{ token: string; account: Account }>("/auth/login", {
    username,
    password,
  });
  return response.data;
}

export async function logout() {
  await apiClient.post("/auth/logout");
}
