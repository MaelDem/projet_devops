import { type FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const err = await login(password);
    if (err) {
      setError(err);
      setSubmitting(false);
    }
  }

  return (
    <main className="max-w-sm mx-auto mt-24 px-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Connexion Admin
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </main>
  );
}
