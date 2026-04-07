export const Role = {
  ADMIN: "ADMIN",
  VIEWER: "VIEWER",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: Role;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  user: User;
  session: {
    id: string;
    userId: string;
    token: string;
    expiresAt: string;
    ipAddress?: string;
    userAgent?: string;
  };
}
