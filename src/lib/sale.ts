import type { Product, CartItem } from "@/types/product";
import type { Sale, ComboDeal } from "@/types/sale";

export const isSaleActive = (sale: Sale | null | undefined): boolean => {
  if (!sale || !sale.active) return false;
  const now = Date.now();
  if (sale.startDate && now < sale.startDate) return false;
  if (sale.endDate && now > sale.endDate) return false;
  return true;
};

export const getDiscountedPrice = (product: Product, sale?: Sale | null): number => {
  if (!sale || !isSaleActive(sale)) return product.price;
  switch (sale.type) {
    case "fixed": {
      const amount = Number(sale.amount || 0);
      return Math.max(0, product.price - amount);
    }
    case "percent": {
      const percent = Number(sale.percent || 0);
      const factor = Math.max(0, Math.min(100, percent)) / 100;
      return Number((product.price * (1 - factor)).toFixed(2));
    }
    case "combo":
    default:
      // Combo discounts are applied at cart/checkout level; item price stays the same
      return product.price;
  }
};

export interface AppliedDiscount {
  discount: number; // total discount amount applied to the cart
  bundlesApplied?: number; // number of combo bundles applied
  appliedDeals?: ComboDeal[]; // which deals applied
}

export const computeSaleDiscount = (items: CartItem[], sale?: Sale | null): AppliedDiscount => {
  if (!sale || !isSaleActive(sale)) return { discount: 0 };

  if (sale.type === "fixed" || sale.type === "percent") {
    const discount = items.reduce((sum, item) => {
      const discounted = getDiscountedPrice(item, sale);
      const perItemDiscount = Math.max(0, item.price - discounted);
      return sum + perItemDiscount * item.quantity;
    }, 0);
    return { discount: Number(discount.toFixed(2)) };
  }

  // combo deals
  const comboDeals = sale.comboDeals || [];
  let totalDiscount = 0;
  const applied: ComboDeal[] = [];
  let bundlesApplied = 0;

  for (const deal of comboDeals) {
    // find counts for each productId in the cart
    const counts = deal.productIds.map((pid) => items.find((i) => i.id === pid)?.quantity || 0);
    const bundleCount = Math.min(...counts);
    if (bundleCount <= 0) continue;

    // sum original prices of one bundle
    const bundleOriginalSum = deal.productIds.reduce((sum, pid) => {
      const it = items.find((i) => i.id === pid);
      return sum + (it ? it.price : 0);
    }, 0);

    const perBundleDiscount = Math.max(0, bundleOriginalSum - deal.bundlePrice);
    if (perBundleDiscount > 0) {
      totalDiscount += perBundleDiscount * bundleCount;
      applied.push(deal);
      bundlesApplied += bundleCount;
    }
  }

  return { discount: Number(totalDiscount.toFixed(2)), bundlesApplied, appliedDeals: applied };
};