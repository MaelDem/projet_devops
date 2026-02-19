import { useEffect, useState } from "react";
import { listEvents } from "../api/events";
import EventCard from "../components/EventCard";
import type { Event } from "../types";

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listEvents()
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <section className="text-center mb-12">
        <h2 className="text-4xl font-bold text-blue-900 mb-4">
          Bienvenue au Club Poisson
        </h2>
        <p className="text-lg text-blue-700 max-w-2xl mx-auto">
          Une communauté pour les passionnés d'aquariophilie. Partagez votre
          passion, apprenez des autres aquariophiles et aidez nos amis
          aquatiques à s'épanouir.
        </p>
      </section>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-xl font-semibold text-blue-800 mb-2">
            Communauté
          </h3>
          <p className="text-gray-600">
            Échangez avec d'autres passionnés de poissons et partagez vos
            expériences.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-xl font-semibold text-blue-800 mb-2">Savoir</h3>
          <p className="text-gray-600">
            Apprenez l'entretien des espèces, la mise en place d'aquariums et la
            chimie de l'eau.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-xl font-semibold text-blue-800 mb-2">
            Conservation
          </h3>
          <p className="text-gray-600">
            Soutenez les efforts de protection des écosystèmes aquatiques et des
            espèces menacées.
          </p>
        </div>
      </div>

      <section>
        <h2 className="text-2xl font-bold text-blue-900 mb-6">
          Événements à venir
        </h2>
        {loading ? (
          <p className="text-gray-500">Chargement des événements...</p>
        ) : events.length === 0 ? (
          <p className="text-gray-500">Aucun événement à venir.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
