import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import api from "../lib/axios";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch (err) {
      // continue even if API call fails
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-yellow-500">
            LegoApp
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-600 hover:text-gray-900 text-sm">
              Search
            </Link>
            {user ? (
              <>
                <Link
                  to="/collection"
                  className="text-gray-600 hover:text-gray-900 text-sm"
                >
                  My Collection
                </Link>
                <span className="text-sm text-gray-500">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 text-sm"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-sm font-medium px-4 py-2 rounded-lg"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
