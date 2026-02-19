import { createSession, deleteSession, validateSession } from "./sessions.ts";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin";

export function extractBearerToken(req: Request): string | null {
  const header = req.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7);
}

export async function handleAuthRoutes(
  req: Request,
  url: URL,
): Promise<Response | null> {
  const { pathname } = url;
  const method = req.method;

  // POST /api/auth/login
  if (pathname === "/api/auth/login" && method === "POST") {
    const body = (await req.json()) as { password?: string };
    if (body.password !== ADMIN_PASSWORD) {
      return Response.json({ error: "Invalid password" }, { status: 401 });
    }
    const token = createSession();
    return Response.json({ token });
  }

  // GET /api/auth/me
  if (pathname === "/api/auth/me" && method === "GET") {
    const token = extractBearerToken(req);
    const authenticated = token !== null && validateSession(token);
    return Response.json({ authenticated });
  }

  // POST /api/auth/logout
  if (pathname === "/api/auth/logout" && method === "POST") {
    const token = extractBearerToken(req);
    if (token) deleteSession(token);
    return Response.json({ ok: true });
  }

  return null;
}
