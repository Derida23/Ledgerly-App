import { http, HttpResponse } from "msw";

const API_URL = "http://localhost:3000";

export const handlers = [
  http.get(`${API_URL}/`, () => {
    return HttpResponse.json({ status: "ok" });
  }),

  http.get(`${API_URL}/api/auth/session`, () => {
    return HttpResponse.json({
      user: {
        id: "test-user-id",
        name: "Test User",
        email: "test@example.com",
        role: "ADMIN",
        image: null,
        emailVerified: true,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      session: {
        id: "test-session-id",
        userId: "test-user-id",
        token: "test-token",
        expiresAt: "2026-12-31T00:00:00.000Z",
      },
    });
  }),
];
