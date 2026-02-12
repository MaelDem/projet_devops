import { handleAuthRoutes } from "./auth/routes.ts";
import { migrate } from "./db/migrate.ts";
import { handleEventRoutes } from "./events/routes.ts";

await migrate();

function corsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    // Health check
    if (url.pathname === "/api/health") {
      return Response.json({ status: "ok" }, { headers: corsHeaders() });
    }

    // Auth routes
    const authResponse = await handleAuthRoutes(req, url);
    if (authResponse) {
      for (const [key, value] of Object.entries(corsHeaders())) {
        authResponse.headers.set(key, value);
      }
      return authResponse;
    }

    // Event routes
    const eventResponse = await handleEventRoutes(req, url);
    if (eventResponse) {
      // Add CORS headers to the response
      for (const [key, value] of Object.entries(corsHeaders())) {
        eventResponse.headers.set(key, value);
      }
      return eventResponse;
    }

    return Response.json(
      { error: "Not found" },
      { status: 404, headers: corsHeaders() },
    );
  },
});

console.log(`Server running at http://localhost:${server.port}`);
