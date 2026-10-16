type Delivery = {
  network: string;
  phone: string;
  supplierCode: string;
  reference: string;
};

export async function deliverData(d: Delivery): Promise<{ ok: boolean; raw: unknown }> {
  const res = await fetch(`${process.env.SUPPLIER_API_URL}/data`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SUPPLIER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      network: d.network,
      phone: d.phone,
      plan: d.supplierCode,
      request_id: d.reference,
    }),
  });
  const raw = await res.json().catch(() => null);
  const ok = res.ok && (raw as { status?: string } | null)?.status === "success";
  return { ok, raw };
}
