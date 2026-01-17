import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Package, MapPin, CreditCard, ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import confetti from "canvas-confetti";

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state;

  useEffect(() => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  if (!orderData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">No order found</h2>
          <Button onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shop
          </Button>
        </div>
      </div>
    );
  }

  const { orderId, cartItems, addressData, paymentMethod, subtotal, deliveryFee, total } = orderData;

  const paymentMethodLabels: Record<string, string> = {
    card: "Credit/Debit Card",
    eft: "EFT/Bank Transfer",
    cash: "Cash on Delivery"
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8 space-y-4 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4">
            <CheckCircle className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Order Confirmed!
          </h1>
          <p className="text-xl text-muted-foreground">
            Thank you for your purchase
          </p>
          <div className="inline-block bg-secondary px-6 py-3 rounded-lg">
            <p className="text-sm text-muted-foreground">Order ID</p>
            <p className="text-2xl font-bold font-mono">{orderId}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Delivery Address */}
          <Card className="p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-3">Delivery Address</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">{addressData.fullName}</p>
                  <p>{addressData.streetAddress}</p>
                  <p>{addressData.city}, {addressData.province}</p>
                  <p>{addressData.postalCode}</p>
                  <p className="pt-2">{addressData.phone}</p>
                  <p>{addressData.email}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Payment Method */}
          <Card className="p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <CreditCard className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-3">Payment Method</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {paymentMethodLabels[paymentMethod]}
                </p>
                {paymentMethod === "eft" && (
                  <div className="bg-muted p-3 rounded-lg text-xs">
                    <p className="font-medium mb-1">Banking Details:</p>
                    <p>Bank: Standard Bank</p>
                    <p>Account: 123456789</p>
                    <p>Reference: {orderId}</p>
                  </div>
                )}
                {paymentMethod === "cash" && (
                  <div className="bg-muted p-3 rounded-lg text-xs">
                    <p>Please have exact cash ready for the delivery driver.</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Order Items */}
        <Card className="p-6 mb-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">Order Items</h3>
          </div>

          <div className="space-y-4">
            {cartItems.map((item: any) => (
              <div key={item.id} className="flex gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                  <p className="text-sm">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">R{item.price * item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>R{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span>{deliveryFee === 0 ? "FREE" : `R${deliveryFee.toFixed(2)}`}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between text-lg font-bold">
              <span>Total Paid</span>
              <span className="text-primary">R{total.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* Delivery Timeline */}
        <Card className="p-6 mb-8 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <h3 className="font-semibold mb-4">Estimated Delivery</h3>
          <div className="bg-primary/10 p-4 rounded-lg text-center">
            <p className="text-lg font-semibold text-primary">3 to 5 Business Days</p>
            <p className="text-sm text-muted-foreground mt-1">
              You will receive tracking information via email
            </p>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.5s" }}>
          <Button
            size="lg"
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-primary to-accent"
          >
            Continue Shopping
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => window.print()}
          >
            Print Order Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
