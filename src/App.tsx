import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Home, Building2, User, Zap } from "lucide-react";
import { Dashboard } from "./pages/Dashboard";
import { Buildings } from "./pages/Buildings";
import { Tenants } from "./pages/Tenants";
import { Electricity } from "./pages/Electricity";
import { Login } from "./pages/Login";
import { NotFound } from "./pages/NotFound";
import { getSessionUser } from "./lib/auth";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/buildings", label: "Buildings", icon: Building2 },
  { to: "/tenants", label: "Tenants", icon: User },
  { to: "/electricity", label: "Electricity", icon: Zap },
];

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const user = getSessionUser();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
}

function App() {
  const user = getSessionUser();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl shadow-slate-950/20 backdrop-blur-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
                RentalMS
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-white">
                Rental management for buildings, tenants, and billing
              </h1>
            </div>
            {user ? (
              <div className="rounded-2xl bg-slate-950/80 px-4 py-3 text-sm text-slate-300 shadow-inner shadow-slate-950/40 sm:text-right">
                Logged in as{" "}
                <span className="font-semibold text-cyan-300">
                  {user.user_metadata.full_name}
                </span>
              </div>
            ) : null}
          </div>
        </header>

        <main className="grid flex-1 gap-6 lg:grid-cols-[280px_1fr]">
          <nav className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4 shadow-xl shadow-slate-950/20 backdrop-blur-sm">
            <div className="space-y-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-cyan-500/10 hover:text-cyan-300"
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4 shadow-xl shadow-slate-950/20 backdrop-blur-sm">
            <Routes>
              <Route
                path="/"
                element={
                  user ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route path="/login" element={<Login />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/buildings"
                element={
                  <PrivateRoute>
                    <Buildings />
                  </PrivateRoute>
                }
              />
              <Route
                path="/tenants"
                element={
                  <PrivateRoute>
                    <Tenants />
                  </PrivateRoute>
                }
              />
              <Route
                path="/electricity"
                element={
                  <PrivateRoute>
                    <Electricity />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
