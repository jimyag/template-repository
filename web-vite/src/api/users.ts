import { apiClient } from "./client";

export const roles = ["admin", "editor", "viewer"] as const;
export const statuses = ["active", "disabled"] as const;

export type Role = (typeof roles)[number];
export type Status = (typeof statuses)[number];

export type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: Status;
  createdAt: string;
};

export type UserInput = Pick<User, "name" | "email" | "role" | "status">;

export type UserQuery = {
  q?: string;
  role?: string;
  status?: string;
  page?: number;
  pageSize?: number;
};

export type Page<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type DashboardData = {
  stats: { total: number; active: number; disabled: number; admins: number };
  recentUsers: User[];
};

export async function listUsers(query: UserQuery, signal?: AbortSignal) {
  const response = await apiClient.get<Page<User>>("/users", { params: query, signal });
  return response.data;
}

export async function getUser(id: string, signal?: AbortSignal) {
  const response = await apiClient.get<User>(`/users/${id}`, { signal });
  return response.data;
}

export async function createUser(input: UserInput) {
  const response = await apiClient.post<User>("/users", input);
  return response.data;
}

export async function updateUser(id: number, input: UserInput) {
  const response = await apiClient.put<User>(`/users/${id}`, input);
  return response.data;
}

export async function deleteUser(id: number) {
  await apiClient.delete(`/users/${id}`);
}

export async function getDashboard(signal?: AbortSignal) {
  const response = await apiClient.get<DashboardData>("/dashboard", { signal });
  return response.data;
}
