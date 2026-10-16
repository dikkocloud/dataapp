import { db } from "@/lib/supabase";
import { money } from "@/lib/money";
import Refresher from "@/components/Refresher";

export const dynamic = "force-dynamic";

const copy: Record<string, { title: string; body: string }> = {
  pending: { title: "Waiting for payment", body: "We'll update this page once your payment is confirmed." },
  paid: { title: "Sending your data", body: "Payment received. This usually takes under a minute." },
  delivered: { title: "Data sent", body: "Your data has been delivered." },
  failed: { title: "Delivery failed", body: "Your data was not delivered. Contact support with your order number." },
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const { data: order } = await db
    .from("orders")
    .select("reference, phone, status, amount_minor, plans(network, name)")
    .eq("reference", reference)
    .maybeSingle();

  if (!order) {
    return (
      <main className="page">
        <h1>Order not found</h1>
        <p className="muted">Check the link and try again.</p>
      </main>
    );
  }

  const plan = Array.isArray(order.plans) ? order.plans[0] : order.plans;
  const c = copy[order.status];

  return (
    <main className="page">
      {(order.status === "pending" || order.status === "paid") && <Refresher />}
      <h1>{c.title}</h1>
      <p className="muted">{c.body}</p>
      <dl className="receipt">
        <div><dt>Plan</dt><dd>{plan?.network} {plan?.name}</dd></div>
        <div><dt>Phone</dt><dd>{order.phone}</dd></div>
        <div><dt>Paid</dt><dd>{money(order.amount_minor)}</dd></div>
        <div><dt>Order number</dt><dd>{order.reference}</dd></div>
      </dl>
      <a className="link" href="/">Buy more data</a>
    </main>
  );
}
