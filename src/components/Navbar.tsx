import { ShoppingCart, Moon, Sun, Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import sibalogo from "@/assets/sibalogo.jpeg";

interface NavbarProps {
  cartCount: number;
  onCartClick: () => void;
  isDark: boolean;
  onThemeToggle: () => void;
}

export const Navbar = ({ cartCount, onCartClick, isDark, onThemeToggle }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  // Lock body scroll when mobile menu is open for better mobile UX
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <a href="#home" className="inline-flex items-center">
              <img
                src={sibalogo}
                alt="SIBA BEAUTY Logo"
                className="h-12 w-12 md:h-16 md:w-16 rounded-full object-cover border border-border"
              />
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-foreground/80 hover:text-primary transition-colors">
              Home
            </a>
            <a href="#products" className="text-foreground/80 hover:text-primary transition-colors">
              Products
            </a>
            <a href="#about" className="text-foreground/80 hover:text-primary transition-colors">
              About
            </a>
            <a href="#contact" className="text-foreground/80 hover:text-primary transition-colors">
              Contact
            </a>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onThemeToggle}
              className="hover:bg-secondary"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onCartClick}
              className="relative hover:bg-secondary"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                  {cartCount}
                </span>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-secondary"
              onClick={() => navigate("/login")}
              aria-label="Login"
            >
              <User className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="fixed inset-0 md:hidden z-[200] bg-popover text-popover-foreground border border-border shadow-xl pt-24 px-4 overflow-y-auto">
            <div className="flex flex-col space-y-3">
              <a
                href="#home"
                className="block rounded-md px-4 py-3 text-foreground hover:bg-secondary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </a>
              <a
                href="#products"
                className="block rounded-md px-4 py-3 text-foreground hover:bg-secondary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </a>
              <a
                href="#about"
                className="block rounded-md px-4 py-3 text-foreground hover:bg-secondary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </a>
              <a
                href="#contact"
                className="block rounded-md px-4 py-3 text-foreground hover:bg-secondary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
