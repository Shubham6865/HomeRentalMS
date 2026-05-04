import { useEffect, useState } from "react";
import { supabase } from "../lib/db";
import { Building, ElectricityBill, Tenant } from "../types";
import { formatCurrency, formatDate } from "../utils/format";

export function Dashboard() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [bills, setBills] = useState<ElectricityBill[]>([]);

  useEffect(() => {
    async function load() {
      setBuildings(await supabase.from<Building>("buildings").get());
      setTenants(await supabase.from<Tenant>("tenants").get());
      setBills(await supabase.from<ElectricityBill>("electricity").get());
    }
    load();
  }, []);

  const activeTenants = tenants.filter((tenant) => tenant.is_active).length;
  const pendingBills = bills.filter((bill) => !bill.is_paid).length;
  const monthlyRent = tenants.reduce(
    (sum, tenant) => sum + tenant.monthly_rent,
    0,
  );
  const pendingDeposits = tenants.reduce(
    (sum, tenant) =>
      sum + Math.max(0, tenant.deposit_amount - tenant.deposit_paid),
    0,
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-4">
        <StatCard label="Active tenants" value={activeTenants.toString()} />
        <StatCard label="Monthly rent" value={formatCurrency(monthlyRent)} />
        <StatCard
          label="Pending deposits"
          value={formatCurrency(pendingDeposits)}
        />
        <StatCard label="Unpaid bills" value={pendingBills.toString()} />
      </div>

      <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-inner shadow-slate-950/10">
        <h2 className="text-lg font-semibold text-white">Recent tenants</h2>
        {tenants.length === 0 ? (
          <p className="mt-4 text-slate-400">No tenants added yet.</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {tenants.slice(0, 3).map((tenant) => (
              <div key={tenant.id} className="rounded-3xl bg-slate-900/80 p-4">
                <p className="font-semibold text-white">{tenant.name}</p>
                <p className="text-sm text-slate-400">
                  Room {tenant.room_number}
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  Rent: {formatCurrency(tenant.monthly_rent)}
                </p>
                <p className="text-sm text-slate-400">
                  Start: {formatDate(tenant.start_date)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-inner shadow-slate-950/10">
        <h2 className="text-lg font-semibold text-white">
          Recent electricity bills
        </h2>
        {bills.length === 0 ? (
          <p className="mt-4 text-slate-400">No bills recorded yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {bills.slice(0, 3).map((bill) => (
              <div key={bill.id} className="rounded-3xl bg-slate-900/80 p-4">
                <p className="font-semibold text-white">
                  {new Intl.DateTimeFormat("en-IN", {
                    month: "long",
                    year: "numeric",
                  }).format(new Date(bill.billing_month))}
                </p>
                <p className="text-sm text-slate-400">
                  Units: {bill.units_consumed}
                </p>
                <p className="text-sm text-slate-300">
                  Amount: {formatCurrency(bill.total_amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}
