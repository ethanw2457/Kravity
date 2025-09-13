import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Target, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-combat.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/80" />
        
        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="animate-slide-up">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Kravity
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Gamifying Self Defense with Machine Learning
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/project-description">
                <Button variant="hero" size="lg" className="text-lg px-8 py-3">
                  START TRAINING
                  <Shield className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button variant="tactical" size="lg" className="text-lg px-8 py-3">
                Watch Demo
                <Target className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 py-20 px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Advanced Combat Training Technology
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-border hover:shadow-tactical transition-all duration-300">
              <Zap className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Real-Time Pose Detection</h3>
              <p className="text-muted-foreground">
                AI-powered analysis of your form with instant feedback for perfect technique execution.
              </p>
            </Card>
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-border hover:shadow-tactical transition-all duration-300">
              <Users className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Multiplayer Combat</h3>
              <p className="text-muted-foreground">
                Challenge friends and compete in real-time training sessions with live scoring.
              </p>
            </Card>
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-border hover:shadow-tactical transition-all duration-300">
              <Target className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Precision Scoring</h3>
              <p className="text-muted-foreground">
                Advanced metrics track your progress with detailed analysis of every movement.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;