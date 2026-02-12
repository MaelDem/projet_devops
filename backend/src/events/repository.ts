import sql from "../db/connection.ts";
import type { Event, EventInput } from "../types.ts";

export async function listEvents(all = false): Promise<Event[]> {
  if (all) {
    return sql<Event[]>`SELECT * FROM events ORDER BY date ASC`;
  }
  return sql<
    Event[]
  >`SELECT * FROM events WHERE date >= NOW() ORDER BY date ASC`;
}

export async function getEvent(id: number): Promise<Event | undefined> {
  const rows = await sql<Event[]>`SELECT * FROM events WHERE id = ${id}`;
  return rows[0];
}

export async function createEvent(input: EventInput): Promise<Event> {
  const rows = await sql<Event[]>`
    INSERT INTO events (title, description, date, end_date, location, image_url, max_participants)
    VALUES (
      ${input.title},
      ${input.description ?? ""},
      ${input.date},
      ${input.end_date ?? null},
      ${input.location ?? ""},
      ${input.image_url ?? null},
      ${input.max_participants ?? null}
    )
    RETURNING *
  `;
  return rows[0];
}

export async function updateEvent(
  id: number,
  input: EventInput,
): Promise<Event | undefined> {
  const rows = await sql<Event[]>`
    UPDATE events SET
      title = ${input.title},
      description = ${input.description ?? ""},
      date = ${input.date},
      end_date = ${input.end_date ?? null},
      location = ${input.location ?? ""},
      image_url = ${input.image_url ?? null},
      max_participants = ${input.max_participants ?? null},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0];
}

export async function deleteEvent(id: number): Promise<boolean> {
  const rows = await sql`DELETE FROM events WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}
