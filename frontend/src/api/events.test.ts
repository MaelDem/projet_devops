import { beforeEach, expect, mock, test } from "bun:test";
import type { Event, EventInput } from "../types";
// Importe tes fonctions (vérifie bien le chemin vers ton dossier src)
import { createEvent, listEvents } from "./events";

type FetchArgs = [input: RequestInfo | URL, init?: RequestInit];
type FetchReturn = Promise<Response>;

type MockFetch = ((...args: FetchArgs) => FetchReturn) & {
  mock: {
    calls: FetchArgs[];
  };
  mockClear: () => void;
  mockImplementation: (impl: (...args: FetchArgs) => FetchReturn) => unknown;
};

/**
 * mock d'un local storage
 */
const store: Record<string, string> = {};

const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => {
    store[key] = value;
  },
  removeItem: (key: string) => {
    delete store[key];
  },
  clear: () => {
    for (const k of Object.keys(store)) {
      delete store[k];
    }
  },
  key: (index: number) => Object.keys(store)[index] ?? null,
  get length() {
    return Object.keys(store).length;
  },
} satisfies Pick<
  Storage,
  "getItem" | "setItem" | "removeItem" | "clear" | "key" | "length"
>;

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  configurable: true,
});

const fetchMock = mock() as unknown as MockFetch;
(globalThis as unknown as { fetch: MockFetch }).fetch = fetchMock;

beforeEach(() => {
  localStorage.clear();
  fetchMock.mockClear();
});

// Vérification de la récupérationdes données
test("listEvents récupère les données avec succès", async () => {
  const mockData: Event[] = [
    {
      id: 1,
      title: "Poisson de test",
      description: "",
      date: "2026-02-12",
      end_date: null,
      location: "",
      image_url: null,
      max_participants: null,
      created_at: "2026-02-12T00:00:00.000Z",
      updated_at: "2026-02-12T00:00:00.000Z",
    },
  ];

  fetchMock.mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockData),
    } as Response),
  );

  const result = await listEvents();
  expect(result).toEqual(mockData);
  expect(globalThis.fetch).toHaveBeenCalledWith("/api/events");
});

// Vérification de la Sécurité du token
test("createEvent injecte le token Bearer dans les headers", async () => {
  const fakeToken = "mon-token-secret";
  localStorage.setItem("club_poisson_token", fakeToken);

  fetchMock.mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ id: 1 }),
    } as Response),
  );

  const input: EventInput = {
    title: "Nouvel Event",
    date: "2026-02-12",
    location: "Nancy",
  };

  await createEvent(input);

  // recupere options du dernier appel fetch et vérifie que le header Authorization contient le token
  const fetchOptions = fetchMock.mock.calls[0]?.[1];
  if (!fetchOptions) throw new Error("Missing fetch options");
  const headersRecord = fetchOptions.headers as unknown as Record<
    string,
    string
  >;
  expect(headersRecord.Authorization).toBe(`Bearer ${fakeToken}`);
});

// Gestion d'erreur
test("listEvents lève une erreur si le serveur plante", async () => {
  fetchMock.mockImplementation(() =>
    Promise.resolve({ ok: false } as Response),
  );

  expect(listEvents()).rejects.toThrow("Failed to fetch events");
});
