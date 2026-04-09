import { describe, it, expect, vi, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../tests/mocks/server";
import { apiClient, ApiError, AuthError, setAuthErrorHandler } from "./api-client";

const API_URL = "https://ledgerly-service.vercel.app";

describe("apiClient", () => {
  beforeEach(() => {
    setAuthErrorHandler(null as unknown as () => void);
  });

  it("makes GET request and returns JSON", async () => {
    const result = await apiClient<{ status: string }>("/");
    expect(result).toEqual({ status: "ok" });
  });

  it("sends credentials: include", async () => {
    let capturedInit: RequestInit | undefined;
    server.use(
      http.get(`${API_URL}/api/test-creds`, ({ request }) => {
        capturedInit = { credentials: request.credentials };
        return HttpResponse.json({ ok: true });
      }),
    );
    await apiClient("/api/test-creds");
    expect(capturedInit?.credentials).toBe("include");
  });

  it("sends Content-Type: application/json by default", async () => {
    let contentType: string | null = null;
    server.use(
      http.post(`${API_URL}/api/test-headers`, ({ request }) => {
        contentType = request.headers.get("Content-Type");
        return HttpResponse.json({ ok: true });
      }),
    );
    await apiClient("/api/test-headers", {
      method: "POST",
      body: JSON.stringify({ test: true }),
    });
    expect(contentType).toBe("application/json");
  });

  it("throws AuthError on 401", async () => {
    server.use(
      http.get(`${API_URL}/api/unauthorized`, () => {
        return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
      }),
    );
    await expect(apiClient("/api/unauthorized")).rejects.toThrow(AuthError);
  });

  it("calls auth error handler on 401", async () => {
    const handler = vi.fn();
    setAuthErrorHandler(handler);
    server.use(
      http.get(`${API_URL}/api/unauthorized`, () => {
        return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
      }),
    );
    await expect(apiClient("/api/unauthorized")).rejects.toThrow();
    expect(handler).toHaveBeenCalledOnce();
  });

  it("throws ApiError on 400 with server message", async () => {
    server.use(
      http.post(`${API_URL}/api/bad-request`, () => {
        return HttpResponse.json({ message: "Nama sudah ada" }, { status: 400 });
      }),
    );
    try {
      await apiClient("/api/bad-request", { method: "POST" });
      expect.fail("Should throw");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(400);
      expect((err as ApiError).message).toBe("Nama sudah ada");
    }
  });

  it("throws ApiError with default message when body has no message", async () => {
    server.use(
      http.get(`${API_URL}/api/server-error`, () => {
        return HttpResponse.json({}, { status: 500 });
      }),
    );
    try {
      await apiClient("/api/server-error");
      expect.fail("Should throw");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).message).toBe("Terjadi kesalahan");
    }
  });

  it("returns undefined for 204 No Content", async () => {
    server.use(
      http.delete(`${API_URL}/api/no-content`, () => {
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const result = await apiClient("/api/no-content", { method: "DELETE" });
    expect(result).toBeUndefined();
  });
});

describe("ApiError", () => {
  it("has correct name and properties", () => {
    const err = new ApiError(404, "Not found");
    expect(err.name).toBe("ApiError");
    expect(err.status).toBe(404);
    expect(err.message).toBe("Not found");
    expect(err).toBeInstanceOf(Error);
  });
});

describe("AuthError", () => {
  it("has correct name", () => {
    const err = new AuthError("Session expired");
    expect(err.name).toBe("AuthError");
    expect(err.message).toBe("Session expired");
    expect(err).toBeInstanceOf(Error);
  });
});
