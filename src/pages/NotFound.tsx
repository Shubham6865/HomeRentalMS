import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-10 text-center shadow-xl shadow-slate-950/20">
      <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
        404 error
      </p>
      <h2 className="mt-4 text-3xl font-semibold text-white">Page not found</h2>
      <p className="mt-3 text-slate-400">
        The route you requested does not exist.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 inline-flex rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
      >
        Go back home
      </Link>
    </div>
  );
}
