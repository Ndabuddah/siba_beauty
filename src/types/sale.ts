export type SaleType = "fixed" | "percent" | "combo";

export interface ComboDeal {
  productIds: string[]; // product IDs that form the bundle
  bundlePrice: number; // total price for the combo bundle
}

export interface Sale {
  id: string;
  title: string;
  description?: string;
  bannerImage?: string;
  active: boolean;
  popupEnabled?: boolean;
  type: SaleType;
  amount?: number; // for fixed amount off in Rands (applied per product)
  percent?: number; // for percentage discount (0-100)
  comboDeals?: ComboDeal[]; // optional combos (applied at cart/checkout totals)
  startDate?: number; // unix ms timestamp
  endDate?: number; // unix ms timestamp
  createdAt?: number; // unix ms timestamp
}