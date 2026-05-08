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
import { ErrorBoundary } from "../components/ErrorBoundary";

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => (
    <div className="text-center py-16">
      <p className="text-6xl font-bold text-yellow-400 mb-4">404</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
      <p className="text-gray-500 text-sm mb-8">
        The page you're looking for doesn't exist.
      </p>
      <a
        href="/"
        className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium px-6 py-2.5 rounded-xl text-sm inline-block"
      >
        Go home
      </a>
    </div>
  ),
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

function VerificationBanner() {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    try {
      await api.post("/email/resend");
      setSent(true);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  if (sent)
    return (
      <div className="bg-green-500 text-white text-sm px-6 py-2.5 text-center">
        Verification email sent — check your inbox.
      </div>
    );

  return (
    <div className="bg-yellow-400 text-gray-900 text-sm px-6 py-2.5 flex items-center justify-center gap-3">
      <span>
        Please verify your email address
        {user?.email ? ` (${user.email})` : ""} to access all features.
      </span>
      <button
        onClick={handleResend}
        disabled={loading}
        className="bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
      >
        {loading ? "Sending..." : "Resend email"}
      </button>
    </div>
  );
}
function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-16 py-8 px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-yellow-500">LegoApp</p>
          <p className="text-xs text-gray-400 mt-1">
            Track your LEGO collection
          </p>
        </div>
        <div className="flex gap-6 text-xs text-gray-400">
          <span>Data from Rebrickable</span>
          <span>Marketplace via BrickLink</span>
        </div>
        <p className="text-xs text-gray-400">
          Built by{" "}
          <a
            href="https://timotejlovrec.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-600"
          >
            Timotej Lovrec
          </a>
        </p>
      </div>
    </footer>
  );
}

function RootLayout() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const isHome = routerState.location.pathname === "/";
  const [navSearch, setNavSearch] = useState("");
  const [themesOpen, setThemesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const themesRef = useRef<HTMLDivElement>(null);
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    if (isHome) {
      const params = new URLSearchParams(routerState.location.searchStr);
      setNavSearch(params.get("q") ?? "");
    } else {
      setNavSearch("");
    }
  }, [routerState.location.searchStr, isHome]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (themesRef.current && !themesRef.current.contains(e.target as Node)) {
        setThemesOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && navSearch.trim().length >= 2) {
      const recent = JSON.parse(
        localStorage.getItem("legoapp_recent_searches") ?? "[]",
      ).filter((q: string) => q !== navSearch.trim());
      recent.unshift(navSearch.trim());
      localStorage.setItem(
        "legoapp_recent_searches",
        JSON.stringify(recent.slice(0, 5)),
      );
    }
  };

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
    } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-6xl mx-auto">
          {/* Main row */}
          <div className="flex items-center gap-3">
            <a href="/" className="text-xl font-bold text-yellow-500 shrink-0">
              LegoApp
            </a>

            {/* Search — grows to fill space */}
            <div className="flex-1">
              <input
                type="text"
                value={navSearch}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search sets..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-3 shrink-0">
              <div ref={themesRef} className="relative">
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

              {user ? (
                <>
                  <a
                    href="/collection"
                    className="text-gray-600 hover:text-gray-900 text-sm"
                  >
                    Collection
                  </a>
                  <a
                    href="/profile"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    {user.name}
                  </a>
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

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
              <div ref={themesRef} className="relative">
                <button
                  onClick={() => setThemesOpen((o) => !o)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-xl flex items-center justify-between"
                >
                  Themes
                  <span
                    className={`text-xs transition-transform ${themesOpen ? "rotate-180" : ""}`}
                  >
                    ▾
                  </span>
                </button>
                {themesOpen && (
                  <ThemesDropdown
                    onClose={() => {
                      setThemesOpen(false);
                      setMobileMenuOpen(false);
                    }}
                  />
                )}
              </div>

              {user ? (
                <>
                  <a
                    href="/collection"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-xl"
                  >
                    My Collection
                  </a>
                  <a
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-xl"
                  >
                    Profile ({user.name})
                  </a>
                  <button
                    onClick={handleLogout}
                    className="text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <a
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-xl"
                  >
                    Login
                  </a>
                  <a
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-sm font-medium text-yellow-600 hover:bg-yellow-50 rounded-xl"
                  >
                    Register
                  </a>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {user && !user.email_verified_at && <VerificationBanner />}

      <main className="max-w-6xl mx-auto px-6 py-8">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
