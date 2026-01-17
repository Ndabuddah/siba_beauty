import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { ShoppingCart, X, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Sale } from "@/types/sale";
import { getDiscountedPrice, isSaleActive } from "@/lib/sale";

interface ProductDetailProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  sale?: Sale | null;
}

export const ProductDetail = ({ product, isOpen, onClose, onAddToCart, sale }: ProductDetailProps) => {
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] sm:w-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          {/* Image */}
          <div className="relative rounded-2xl overflow-hidden group">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              loading="lazy"
              decoding="async"
            />
            {product.badge && (
              <Badge className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-accent text-accent-foreground">
                {product.badge}
              </Badge>
            )}
          </div>

          {/* Details */}
          <div className="space-y-5 sm:space-y-6">
            <div>
              <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-2">
                {product.category}
              </div>
              {sale && isSaleActive(sale) && (sale.type === "fixed" || sale.type === "percent") ? (
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-sm line-through text-muted-foreground">R{product.price.toFixed(2)}</span>
                  <span className="text-3xl sm:text-4xl font-bold text-primary">R{getDiscountedPrice(product, sale).toFixed(2)}</span>
                </div>
              ) : (
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">
                  R{product.price}
                </div>
              )}
              <div className="text-xs sm:text-sm text-muted-foreground">
                {product.size}
              </div>
            </div>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            {product.benefits && product.benefits.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-foreground">Key Benefits</h3>
                <ul className="space-y-2">
                  {product.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground text-sm sm:text-base">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.ingredients && product.ingredients.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-foreground">Key Ingredients</h3>
                <div className="flex flex-wrap gap-2">
                  {product.ingredients.map((ingredient, index) => (
                    <Badge key={index} variant="secondary">
                      {ingredient}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
