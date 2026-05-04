import { useEffect, useState } from "react";
import { supabase } from "../lib/db";
import { ElectricityBill, Tenant } from "../types";
import { buildWhatsAppLink } from "../utils/whatsapp";
import { formatCurrency } from "../utils/format";

export function Electricity() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [bills, setBills] = useState<ElectricityBill[]>([]);
  const [tenantId, setTenantId] = useState("");
  const [previous, setPrevious] = useState(0);
  const [current, setCurrent] = useState(0);
  const [billingMonth, setBillingMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );

  useEffect(() => {
    async function load() {
      const tenantList = await supabase.from<Tenant>("tenants").get();
      setTenants(tenantList);
      setBills(await supabase.from<ElectricityBill>("electricity").get());
      if (tenantList.length) {
        setTenantId(tenantList[0].id);
      }
    }
    load();
  }, []);

  const selectedTenant = tenants.find((tenant) => tenant.id === tenantId);
  const units = Math.max(0, current - previous);
  const total = selectedTenant ? units * selectedTenant.unit_rate : 0;

  const handleCreateBill = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTenant) return;

    await supabase.from<ElectricityBill>("electricity").insert([
      {
        tenant_id: selectedTenant.id,
        billing_month: `${billingMonth}-01`,
        previous_reading: previous,
        current_reading: current,
        units_consumed: units,
        unit_rate: selectedTenant.unit_rate,
        total_amount: total,
        is_paid: false,
        paid_date: null,
      },
    ]);

    setBills(await supabase.from<ElectricityBill>("electricity").get());
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
        <h2 className="text-xl font-semibold text-white">
          Electricity billing
        </h2>
        <p className="mt-2 text-slate-400">
          Log meter readings and share bills via WhatsApp.
        </p>

        <form
          className="mt-6 grid gap-4 lg:grid-cols-2"
          onSubmit={handleCreateBill}
        >
          <label className="block">
            <span className="text-sm text-slate-300">Tenant</span>
            <select
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
              value={tenantId}
              onChange={(event) => setTenantId(event.target.value)}
            >
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name} · Room {tenant.room_number}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-slate-300">Billing month</span>
            <input
              type="month"
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
              value={billingMonth}
              onChange={(event) => setBillingMonth(event.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-300">Previous reading</span>
            <input
              type="number"
              min={0}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
              value={previous}
              onChange={(event) => setPrevious(Number(event.target.value))}
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-300">Current reading</span>
            <input
              type="number"
              min={0}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
              value={current}
              onChange={(event) => setCurrent(Number(event.target.value))}
            />
          </label>
          <div className="rounded-3xl border border-slate-700 bg-slate-950/80 p-4">
            <p className="text-sm text-slate-300">Units consumed</p>
            <p className="mt-2 text-3xl font-semibold text-white">{units}</p>
          </div>
          <div className="rounded-3xl border border-slate-700 bg-slate-950/80 p-4">
            <p className="text-sm text-slate-300">Total amount</p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {formatCurrency(total)}
            </p>
          </div>
          <button className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 lg:col-span-2">
            Log electricity bill
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-inner shadow-slate-950/10">
        <h3 className="text-lg font-semibold text-white">Electricity bills</h3>
        {bills.length === 0 ? (
          <p className="mt-4 text-slate-400">
            No electricity bills recorded yet.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {bills.map((bill) => {
              const tenant = tenants.find((item) => item.id === bill.tenant_id);
              if (!tenant) return null;
              return (
                <div
                  key={bill.id}
                  className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 sm:flex sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-white">
                      {tenant.name} ·{" "}
                      {new Intl.DateTimeFormat("en-IN", {
                        month: "long",
                        year: "numeric",
                      }).format(new Date(bill.billing_month))}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Units: {bill.units_consumed} · Amount:{" "}
                      {formatCurrency(bill.total_amount)}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3 sm:mt-0 sm:items-center">
                    <a
                      href={buildWhatsAppLink(tenant, bill)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                    >
                      Share via WhatsApp
                    </a>
                    <span
                      className={`rounded-2xl px-3 py-2 text-sm ${bill.is_paid ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}
                    >
                      {bill.is_paid ? "Paid" : "Unpaid"}
                    </span>
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
