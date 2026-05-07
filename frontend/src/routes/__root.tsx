import {
  createRootRoute,
  Outlet,
  useNavigate,
  useRouterState,
  Link,
} from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/axios";

export const Route = createRootRoute({
  component: RootLayout,
});

function ThemesDropdown({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();

  const { data: featuredThemes } = useQuery({
    queryKey: ["themes", "featured"],
    queryFn: () => api.get("/themes/featured").then((r) => r.data),
    staleTime: Infinity,
  });

  const handleThemeClick = (id: number, name: string) => {
    navigate({ to: "/", search: { q: "", theme_id: id, theme_name: name } });
    onClose();
  };

  return (
    <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 overflow-hidden">
      <div className="p-2">
        {featuredThemes?.map((t: any) => (
          <button
            key={t.id}
            onClick={() => handleThemeClick(t.id, t.name)}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-yellow-50 hover:text-gray-900 rounded-xl transition-colors flex items-center gap-3 cursor-pointer"
          >
            {t.img_url && (
              <img
                src={t.img_url}
                alt={t.name}
                className="w-8 h-8 object-contain rounded bg-gray-50"
              />
            )}
            {t.name}
          </button>
        ))}
      </div>
      <div className="border-t border-gray-100 p-2">
        <Link
          to="/themes"
          onClick={onClose}
          className="w-full text-left px-4 py-2.5 text-sm font-medium text-yellow-600 hover:bg-yellow-50 rounded-xl transition-colors flex items-center justify-between cursor-pointer"
        >
          View all themes
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}

function RootLayout() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const isHome = routerState.location.pathname === "/";
  const [navSearch, setNavSearch] = useState("");
  const [themesOpen, setThemesOpen] = useState(false);
  const themesRef = useRef<HTMLDivElement>(null);
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  // Sync navbar input with URL q param when on home page
  useEffect(() => {
    if (isHome) {
      const params = new URLSearchParams(routerState.location.searchStr);
      setNavSearch(params.get("q") ?? "");
    } else {
      setNavSearch("");
    }
  }, [routerState.location.searchStr, isHome]);

  // Close themes dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (themesRef.current && !themesRef.current.contains(e.target as Node)) {
        setThemesOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (value: string) => {
    setNavSearch(value);
    if (isHome) {
      navigate({
        to: "/",
        search: { q: value, theme_id: null, theme_name: "" },
        replace: true,
      });
    } else if (value.length >= 2) {
      navigate({
        to: "/",
        search: { q: value, theme_id: null, theme_name: "" },
      });
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch {
      // continue
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          {/* Logo */}
          <a href="/" className="text-xl font-bold text-yellow-500 shrink-0">
            LegoApp
          </a>

          {/* Search input */}
          <div className="flex-1 max-w-md">
            <input
              type="text"
              value={navSearch}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search sets..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          {/* Themes dropdown */}
          <div ref={themesRef} className="relative shrink-0">
            <button
              onClick={() => setThemesOpen((o) => !o)}
              className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                themesOpen
                  ? "bg-yellow-50 text-yellow-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Themes
              <span
                className={`text-xs transition-transform ${themesOpen ? "rotate-180" : ""}`}
              >
                ▾
              </span>
            </button>
            {themesOpen && (
              <ThemesDropdown onClose={() => setThemesOpen(false)} />
            )}
          </div>

          {/* Auth links */}
          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <>
                <a
                  href="/collection"
                  className="text-gray-600 hover:text-gray-900 text-sm"
                >
                  My Collection
                </a>
                <span className="text-sm text-gray-500">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className="text-gray-600 hover:text-gray-900 text-sm"
                >
                  Login
                </a>
                <a
                  href="/register"
                  className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-sm font-medium px-4 py-2 rounded-lg"
                >
                  Register
                </a>
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
