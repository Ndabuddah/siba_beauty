import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ProductCard } from "@/components/ProductCard";
import { ProductDetail } from "@/components/ProductDetail";
import { ShoppingCart } from "@/components/ShoppingCart";
import { Footer } from "@/components/Footer";
import { Product, CartItem } from "@/types/product";
import { products } from "@/data/products";
import { toast } from "sonner";
import { Sparkles, Heart, Shield } from "lucide-react";

const Index = () => {
  const [isDark, setIsDark] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        toast.success("Quantity updated in cart");
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      toast.success("Added to cart");
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("Item removed from cart");
    } else {
      setCartItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    toast.success("Item removed from cart");
  };

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];
  const filteredProducts = selectedCategory === "All" 
    ? products 
    : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
        isDark={isDark}
        onThemeToggle={() => setIsDark(!isDark)}
      />

      <Hero />

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 animate-fade-in">
              <div className="inline-flex p-4 bg-primary/10 rounded-full">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Natural Ingredients</h3>
              <p className="text-muted-foreground">
                Carefully selected botanicals and natural extracts for gentle, effective care
              </p>
            </div>
            <div className="text-center space-y-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="inline-flex p-4 bg-accent/10 rounded-full">
                <Shield className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Dermatologist Tested</h3>
              <p className="text-muted-foreground">
                All products tested and approved by certified dermatologists
              </p>
            </div>
            <div className="text-center space-y-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="inline-flex p-4 bg-primary/10 rounded-full">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Cruelty Free</h3>
              <p className="text-muted-foreground">
                100% cruelty-free and ethically sourced ingredients
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 space-y-4 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Our Products
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover our collection of premium skincare products
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ProductCard
                  product={product}
                  onAddToCart={handleAddToCart}
                  onViewDetails={setSelectedProduct}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                About SiBA BEAUTY
              </span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Based in South Africa, SiBA BEAUTY is dedicated to providing premium skincare 
              solutions that celebrate natural beauty. Our products are formulated with 
              carefully selected natural ingredients, combining traditional wisdom with 
              modern science to deliver exceptional results.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We believe in transparency, sustainability, and creating products that not 
              only make you look beautiful but also feel good about using. Every product 
              is dermatologist-tested, cruelty-free, and made with love.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-8 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Get in Touch
              </span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Have questions about our products? We'd love to hear from you!
            </p>
            <div className="bg-card border border-border rounded-2xl p-8 space-y-4 shadow-lg">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Phone</p>
                <a 
                  href="tel:0768018129" 
                  className="text-xl font-semibold text-primary hover:text-accent transition-colors"
                >
                  076 801 8129
                </a>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Email</p>
                <a 
                  href="mailto:zamasibadlamaini@gmail.com"
                  className="text-xl font-semibold text-primary hover:text-accent transition-colors break-all"
                >
                  zamasibadlamaini@gmail.com
                </a>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="text-xl font-semibold">South Africa</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <ProductDetail
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <ShoppingCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />
    </div>
  );
};

export default Index;
