import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteEvent, listEvents } from "../api/events";
import type { Event } from "../types";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: besoin d'y entrer à chaque refreshkey
  useEffect(() => {
    let cancelled = false;
    listEvents(true)
      .then((data) => {
        if (!cancelled) setEvents(data);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  async function handleDelete(id: number) {
    if (!confirm("Supprimer cet événement ?")) return;
    await deleteEvent(id);
    setRefreshKey((k) => k + 1);
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-blue-900">
          Gérer les événements
        </h2>
        <Link
          to="/admin/events/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Nouvel événement
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : events.length === 0 ? (
        <p className="text-gray-500">Aucun événement pour le moment.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-2 text-sm font-semibold text-gray-700">
                  Titre
                </th>
                <th className="py-3 px-2 text-sm font-semibold text-gray-700">
                  Date
                </th>
                <th className="py-3 px-2 text-sm font-semibold text-gray-700">
                  Lieu
                </th>
                <th className="py-3 px-2 text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b border-gray-100">
                  <td className="py-3 px-2">{event.title}</td>
                  <td className="py-3 px-2 text-sm text-gray-600">
                    {new Date(event.date).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="py-3 px-2 text-sm text-gray-600">
                    {event.location}
                  </td>
                  <td className="py-3 px-2 flex gap-2">
                    <Link
                      to={`/admin/events/${event.id}/edit`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Modifier
                    </Link>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="text-red-600 hover:underline text-sm"
                      type="button"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
