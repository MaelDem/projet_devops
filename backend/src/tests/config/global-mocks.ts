import type { Event, EventInput } from "../../types";

const seedEvents: Event[] = [
    {
        id: 1,
        title: "Event 1",
        description: "Description 1",
        date: "2024-01-01T10:00:00Z",
        end_date: "2024-01-01T12:00:00Z",
        location: "Location 1",
        image_url: "https://example.com/image1.jpg",
        max_participants: 10,
        created_at: "2024-01-01T09:00:00Z",
        updated_at: "2024-01-01T09:00:00Z",
    },
    {
        id: 2,
        title: "Event 2",
        description: "Description 2",
        date: "2024-02-01T10:00:00Z",
        end_date: "2024-02-01T12:00:00Z",
        location: "Location 2",
        image_url: "https://example.com/image2.jpg",
        max_participants: 20,
        created_at: "2024-02-01T09:00:00Z",
        updated_at: "2024-02-01T09:00:00Z",
    },
    {
        id: 3,
        title: "Event 3",
        description: "Description 3",
        date: "2024-03-01T10:00:00Z",
        end_date: "2024-03-01T12:00:00Z",
        location: "Location 3",
        image_url: "https://example.com/image3.jpg",
        max_participants: 30,
        created_at: "2024-03-01T09:00:00Z",
        updated_at: "2024-03-01T09:00:00Z",
    },
];

let events: Event[] = structuredClone(seedEvents);

function resetEvents(): void {
    events = structuredClone(seedEvents);
}

function listEvents(): Event[] {
    return events.slice();
}

function getEvent(id: number): Event | undefined {
    return events.find((event) => event.id === id);
}

function createEvent(input: EventInput): Event {
    const now = new Date().toISOString();
    const nextId = events.length ? Math.max(...events.map((event) => event.id)) + 1 : 1;

    const newEvent: Event = {
        id: nextId,
        title: input.title,
        description: input.description ?? "",
        date: input.date,
        end_date: input.end_date ?? null,
        location: input.location ?? "",
        image_url: input.image_url ?? null,
        max_participants: input.max_participants ?? null,
        created_at: now,
        updated_at: now,
    };

    events = [...events, newEvent];
    return newEvent;
}

function updateEvent(id: number, input: EventInput): Event | undefined {
    const index = events.findIndex((event) => event.id === id);
    if (index < 0) {
        return undefined;
    }

    const existing = events[index];
    const updated: Event = {
        ...existing,
        title: input.title ?? existing.title,
        description: input.description ?? existing.description,
        date: input.date ?? existing.date,
        end_date: input.end_date ?? existing.end_date,
        location: input.location ?? existing.location,
        image_url: input.image_url ?? existing.image_url,
        max_participants: input.max_participants ?? existing.max_participants,
        updated_at: new Date().toISOString(),
    };

    events = events.map((event) => (event.id === id ? updated : event));
    return updated;
}

function deleteEvent(id: number): boolean {
    const before = events.length;
    events = events.filter((event) => event.id !== id);
    return events.length < before;
}

export { events, resetEvents, listEvents, getEvent, createEvent, updateEvent, deleteEvent };