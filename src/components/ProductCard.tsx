import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart, Eye } from "lucide-react";
import { Product } from "@/types/product";
import type { Sale } from "@/types/sale";
import { getDiscountedPrice, isSaleActive } from "@/lib/sale";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  sale?: Sale | null;
}

export const ProductCard = ({ product, onAddToCart, onViewDetails, sale }: ProductCardProps) => {
  return (
    <Card className="group overflow-hidden border-border hover:shadow-xl transition-all duration-500 hover:-translate-y-2 bg-card">
      <div className="relative overflow-hidden aspect-square">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Quick Actions */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
          <Button
            size="sm"
            variant="secondary"
            className="shadow-lg"
            onClick={() => onViewDetails(product)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button
            size="sm"
            className="shadow-lg bg-primary hover:bg-primary/90"
            onClick={() => onAddToCart(product)}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 px-2 sm:px-3 py-1 bg-accent text-accent-foreground text-[10px] sm:text-xs font-semibold rounded-full shadow-lg">
            {product.badge}
          </div>
        )}
      </div>

      <div className="p-4 sm:p-6 space-y-2 sm:space-y-3">
        <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">
          {product.category}
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between pt-2">
          {sale && isSaleActive(sale) && (sale.type === "fixed" || sale.type === "percent") ? (
            <div className="flex items-baseline gap-2">
              <span className="text-sm line-through text-muted-foreground">R{product.price.toFixed(2)}</span>
              <span className="text-xl sm:text-2xl font-bold text-primary">R{getDiscountedPrice(product, sale).toFixed(2)}</span>
            </div>
          ) : (
            <div className="text-xl sm:text-2xl font-bold text-primary">R{product.price}</div>
          )}
          <div className="text-xs text-muted-foreground">
            {product.size}
          </div>
        </div>
      </div>
    </Card>
  );
};
