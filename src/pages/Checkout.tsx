import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CreditCard, Building2, Wallet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CartItem } from "@/types/product";
import PaystackPop from "@paystack/inline-js";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { signInAnonymously } from "firebase/auth";
import type { Sale } from "@/types/sale";
import { computeSaleDiscount, getDiscountedPrice, isSaleActive } from "@/lib/sale";
import { sendReceiptEmails } from "@/lib/sendgrid";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const cartItems = (location.state?.cartItems as CartItem[]) || [];
  const sale = (location.state?.sale as Sale | null) || null;
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<"address" | "payment">("address");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "eft" | "cash">("card");
  
  const [addressData, setAddressData] = useState({
    fullName: "",
    phone: "",
    email: "",
    streetAddress: "",
    city: "",
    province: "",
    postalCode: "",
  });

  const [cardData, setCardData] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const { discount } = computeSaleDiscount(cartItems, sale);
  const deliveryFee = subtotal < 1000 ? 60 : 0;
  const total = subtotal - discount + deliveryFee;

  const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string | undefined;
  const PAYSTACK_SPLIT_CODE = import.meta.env.VITE_PAYSTACK_SPLIT_CODE as string | undefined;
  const PAYSTACK_SUBACCOUNT_CODE = import.meta.env.VITE_PAYSTACK_SUBACCOUNT_CODE as string | undefined;

  const paystackConfig = {
    reference: new Date().getTime().toString(),
    email: addressData.email,
    amount: Math.round(total * 100), // ZAR uses cents
    publicKey: PAYSTACK_PUBLIC_KEY || "",
    currency: "ZAR",
    ...(PAYSTACK_SPLIT_CODE ? { splitCode: PAYSTACK_SPLIT_CODE, split_code: PAYSTACK_SPLIT_CODE } : {}),
    metadata: {
      fullName: addressData.fullName,
      phone: addressData.phone,
      deliveryFee,
      subtotal,
      discount,
      total,
      saleId: sale?.id || null,
      items: cartItems.map(({ id, name, quantity, price }) => ({ id, name, quantity, price })),
    },
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!addressData.fullName || !addressData.phone || !addressData.email || 
        !addressData.streetAddress || !addressData.city || !addressData.province || 
        !addressData.postalCode) {
      toast.error("Please fill in all address fields");
      return;
    }
    
    setStep("payment");
    toast.success("Address saved!");
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod === "card") {
      if (!cardData.cardNumber || !cardData.cardName || !cardData.expiryDate || !cardData.cvv) {
        toast.error("Please fill in all card details");
        return;
      }
    }
    
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const orderId = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    navigate("/order-confirmation", { 
      state: { 
        orderId,
        cartItems,
        addressData,
        paymentMethod,
        subtotal,
        deliveryFee,
        total
      }
    });
  };

  const sendPaymentEmails = async (orderId: string) => {
    try {
      const receiptData = {
        orderId,
        customerName: addressData.fullName,
        customerEmail: addressData.email,
        customerPhone: addressData.phone,
        items: cartItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal,
        discount,
        deliveryFee,
        total,
        paymentMethod,
        address: {
          streetAddress: addressData.streetAddress,
          city: addressData.city,
          province: addressData.province,
          postalCode: addressData.postalCode,
        },
      };

      const success = await sendReceiptEmails(receiptData);
      if (!success) {
        toast.warning("Receipt emails could not be sent, but your order was placed.");
      } else {
        toast.success("Receipt sent to your email!");
      }
    } catch (err: any) {
      console.error("Email send failed", err);
      toast.warning("Receipt emails could not be sent, but your order was placed.");
    }
  };

  const ensureAuthenticated = async () => {
    try {
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }
    } catch (err) {
      console.warn("Anonymous sign-in failed", err);
    }
  };

  const createOrder = async (orderId: string, status: string, transaction?: any) => {
    const payload = {
      orderId,
      status,
      paymentMethod,
      subtotal,
      deliveryFee,
      discount,
      total,
      address: { ...addressData },
      customer: {
        name: addressData.fullName,
        email: addressData.email,
        phone: addressData.phone,
      },
      items: cartItems.map(({ id, name, quantity, price }) => ({ id, name, quantity, price })),
      saleId: sale?.id || null,
      paystack: transaction
        ? {
            reference: transaction.reference,
            amount: transaction.amount,
            currency: transaction.currency || "ZAR",
            channel: "card",
          }
        : null,
      split_code: PAYSTACK_SPLIT_CODE || null,
      subaccount: PAYSTACK_SUBACCOUNT_CODE || null,
      createdAt: serverTimestamp(),
    };
    try {
      await addDoc(collection(db, "orders"), payload);
    } catch (err) {
      console.error("Failed to save order", err);
      toast.warning("Order saved locally but could not update admin dashboard.");
    }
  };

  const handlePayment = async () => {
    if (paymentMethod === "card") {
      if (!addressData.email) {
        toast.error("Please provide your email to continue");
        return;
      }
      if (!PAYSTACK_PUBLIC_KEY) {
        toast.error("Missing Paystack public key. Please set VITE_PAYSTACK_PUBLIC_KEY");
        return;
      }
      setIsProcessing(true);
      try {
        const paystack = new PaystackPop();
        toast.info("Starting Paystack transaction...");
        // Fallback guard: if checkout doesn’t open within a few seconds, hint about blockers
        const openGuard = window.setTimeout(() => {
          toast.warning("If nothing happens, please disable pop-up/ad blockers and try again.");
        }, 7000);
        const txConfig: any = {
          key: PAYSTACK_PUBLIC_KEY,
          email: addressData.email,
          amount: Math.round(total * 100), // ZAR amount in cents
          // currency is optional; defaults to your Paystack account currency
          // currency: "ZAR",
          metadata: {
            custom_fields: [
              { display_name: "Customer Name", variable_name: "customer_name", value: addressData.fullName },
              { display_name: "Phone", variable_name: "phone", value: addressData.phone },
            ],
            deliveryFee,
            subtotal,
            total,
            items: cartItems.map(({ id, name, quantity, price }) => ({ id, name, quantity, price })),
          },
          onLoad: () => {
            window.clearTimeout(openGuard);
            toast.info("Checkout loaded, please complete your payment");
          },
          onSuccess: async (transaction: any) => {
            window.clearTimeout(openGuard);
            toast.success("Payment successful");
            const orderId = transaction?.reference || Math.random().toString(36).substring(2, 10).toUpperCase();
            await ensureAuthenticated();
            await createOrder(orderId, "paid", transaction);
            sendPaymentEmails(orderId);
            navigate("/order-confirmation", {
              state: {
                orderId,
                cartItems,
                addressData,
                paymentMethod,
                subtotal,
                deliveryFee,
                total,
              },
            });
            setIsProcessing(false);
          },
          onCancel: () => {
            window.clearTimeout(openGuard);
            setIsProcessing(false);
            toast.info("Payment cancelled");
          },
          onError: (err: any) => {
            window.clearTimeout(openGuard);
            setIsProcessing(false);
            console.error("Paystack load error", err);
            toast.error(err?.message || "Could not open Paystack checkout. Try EFT or Cash on Delivery.");
          },
        };
        // Prefer valid split_code; fall back to valid subaccount for split
        const splitCode = PAYSTACK_SPLIT_CODE?.trim();
        const subaccountCode = PAYSTACK_SUBACCOUNT_CODE?.trim();
        if (splitCode && splitCode.startsWith("SPL_")) {
          (txConfig as any).split_code = splitCode;
        } else if (subaccountCode && (subaccountCode.startsWith("ACCT_") || /^[a-zA-Z0-9]+$/.test(subaccountCode))) {
          (txConfig as any).subaccount = subaccountCode;
        } else if (splitCode || subaccountCode) {
          toast.warning("Payment split config looks invalid. Proceeding without split.");
        }
        paystack.newTransaction(txConfig);
      } catch (err: any) {
        toast.error(err?.message || "Payment failed");
        setIsProcessing(false);
      }
    } else {
      // EFT or Cash on Delivery
      setIsProcessing(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const orderId = Math.random().toString(36).substring(2, 10).toUpperCase();
        await ensureAuthenticated();
        await createOrder(orderId, paymentMethod === "eft" ? "pending_eft" : "cash_on_delivery");
        sendPaymentEmails(orderId);
        toast.success("Order placed successfully. Redirecting to confirmation...");
        navigate("/order-confirmation", {
          state: {
            orderId,
            cartItems,
            addressData,
            paymentMethod,
            subtotal,
            deliveryFee,
            total,
          },
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">No items in cart</h2>
          <Button onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shop
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shop
        </Button>

        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Checkout
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Indicator */}
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${step === "address" ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === "address" ? "border-primary bg-primary text-white" : "border-muted"}`}>
                  1
                </div>
                <span className="font-medium">Delivery Address</span>
              </div>
              <div className="flex-1 h-0.5 bg-border" />
              <div className={`flex items-center space-x-2 ${step === "payment" ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === "payment" ? "border-primary bg-primary text-white" : "border-muted"}`}>
                  2
                </div>
                <span className="font-medium">Payment</span>
              </div>
            </div>

            {/* Delivery Address Form */}
            {step === "address" && (
              <Card className="p-6 animate-fade-in">
                <h2 className="text-2xl font-semibold mb-6">Delivery Address</h2>
                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={addressData.fullName}
                        onChange={(e) => setAddressData({ ...addressData, fullName: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={addressData.phone}
                        onChange={(e) => setAddressData({ ...addressData, phone: e.target.value })}
                        placeholder="076 123 4567"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={addressData.email}
                      onChange={(e) => setAddressData({ ...addressData, email: e.target.value })}
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="streetAddress">Street Address *</Label>
                    <Input
                      id="streetAddress"
                      value={addressData.streetAddress}
                      onChange={(e) => setAddressData({ ...addressData, streetAddress: e.target.value })}
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={addressData.city}
                        onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                        placeholder="Johannesburg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="province">Province *</Label>
                      <Input
                        id="province"
                        value={addressData.province}
                        onChange={(e) => setAddressData({ ...addressData, province: e.target.value })}
                        placeholder="Gauteng"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code *</Label>
                      <Input
                        id="postalCode"
                        value={addressData.postalCode}
                        onChange={(e) => setAddressData({ ...addressData, postalCode: e.target.value })}
                        placeholder="2000"
                      />
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-primary to-accent">
                    Continue to Payment
                  </Button>
                </form>
              </Card>
            )}

            {/* Payment Form */}
            {step === "payment" && (
              <Card className="p-6 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold">Payment Method</h2>
                  <Button variant="ghost" size="sm" onClick={() => setStep("address")}>
                    Edit Address
                  </Button>
                </div>

                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                  <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-secondary/50 transition-colors">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex items-center space-x-2 cursor-pointer flex-1">
                          <CreditCard className="h-5 w-5 text-primary" />
                          <span>Credit/Debit Card</span>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-secondary/50 transition-colors">
                        <RadioGroupItem value="eft" id="eft" />
                        <Label htmlFor="eft" className="flex items-center space-x-2 cursor-pointer flex-1">
                          <Building2 className="h-5 w-5 text-primary" />
                          <span>EFT/Bank Transfer</span>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-secondary/50 transition-colors">
                        <RadioGroupItem value="cash" id="cash" />
                        <Label htmlFor="cash" className="flex items-center space-x-2 cursor-pointer flex-1">
                          <Wallet className="h-5 w-5 text-primary" />
                          <span>Cash on Delivery</span>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>

                  {paymentMethod === "card" && (
                    <div className="bg-muted p-4 rounded-lg animate-fade-in">
                      <p className="text-sm text-muted-foreground">
                        You'll be redirected to Paystack's secure checkout to complete your payment.
                      </p>
                    </div>
                  )}

                  {paymentMethod === "eft" && (
                    <div className="bg-muted p-4 rounded-lg animate-fade-in">
                      <p className="text-sm text-muted-foreground">
                        You will receive banking details via email after placing your order.
                      </p>
                    </div>
                  )}

                  {paymentMethod === "cash" && (
                    <div className="bg-muted p-4 rounded-lg animate-fade-in">
                      <p className="text-sm text-muted-foreground">
                        Pay with cash when your order is delivered.
                      </p>
                    </div>
                  )}

                  <Button 
                    type="button"
                    disabled={isProcessing}
                    onClick={handlePayment}
                    className="w-full"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        {paymentMethod === "card" ? `Pay R${total.toFixed(2)}` : "Place Order"}
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-primary">R{item.price * item.quantity}</p>
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
                {subtotal > 0 && subtotal < 1000 && (
                  <p className="text-xs text-muted-foreground">
                    Spend R{(1000 - subtotal).toFixed(2)} more for free delivery
                  </p>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">R{total.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
