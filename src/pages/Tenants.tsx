import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/db";
import { Building, Tenant } from "../types";
import { formatCurrency, formatDate } from "../utils/format";

export function Tenants() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [search, setSearch] = useState("");
  const [buildingFilter, setBuildingFilter] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [room, setRoom] = useState("101");
  const [rent, setRent] = useState(5000);
  const [deposit, setDeposit] = useState(10000);
  const [unitRate, setUnitRate] = useState(8.5);
  const [buildingId, setBuildingId] = useState("");

  useEffect(() => {
    async function load() {
      setBuildings(await supabase.from<Building>("buildings").get());
      setTenants(await supabase.from<Tenant>("tenants").get());
    }
    load();
  }, []);

  useEffect(() => {
    if (buildings.length > 0) {
      setBuildingId(buildings[0].id);
    }
  }, [buildings]);

  const filteredTenants = useMemo(() => {
    return tenants.filter((tenant) => {
      const matchesSearch = [tenant.name, tenant.phone, tenant.room_number]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesBuilding = buildingFilter
        ? tenant.building_id === buildingFilter
        : true;
      return matchesSearch && matchesBuilding;
    });
  }, [tenants, search, buildingFilter]);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !phone.trim() || !buildingId) return;

    await supabase.from<Tenant>("tenants").insert([
      {
        building_id: buildingId,
        name: name.trim(),
        phone: phone.trim(),
        room_number: room.trim(),
        start_date: new Date().toISOString(),
        monthly_rent: rent,
        deposit_amount: deposit,
        deposit_paid: 0,
        unit_rate: unitRate,
        is_active: true,
      },
    ]);

    setName("");
    setPhone("");
    setRoom("101");
    setRent(5000);
    setDeposit(10000);
    setUnitRate(8.5);
    setTenants(await supabase.from<Tenant>("tenants").get());
  };

  const handleToggleActive = async (tenant: Tenant) => {
    await supabase
      .from<Tenant>("tenants")
      .eq("id", tenant.id)
      .update({ is_active: !tenant.is_active });
    setTenants(await supabase.from<Tenant>("tenants").get());
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
        <h2 className="text-xl font-semibold text-white">Tenants</h2>
        <p className="mt-2 text-slate-400">
          Track tenant details, deposits, and electricity rates.
        </p>

        <form
          className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto]"
          onSubmit={handleCreate}
        >
          <div className="grid gap-4 sm:grid-cols-2">
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
              <span className="text-sm text-slate-300">Phone</span>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-300">Room</span>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
                value={room}
                onChange={(event) => setRoom(event.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-300">Building</span>
              <select
                value={buildingId}
                onChange={(event) => setBuildingId(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
              >
                {buildings.map((building) => (
                  <option value={building.id} key={building.id}>
                    {building.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm text-slate-300">Monthly rent</span>
              <input
                type="number"
                min={0}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
                value={rent}
                onChange={(event) => setRent(Number(event.target.value))}
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-300">Deposit amount</span>
              <input
                type="number"
                min={0}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
                value={deposit}
                onChange={(event) => setDeposit(Number(event.target.value))}
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-300">Unit rate</span>
              <input
                type="number"
                step="0.1"
                min={0}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
                value={unitRate}
                onChange={(event) => setUnitRate(Number(event.target.value))}
              />
            </label>
          </div>
          <button className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
            Add tenant
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-inner shadow-slate-950/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Tenant roster</h2>
            <p className="mt-2 text-slate-400">
              Filter the tenant list by building and search text.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[220px_1fr]">
            <input
              className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
              placeholder="Search name, phone, room"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
              value={buildingFilter}
              onChange={(event) => setBuildingFilter(event.target.value)}
            >
              <option value="">All buildings</option>
              {buildings.map((building) => (
                <option key={building.id} value={building.id}>
                  {building.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredTenants.length === 0 ? (
          <p className="mt-6 text-slate-400">No matching tenants found.</p>
        ) : (
          <div className="mt-6 space-y-4">
            {filteredTenants.map((tenant) => {
              const building = buildings.find(
                (item) => item.id === tenant.building_id,
              );
              return (
                <div
                  key={tenant.id}
                  className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-white">
                        {tenant.name}
                      </p>
                      <p className="text-sm text-slate-400">
                        Room {tenant.room_number} ·{" "}
                        {building?.name ?? "Unknown building"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(tenant)}
                      className="rounded-2xl border px-4 py-2 text-sm transition hover:bg-slate-800"
                    >
                      {tenant.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <p className="text-slate-300">Phone: {tenant.phone}</p>
                    <p className="text-slate-300">
                      Rent: {formatCurrency(tenant.monthly_rent)}
                    </p>
                    <p className="text-slate-300">
                      Deposit: {formatCurrency(tenant.deposit_amount)} (
                      {formatCurrency(tenant.deposit_paid)} paid)
                    </p>
                    <p className="text-slate-300">
                      Unit rate: ₹{tenant.unit_rate.toFixed(2)}/unit
                    </p>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">
                    Started: {formatDate(tenant.start_date)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
