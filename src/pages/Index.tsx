import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ProductCard } from "@/components/ProductCard";
import { ProductDetail } from "@/components/ProductDetail";
import { ShoppingCart } from "@/components/ShoppingCart";
import { Footer } from "@/components/Footer";
import { Product, CartItem } from "@/types/product";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { toast } from "sonner";
import { Sparkles, Heart, Shield } from "lucide-react";
import type { Sale } from "@/types/sale";
import { isSaleActive } from "@/lib/sale";

const Index = () => {
  const [isDark, setIsDark] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activeSale, setActiveSale] = useState<Sale | null>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const snap = await getDocs(collection(db, "products"));
        const list = snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Product, "id">) }));
        setProductsList(list);
        // Fetch sales and pick an active one (first active)
        const saleSnap = await getDocs(collection(db, "sales"));
        const salesList = saleSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Sale, "id">) }));
        const active = salesList.find(isSaleActive) || null;
        setActiveSale(active);
      } catch (err: any) {
        console.error(err);
        toast.error("Failed to load products/sales");
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

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

  const categories = [
    "All",
    ...Array.from(new Set(productsList.map((p) => p.category)))
  ];
  const filteredProducts =
    selectedCategory === "All"
      ? productsList
      : productsList.filter((p) => p.category === selectedCategory);

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
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Our Products
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover our collection of premium skincare products
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 sm:px-6 py-2 text-sm sm:text-base rounded-full transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {loadingProducts ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 bg-secondary rounded-xl mb-4" />
                  <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
                  <div className="h-4 bg-secondary rounded w-1/2" />
                </div>
              ))
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <h3 className="text-xl font-semibold">No products found</h3>
                <p className="text-muted-foreground mt-2">Please check back later or try a different category.</p>
              </div>
            ) : (
              filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ProductCard
                    product={product}
                    onAddToCart={handleAddToCart}
                    onViewDetails={setSelectedProduct}
                    // pass sale for price display
                    sale={activeSale || null}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in-up">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                About SIBA Beauty
              </span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              Transform your skin, transform your life! At Siba Beauty, we're passionate about helping you unlock your natural glow and confidence. Our carefully crafted products address a range of skincare concerns, including:
            </p>
            <ul className="text-lg text-muted-foreground leading-relaxed space-y-2">
              <li>Acne & Blemishes</li>
              <li>Hyperpigmentation & Dark Spots</li>
              <li>Fine Lines & Wrinkles</li>
              <li>Dryness & Dehydration</li>
              <li>Uneven Skin Tone & Texture</li>
              <li>Sensitive Skin & Irritation</li>
            </ul>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our products are designed for all skin types and tones, and are suitable for both women and men. Whether you're looking to address specific skin issues or simply want to maintain healthy, radiant skin, we've got you covered.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              With Siba Beauty, you can say goodbye to skin worries and hello to a more confident, beautiful you!
            </p>
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
                  href="mailto:Sibabeauty27@gmail.com"
                  className="text-xl font-semibold text-primary hover:text-accent transition-colors break-all"
                >
                  Sibabeauty27@gmail.com
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
        sale={activeSale || null}
      />

      <ShoppingCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        sale={activeSale || null}
      />
    </div>
  );
};

export default Index;
