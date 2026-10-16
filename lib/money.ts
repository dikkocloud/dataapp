export function money(minor: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: process.env.NEXT_PUBLIC_CURRENCY ?? "NGN",
    maximumFractionDigits: 0,
  }).format(minor / 100);
}
