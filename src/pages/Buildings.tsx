import { useEffect, useState } from "react";
import { supabase } from "../lib/db";
import { Building, Tenant } from "../types";
import { formatDate } from "../utils/format";

export function Buildings() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [rooms, setRooms] = useState(6);

  useEffect(() => {
    async function load() {
      setBuildings(await supabase.from<Building>("buildings").get());
      setTenants(await supabase.from<Tenant>("tenants").get());
    }
    load();
  }, []);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !address.trim()) return;

    const building: Partial<Building> = {
      name: name.trim(),
      address: address.trim(),
      total_rooms: rooms,
    };

    await supabase.from<Building>("buildings").insert([building]);
    setName("");
    setAddress("");
    setRooms(6);
    setBuildings(await supabase.from<Building>("buildings").get());
  };

  const handleDelete = async (building: Building) => {
    const hasTenants = tenants.some(
      (tenant) => tenant.building_id === building.id,
    );
    if (hasTenants) return;
    await supabase.from<Building>("buildings").eq("id", building.id).delete();
    setBuildings(await supabase.from<Building>("buildings").get());
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
        <h2 className="text-xl font-semibold text-white">Buildings</h2>
        <p className="mt-2 text-slate-400">
          Create or manage building records and room capacity.
        </p>

        <form
          className="mt-6 grid gap-4 sm:grid-cols-2"
          onSubmit={handleCreate}
        >
          <label className="block">
            <span className="text-sm text-slate-300">Name</span>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-300">Address</span>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              required
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm text-slate-300">Total rooms</span>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
              type="number"
              min={1}
              value={rooms}
              onChange={(event) => setRooms(Number(event.target.value))}
            />
          </label>
          <button className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 sm:col-span-2">
            Add building
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-inner shadow-slate-950/10">
        <h3 className="text-lg font-semibold text-white">Building list</h3>
        {buildings.length === 0 ? (
          <p className="mt-4 text-slate-400">No buildings created yet.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {buildings.map((building) => {
              const tenantCount = tenants.filter(
                (tenant) => tenant.building_id === building.id,
              ).length;
              return (
                <div
                  key={building.id}
                  className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-white">
                        {building.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        {building.address}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(building)}
                      className="rounded-2xl border border-rose-500 px-4 py-2 text-sm text-rose-300 transition hover:bg-rose-500/10"
                      disabled={tenantCount > 0}
                    >
                      Delete
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-300">
                    <span>Total rooms: {building.total_rooms}</span>
                    <span>Tenants: {tenantCount}</span>
                    <span>Created: {formatDate(building.created_at)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
