import { Button } from "@/components/ui/button";
import { ArrowRight, Upload, BarChart, Download } from "lucide-react";
import heroImage from "@/assets/hero-analytics.jpg";

export const HeroSection = () => {
  const scrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                Transform Your
                <span className="bg-gradient-primary bg-clip-text text-transparent"> Excel Data</span>
                into Insights
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Upload Excel files, analyze data with AI, and generate stunning interactive 2D and 3D visualizations. 
                Professional analytics made simple.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="group" onClick={() => scrollTo('#upload')}>
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => scrollTo('#ai-insights')}>
                View Demo
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg mx-auto flex items-center justify-center">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground">Upload</h3>
                <p className="text-sm text-muted-foreground">Drag & drop Excel files</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-gradient-secondary rounded-lg mx-auto flex items-center justify-center">
                  <BarChart className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground">Analyze</h3>
                <p className="text-sm text-muted-foreground">AI-powered insights</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-chart-accent rounded-lg mx-auto flex items-center justify-center">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground">Export</h3>
                <p className="text-sm text-muted-foreground">Download charts & reports</p>
              </div>
            </div>
          </div>

          <div className="relative animate-slide-up">
            <div className="absolute inset-0 bg-gradient-primary rounded-2xl blur-2xl opacity-20 animate-pulse-glow"></div>
            <img 
              src={heroImage} 
              alt="Excel Analytics Platform Dashboard"
              className="relative z-10 rounded-2xl shadow-data w-full"
            />
          </div>
        </div>
        
        {/* Subtle Credit */}
        <div className="text-center mt-16 pt-8 border-t border-border/20">
          <p className="text-xs text-muted-foreground/80">
           
          </p>
        </div>
      </div>
    </section>
  );
};