import { beforeEach, describe, expect, mock, test } from "bun:test";
import * as eventLogic from "../config/global-mocks";

// Mock du Repository
mock.module("../../events/repository", () => ({
  listEvents: mock(eventLogic.listEvents),
  getEvent: mock(eventLogic.getEvent),
  createEvent: mock(eventLogic.createEvent),
  updateEvent: mock(eventLogic.updateEvent),
  deleteEvent: mock(eventLogic.deleteEvent),
}));

// Mock du Guard (on utilise une variable locale pour contrôler le retour)
let authReturnValue: Response | null = null;
mock.module("../../auth/guard", () => ({
  requireAuth: mock(() => authReturnValue),
}));

const { handleEventRoutes } = await import("../../events/routes");

describe("Event Routes Handler", () => {
  beforeEach(() => {
    eventLogic.resetEvents();
    authReturnValue = null; // Par défaut, l'auth passe
    mock.restore();
  });

  test("GET /api/events - Liste les événements", async () => {
    // On ajoute ?all=true pour contourner le filtre de date NOW()
    const req = new Request("http://localhost/api/events?all=true");
    const url = new URL(req.url);

    const response = await handleEventRoutes(req, url);
    const data = await response?.json();

    expect(response?.status).toBe(200);
    expect(data.length).toBe(3);
  });

  test("GET /api/events/:id - Retourne un événement", async () => {
    const req = new Request("http://localhost/api/events/1");
    const url = new URL(req.url);

    const response = await handleEventRoutes(req, url);
    const data = await response?.json();

    expect(response?.status).toBe(200);
    expect(data.id).toBe(1);
  });

  test("GET /api/events/:id - 404 si événement introuvable", async () => {
    const req = new Request("http://localhost/api/events/999");
    const url = new URL(req.url);

    const response = await handleEventRoutes(req, url);
    const data = await response?.json();

    expect(response?.status).toBe(404);
    expect(data.error).toBe("Not found");
  });

  test("POST /api/events - Crée un événement (Auth OK)", async () => {
    authReturnValue = null; // On force explicitement le succès

    const payload = { title: "Soirée Bun", date: "2026-01-01" };
    const req = new Request("http://localhost/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const response = await handleEventRoutes(req, new URL(req.url));
    expect(response?.status).toBe(201);

    const data = await response?.json();
    expect(data.title).toBe("Soirée Bun");
  });

  test("POST /api/events - 400 si title/date manquants", async () => {
    authReturnValue = null;

    const req = new Request("http://localhost/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Sans date" }),
    });

    const response = await handleEventRoutes(req, new URL(req.url));
    const data = await response?.json();

    expect(response?.status).toBe(400);
    expect(data.error).toBe("title and date are required");
  });

  test("PUT /api/events/:id - Met à jour un événement (Auth OK)", async () => {
    authReturnValue = null;

    const req = new Request("http://localhost/api/events/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Event modifié", date: "2026-01-01" }),
    });

    const response = await handleEventRoutes(req, new URL(req.url));
    const data = await response?.json();

    expect(response?.status).toBe(200);
    expect(data.id).toBe(1);
    expect(data.title).toBe("Event modifié");
  });

  test("DELETE /api/events/:id - Supprime l'événement", async () => {
    authReturnValue = null;

    const req = new Request("http://localhost/api/events/1", {
      method: "DELETE",
    });
    const response = await handleEventRoutes(req, new URL(req.url));

    expect(response?.status).toBe(200);
    const data = await response?.json();
    expect(data.ok).toBe(true);
  });

  test("POST /api/events - Échec si non authentifié", async () => {
    // On simule une erreur 401
    authReturnValue = Response.json({ error: "Unauthorized" }, { status: 401 });

    const req = new Request("http://localhost/api/events", {
      method: "POST",
      body: JSON.stringify({ title: "Test", date: "2026" }),
    });
    const response = await handleEventRoutes(req, new URL(req.url));

    expect(response?.status).toBe(401);
  });

  test("GET /api/unknown - Route non gérée retourne null", async () => {
    const req = new Request("http://localhost/api/unknown");
    const response = await handleEventRoutes(req, new URL(req.url));
    expect(response).toBeNull();
  });
});
