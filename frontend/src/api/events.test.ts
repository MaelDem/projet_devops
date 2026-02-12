import { expect, test, mock, beforeEach } from "bun:test";
// Importe tes fonctions (vérifie bien le chemin vers ton dossier src)
import { listEvents, createEvent } from "./events";

/**
 * mock d'un local storage
 */
const store: Record<string, string> = {};
(globalThis as any).localStorage = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, value: string) => { store[key] = value; },
  clear: () => { for (const k in store) delete store[k]; },
};

(globalThis as any).fetch = mock();

beforeEach(() => {
  localStorage.clear();
  (globalThis.fetch as any).mockClear();
});

// Vérification de la récupérationdes données
test("listEvents récupère les données avec succès", async () => {
  const mockData = [{ id: 1, title: "Poisson de test" }];
  
  (globalThis.fetch as any).mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockData),
    } as Response)
  );

  const result = await listEvents();
  expect(result).toEqual(mockData);
  expect(globalThis.fetch).toHaveBeenCalledWith("/api/events");
});

// Vérification de la Sécurité du token
test("createEvent injecte le token Bearer dans les headers", async () => {
  const fakeToken = "mon-token-secret";
  localStorage.setItem("club_poisson_token", fakeToken);

  (globalThis.fetch as any).mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ id: 1 }),
    } as Response)
  );

  await createEvent({ title: "Nouvel Event", date: "2026-02-12", location: "Nancy" } as any);

  // recupere options du dernier appel fetch et vérifie que le header Authorization contient le token
  const fetchOptions = (globalThis.fetch as any).mock.calls[0][1];
  expect(fetchOptions.headers["Authorization"]).toBe(`Bearer ${fakeToken}`);
});

// Gestion d'erreur
test("listEvents lève une erreur si le serveur plante", async () => {
  (globalThis.fetch as any).mockImplementation(() =>
    Promise.resolve({ ok: false } as Response)
  );

  expect(listEvents()).rejects.toThrow("Failed to fetch events");
});