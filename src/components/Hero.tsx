import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/mainimage.jpeg";

export const Hero = () => {
  return (
    <section id="home" className="relative min-h-[60vh] md:min-h-[75vh] flex items-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/30 to-background" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 right-6 sm:right-20 w-56 sm:w-96 h-56 sm:h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-6 sm:left-20 w-56 sm:w-96 h-56 sm:h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <div className="container mx-auto px-4 pt-28 md:pt-32 pb-16 md:pb-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-6 md:space-y-8 animate-fade-in-up">
            <div className="inline-block px-3 md:px-4 py-1.5 md:py-2 bg-primary/10 rounded-full text-primary font-medium text-xs md:text-sm animate-scale-in">
              South African Luxury Skincare
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">Where True Beauty Begins</h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg">
              Discover premium skincare formulated with natural ingredients to reveal your natural glow. Experience the SIBA BEAUTY difference.
            </p>
            
            <div className="flex flex-wrap gap-3 md:gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity group shadow-lg hover:shadow-xl"
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="border-2 hover:bg-secondary"
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Image */}
          <div className="relative animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 rounded-3xl blur-2xl" />
            <img
              src={heroImage}
              alt="SiBA BEAUTY Premium Skincare"
              className="relative rounded-3xl shadow-2xl w-[60%] mx-auto max-h-[45vh] md:max-h-[50vh] object-cover hover:scale-105 transition-transform duration-700"
              loading="eager"
              decoding="async"
            />
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="hidden md:block absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-foreground/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-foreground/30 rounded-full" />
        </div>
      </div>
    </section>
  );
};
