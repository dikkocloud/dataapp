"use client";
import { useMemo, useState } from "react";
import type { Plan } from "@/lib/types";
import { money } from "@/lib/money";

export default function BuyForm({ plans }: { plans: Plan[] }) {
  const networks = useMemo(() => Array.from(new Set(plans.map((p) => p.network))), [plans]);
  const [network, setNetwork] = useState(networks[0] ?? "");
  const [planId, setPlanId] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const visible = plans.filter((p) => p.network === network);
  const selected = plans.find((p) => p.id === planId);

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return setError("Choose a plan first.");
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: selected.id, phone, email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong.");
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={pay}>
      <div className="networks" role="tablist">
        {networks.map((n) => (
          <button
            key={n}
            type="button"
            role="tab"
            aria-selected={n === network}
            className="network"
            onClick={() => { setNetwork(n); setPlanId(null); }}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="plans">
        {visible.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={p.id === planId}
            className="plan"
            onClick={() => setPlanId(p.id)}
          >
            <span className="plan-name">{p.name}</span>
            <span className="plan-price">{money(p.price_minor)}</span>
          </button>
        ))}
      </div>

      <label className="field">
        Phone number to receive data
        <input type="tel" inputMode="tel" autoComplete="tel" value={phone}
          onChange={(e) => setPhone(e.target.value)} required />
      </label>
      <label className="field">
        Email for your receipt
        <input type="email" autoComplete="email" value={email}
          onChange={(e) => setEmail(e.target.value)} required />
      </label>

      {error && <p className="error" role="alert">{error}</p>}

      <div className="paybar">
        <button type="submit" disabled={busy || !selected}>
          {busy ? "Opening payment…" : selected ? `Pay ${money(selected.price_minor)}` : "Choose a plan"}
        </button>
      </div>
    </form>
  );
}
