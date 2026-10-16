import { db } from "@/lib/supabase";
import BuyForm from "@/components/BuyForm";
import type { Plan } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data } = await db
    .from("plans")
    .select("*")
    .eq("active", true)
    .order("price_minor");
  const plans = (data ?? []) as Plan[];

  return (
    <main className="page">
      <h1>Buy data</h1>
      <p className="muted">Pick a network and plan. Data arrives after payment.</p>
      {plans.length ? <BuyForm plans={plans} /> : <p>No plans available right now.</p>}
    </main>
  );
}
