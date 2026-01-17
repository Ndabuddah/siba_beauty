import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/types/product";
import { Trash2, ShoppingBag } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { Sale } from "@/types/sale";
import { computeSaleDiscount, getDiscountedPrice, isSaleActive } from "@/lib/sale";

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  sale?: Sale | null;
}

export const ShoppingCart = ({ 
  isOpen, 
  onClose, 
  items, 
  onUpdateQuantity, 
  onRemoveItem,
  sale
}: ShoppingCartProps) => {
  const navigate = useNavigate();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const { discount } = computeSaleDiscount(items, sale);
  const shipping = subtotal >= 1000 ? 0 : 60;
  const total = subtotal - discount + shipping;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg p-4 sm:p-6">
        <SheetHeader>
          <SheetTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Shopping Cart
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-center">
              <ShoppingBag className="h-14 w-14 sm:h-16 sm:w-16 text-muted-foreground/50" />
              <div>
                <p className="text-base sm:text-lg font-medium text-muted-foreground">Your cart is empty</p>
                <p className="text-xs sm:text-sm text-muted-foreground/70 mt-1">
                  Add some beautiful products to get started
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto py-4 sm:py-6 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 sm:gap-4 group">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden shrink-0 bg-secondary">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                      <div className="flex items-center gap-2 sm:gap-3 mt-2">
                        <div className="flex items-center border rounded-lg">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-16"
                            onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                          >
                            <span className="text-xs">Less</span>
                          </Button>
                          <span className="px-2 sm:px-3 text-sm font-medium">{item.quantity}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-16"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          >
                            <span className="text-xs">More</span>
                          </Button>
                        </div>
                        <div className="font-semibold text-primary">
                          {sale && isSaleActive(sale) && (sale.type === "fixed" || sale.type === "percent") ? (
                            <div className="flex items-baseline gap-2">
                              <span className="text-xs line-through text-muted-foreground">R{(item.price * item.quantity).toFixed(2)}</span>
                              <span>R{(getDiscountedPrice(item, sale) * item.quantity).toFixed(2)}</span>
                            </div>
                          ) : (
                            <>R{(item.price * item.quantity).toFixed(2)}</>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 sm:pt-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">R{subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discounts</span>
                      <span>-R{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? "FREE" : `R${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  {subtotal > 0 && subtotal < 1000 && (
                    <p className="text-xs text-muted-foreground">
                      Spend R{(1000 - subtotal).toFixed(2)} more for free delivery
                    </p>
                  )}
                  {subtotal >= 1000 && (
                    <p className="text-xs text-muted-foreground text-green-600">
                      Free delivery applied: orders over R1000 qualify
                    </p>
                  )}
                  <Separator />
                  <div className="flex justify-between text-base sm:text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">R{total.toFixed(2)}</span>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                  onClick={() => {
                    onClose();
                    navigate("/checkout", { state: { cartItems: items, sale } });
                  }}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
