import crypto from "crypto";
import { db } from "@/lib/supabase";
import { deliverData } from "@/lib/supplier";

export const maxDuration = 30;

export async function POST(req: Request) {
  // 1. Verify the request really came from Paystack.
  const raw = await req.text();
  const sig = Buffer.from(req.headers.get("x-paystack-signature") ?? "");
  const expected = Buffer.from(
    crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!).update(raw).digest("hex")
  );
  if (sig.length !== expected.length || !crypto.timingSafeEqual(sig, expected)) {
    return new Response("Invalid signature", { status: 401 });
  }

  const event = JSON.parse(raw);
  if (event.event !== "charge.success") return new Response("ok");
  const { reference, amount } = event.data;

  // 2. Claim the order. Only a 'pending' order with the exact amount matches,
  //    so a repeated webhook does nothing (idempotent).
  const { data: order } = await db
    .from("orders")
    .update({ status: "paid", updated_at: new Date().toISOString() })
    .eq("reference", reference)
    .eq("status", "pending")
    .eq("amount_minor", amount)
    .select("reference, phone, plans(network, supplier_code)")
    .maybeSingle();
  if (!order) return new Response("ok");

  const plan = Array.isArray(order.plans) ? order.plans[0] : order.plans;

  // 3. Deliver the data.
  try {
    const result = await deliverData({
      network: plan.network,
      phone: order.phone,
      supplierCode: plan.supplier_code,
      reference: order.reference,
    });
    await db
      .from("orders")
      .update({
        status: result.ok ? "delivered" : "failed",
        supplier_response: result.raw,
        updated_at: new Date().toISOString(),
      })
      .eq("reference", reference);
  } catch (err) {
    // Supplier unreachable: leave the order 'paid' and check manually.
    console.error("Supplier error for", reference, err);
  }

  return new Response("ok");
}
