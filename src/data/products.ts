import { Product } from "@/types/product";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";

export const products: Product[] = [
  {
    id: "1",
    name: "Radiance Moisturizer",
    description: "Luxurious daily moisturizer enriched with hyaluronic acid and vitamin E for deep hydration and a radiant glow.",
    price: 450,
    image: product1,
    category: "Moisturizers",
    size: "50ml",
    badge: "Bestseller",
    ingredients: ["Hyaluronic Acid", "Vitamin E", "Aloe Vera", "Shea Butter"],
    benefits: [
      "Deep hydration for up to 24 hours",
      "Reduces fine lines and wrinkles",
      "Improves skin elasticity",
      "Non-comedogenic formula"
    ]
  },
  {
    id: "2",
    name: "Rose Gold Serum",
    description: "Premium anti-aging serum with rose extracts and gold particles to brighten and rejuvenate your complexion.",
    price: 650,
    image: product2,
    category: "Serums",
    size: "30ml",
    badge: "Premium",
    ingredients: ["Rose Extract", "24K Gold", "Peptides", "Retinol"],
    benefits: [
      "Reduces dark spots and hyperpigmentation",
      "Firms and tightens skin",
      "Boosts collagen production",
      "Illuminates and brightens complexion"
    ]
  },
  {
    id: "3",
    name: "Natural Face Oil",
    description: "Organic blend of nourishing oils including jojoba, argan, and rosehip to restore skin's natural balance.",
    price: 550,
    image: product3,
    category: "Face Oils",
    size: "30ml",
    badge: "Organic",
    ingredients: ["Jojoba Oil", "Argan Oil", "Rosehip Oil", "Vitamin C"],
    benefits: [
      "Balances natural oil production",
      "Rich in antioxidants",
      "Suitable for all skin types",
      "Quick absorption, non-greasy"
    ]
  },
  {
    id: "4",
    name: "Vitamin C Brightening Serum",
    description: "Powerful brightening serum with stabilized Vitamin C to even skin tone and boost radiance.",
    price: 580,
    image: product4,
    category: "Serums",
    size: "30ml",
    badge: "New",
    ingredients: ["Vitamin C", "Ferulic Acid", "Vitamin E", "Citrus Extract"],
    benefits: [
      "Brightens and evens skin tone",
      "Protects against environmental damage",
      "Boosts collagen synthesis",
      "Fades age spots and sun damage"
    ]
  },
  {
    id: "5",
    name: "Hydrating Gel Moisturizer",
    description: "Lightweight gel formula with hyaluronic acid for intense hydration without feeling heavy.",
    price: 420,
    image: product5,
    category: "Moisturizers",
    size: "50ml",
    ingredients: ["Hyaluronic Acid", "Aloe Vera", "Cucumber Extract", "Green Tea"],
    benefits: [
      "Oil-free hydration",
      "Soothes and calms irritated skin",
      "Perfect for oily and combination skin",
      "Minimizes pore appearance"
    ]
  },
  {
    id: "6",
    name: "Anti-Aging Night Cream",
    description: "Rich night cream with retinol and peptides to repair and regenerate skin while you sleep.",
    price: 720,
    image: product6,
    category: "Night Care",
    size: "50ml",
    badge: "Premium",
    ingredients: ["Retinol", "Peptides", "Ceramides", "Niacinamide"],
    benefits: [
      "Reduces wrinkles and fine lines",
      "Repairs skin overnight",
      "Strengthens skin barrier",
      "Improves skin texture and tone"
    ]
  }
];
