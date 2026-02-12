import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

export default function App() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-cyan-100">
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-6 flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="text-3xl">🐟</span>
            <h1 className="text-2xl font-bold">Club Poisson</h1>
          </Link>
          <nav className="ml-auto flex gap-4 text-sm items-center">
            <Link to="/" className="hover:underline">
              Accueil
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/admin" className="hover:underline">
                  Admin
                </Link>
                <button
                  onClick={handleLogout}
                  className="hover:underline cursor-pointer"
                  type="button"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <Link to="/login" className="hover:underline">
                Admin
              </Link>
            )}
          </nav>
        </div>
      </header>

      <Outlet />
    </div>
  );
}
