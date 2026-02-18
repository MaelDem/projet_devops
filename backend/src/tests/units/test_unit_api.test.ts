import { beforeEach, describe, expect, mock, test } from "bun:test";
import * as eventLogic from "../config/global-mocks";

// --- ÉTAPE 1 : LES MOCKS DOIVENT ÊTRE DÉCLARÉS AVANT TOUT IMPORT ---

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

// --- ÉTAPE 2 : IMPORT DYNAMIQUE DES ROUTES ---
const { handleEventRoutes } = await import("../../events/routes");

describe("Event Routes Handler", () => {
  beforeEach(() => {
    eventLogic.resetEvents();
    authReturnValue = null; // Par défaut, l'auth passe
    mock.restore();
  });

  test("GET /api/events - Liste tous les événements", async () => {
    // On ajoute ?all=true pour contourner le filtre de date NOW()
    const req = new Request("http://localhost/api/events?all=true");
    const url = new URL(req.url);

    const response = await handleEventRoutes(req, url);
    const data = await response?.json();

    expect(response?.status).toBe(200);
    expect(data.length).toBe(3);
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
});
