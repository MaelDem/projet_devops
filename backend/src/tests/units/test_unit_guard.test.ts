import { expect, test, mock, describe } from "bun:test";


mock.module("../../auth/sessions.ts", () => ({
  createSession: mock(() => "fake-token-123"),
  validateSession: mock((token: string) => token === "valid-token"),
  deleteSession: mock(() => {}),
}));


const { handleAuthRoutes } = await import("../../auth/routes.js");

describe("Auth Routes System", () => {
  
  // Test de la route Login
  test("POST /api/auth/login - Succès", async () => {
    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ password: process.env.ADMIN_PASSWORD ?? "admin" }),
    });
    
    const response = await handleAuthRoutes(req, new URL(req.url));
    expect(response?.status).toBe(200);
    
    const data = await response?.json();
    expect(data.token).toBe("fake-token-123");
  });

  // Test de la route Me (Validation de session)
  test("GET /api/auth/me - Session valide", async () => {
    const req = new Request("http://localhost/api/auth/me", {
      method: "GET",
      headers: { "Authorization": "Bearer valid-token" } 
    });

    const response = await handleAuthRoutes(req, new URL(req.url));
    
    // On s'assure que la route n'a pas retourné null (404)
    expect(response).not.toBeNull();
    
    const data = await response?.json();
    expect(data.authenticated).toBe(true);
  });

  test("GET /api/auth/me - Session invalide", async () => {
    const req = new Request("http://localhost/api/auth/me", {
      method: "GET",
      headers: { "Authorization": "Bearer wrong-token" } 
    });

    const response = await handleAuthRoutes(req, new URL(req.url));
    const data = await response?.json();
    
    expect(data.authenticated).toBe(false);
  });

  // Test de la route Logout
  test("POST /api/auth/logout - Succès", async () => {
    const req = new Request("http://localhost/api/auth/logout", {
      method: "POST",
      headers: { "Authorization": "Bearer valid-token" }
    });

    const response = await handleAuthRoutes(req, new URL(req.url));
    const data = await response?.json();

    expect(data.ok).toBe(true);
  });
});