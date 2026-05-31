import { api } from '../lib/axios';
import { UserRole, UserStatus } from './types';

export interface UserResponse {
  id: string;
  username: string;
  phone: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  dob: string | null;
  status: UserStatus;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export enum UsersSortField {
  USERNAME = 'username',
  PHONE = 'phone',
  CREATED_AT = 'created_at',
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  q?: string;
  sort?: 'asc' | 'desc';
  sortBy?: UsersSortField;
  status?: UserStatus;
  roleId?: string;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateUserPayload {
  username: string;
  phone: string;
  email?: string;
  fullName?: string;
}

export interface UpdateUserPayload {
  email?: string | null;
  fullName?: string | null;
  status?: UserStatus;
  firebaseId?: string | null;
}

export interface UpdateProfilePayload {
  email?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  dob?: string | null;
}

export interface AssignRolesPayload {
  role: UserRole;
}

const buildParams = (params: Record<string, unknown> = {}): Record<string, string | number | undefined> => {
  const result: Record<string, string | number | undefined> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      result[key] = value as string | number;
    }
  }
  return result;
};

export const userQuery = {
  me: () =>
    api.get<UserResponse>('/users/me').then((res) => res.data),

  updateMe: (payload: UpdateProfilePayload) =>
    api.patch<UserResponse>('/users/me', payload).then((res) => res.data),

  create: (payload: CreateUserPayload) =>
    api.post<UserResponse>('/users', payload).then((res) => res.data),

  list: (params: ListUsersParams = {}) => {
    const query = buildParams({
      page: params.page,
      limit: params.limit,
      q: params.q,
      sort: params.sort,
      sortBy: params.sortBy,
      status: params.status,
      roleId: params.roleId,
    });
    return api.get<PaginatedResponse<UserResponse>>('/users', { params: query }).then((res) => res.data);
  },

  findOne: (id: string) =>
    api.get<UserResponse>(`/users/${id}`).then((res) => res.data),

  update: (id: string, payload: UpdateUserPayload) =>
    api.patch<UserResponse>(`/users/${id}`, payload).then((res) => res.data),

  assignRoles: (id: string, payload: AssignRolesPayload) =>
    api.put<UserResponse>(`/users/${id}/roles`, payload).then((res) => res.data),
};
