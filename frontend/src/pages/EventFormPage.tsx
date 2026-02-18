import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createEvent, getEvent, updateEvent } from "../api/events";
import type { EventInput } from "../types";

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EventFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<EventInput>({
    title: "",
    description: "",
    date: "",
    end_date: null,
    location: "",
    image_url: null,
    max_participants: null,
  });
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!id) return;
    getEvent(Number(id))
      .then((event) =>
        setForm({
          title: event.title,
          description: event.description,
          date: toDatetimeLocal(event.date),
          end_date: event.end_date ? toDatetimeLocal(event.end_date) : null,
          location: event.location,
          image_url: event.image_url,
          max_participants: event.max_participants,
        }),
      )
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value || null }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isEdit) {
      await updateEvent(Number(id), form);
    } else {
      await createEvent(form);
    }
    navigate("/admin");
  }

  if (loading) return <p className="p-8 text-gray-500">Chargement...</p>;

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-blue-900 mb-6">
        {isEdit ? "Modifier l'événement" : "Nouvel événement"}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Titre *</span>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Description</span>
          <textarea
            name="description"
            value={form.description ?? ""}
            onChange={handleChange}
            rows={4}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">
              Date de début *
            </span>
            <input
              type="datetime-local"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">
              Date de fin
            </span>
            <input
              type="datetime-local"
              name="end_date"
              value={form.end_date ?? ""}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Lieu</span>
          <input
            name="location"
            value={form.location ?? ""}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">
            URL de l'image
          </span>
          <input
            name="image_url"
            value={form.image_url ?? ""}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">
            Participants max
          </span>
          <input
            type="number"
            name="max_participants"
            value={form.max_participants ?? ""}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                max_participants: e.target.value
                  ? Number(e.target.value)
                  : null,
              }))
            }
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
        </label>

        <div className="flex gap-3 mt-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {isEdit ? "Mettre à jour" : "Créer"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin")}
            className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition"
          >
            Annuler
          </button>
        </div>
      </form>
    </main>
  );
}
