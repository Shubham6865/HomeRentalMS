import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createUser, findUserByEmail, saveSessionUser } from "../lib/auth";
import { initializeLocalSeed } from "../lib/db";
import { createId } from "../lib/helpers";

export function Login() {
  const [email, setEmail] = useState("owner@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || "/dashboard";

  useEffect(() => {
    initializeLocalSeed();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const user = await findUserByEmail(email);
    if (user) {
      if (user.password !== password) {
        setError("Incorrect password.");
        return;
      }
      saveSessionUser(user);
      navigate(from, { replace: true });
      return;
    }

    const newUser = {
      id: createId(),
      email,
      password,
      user_metadata: { full_name: "Co-owner" },
      created_at: new Date().toISOString(),
    };
    await createUser(newUser);
    saveSessionUser(newUser);
    navigate(from, { replace: true });
  };

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20">
      <h2 className="text-2xl font-semibold text-white">Sign in to RentalMS</h2>
      <p className="mt-2 text-sm text-slate-400">
        Use a local account or create one instantly.
      </p>
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm text-slate-300">Email</span>
          <input
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="text-sm text-slate-300">Password</span>
          <input
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
        <button className="w-full rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
          Sign in
        </button>
      </form>
      <div className="mt-6 rounded-2xl bg-slate-950/80 p-4 text-sm text-slate-400">
        <p>
          Demo user: <span className="text-slate-100">owner@example.com</span>
        </p>
        <p>
          Password: <span className="text-slate-100">password123</span>
        </p>
      </div>
    </div>
  );
}
