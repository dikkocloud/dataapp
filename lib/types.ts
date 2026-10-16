export type Plan = {
  id: string;
  network: string;
  name: string;
  price_minor: number;
  supplier_code: string;
  active: boolean;
};

export type OrderStatus = "pending" | "paid" | "delivered" | "failed";
