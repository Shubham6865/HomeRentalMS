import { ElectricityBill, Tenant } from "../types";

export function buildWhatsAppLink(tenant: Tenant, bill: ElectricityBill) {
  const month = new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(new Date(bill.billing_month));

  const message = `Electricity Bill - ${month}%0A%0ADear ${tenant.name},%0A%0APrevious Reading: ${bill.previous_reading}%0ACurrent Reading: ${bill.current_reading}%0AUnits Consumed: ${bill.units_consumed}%0ARate: ₹${bill.unit_rate.toFixed(2)}/unit%0A%0ATotal Amount: ₹${bill.total_amount.toFixed(2)}%0A%0APlease pay at your earliest convenience.%0A%0AThank you!`;
  const phone = tenant.phone.replace(/[\s+]/g, "");
  return `https://wa.me/${phone}?text=${message}`;
}
