import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const planId = String(body?.planId ?? "");
  const phone = String(body?.phone ?? "").replace(/[\s-]/g, "");
  const email = String(body?.email ?? "").trim();

  if (!/^\+?\d{10,15}$/.test(phone)) {
    return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  // Price always comes from the database, never from the browser.
  const { data: plan } = await db
    .from("plans")
    .select("id, price_minor")
    .eq("id", planId)
    .eq("active", true)
    .maybeSingle();
  if (!plan) {
    return NextResponse.json({ error: "That plan is no longer available." }, { status: 404 });
  }

  const reference = `ord_${randomUUID().replace(/-/g, "")}`;
  const { error: insertError } = await db.from("orders").insert({
    reference,
    plan_id: plan.id,
    phone,
    email,
    amount_minor: plan.price_minor,
  });
  if (insertError) {
    return NextResponse.json({ error: "Could not start your order. Try again." }, { status: 500 });
  }

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: plan.price_minor,
      reference,
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/order/${reference}`,
    }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.status) {
    return NextResponse.json({ error: "Payment could not start. Try again." }, { status: 502 });
  }

  return NextResponse.json({ url: json.data.authorization_url });
}
