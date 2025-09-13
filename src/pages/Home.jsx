import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, User, Target, Trophy, Clock, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-hero p-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Training Ground
          </h1>
          <p className="text-lg text-muted-foreground">
            Choose your training mode and master the art of defense
          </p>
        </div>

        {/* Mode Selection */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Multiplayer Mode */}
          <Card className="p-8 bg-card/80 backdrop-blur-sm border-border hover:shadow-combat transition-all duration-300 group">
            <div className="text-center">
              <div className="mb-6">
                <Users className="w-16 h-16 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <Badge variant="outline" className="mb-2">COMPETITIVE</Badge>
                <h2 className="text-2xl font-bold mb-3">Multiplayer Mode</h2>
                <p className="text-muted-foreground mb-4">
                  Challenge a friend in head-to-head combat training. Compare scores and prove your skills.
                </p>
              </div>
              
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="w-4 h-4 text-accent" />
                  <span>Competitive scoring system</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Target className="w-4 h-4 text-accent" />
                  <span>Real-time comparison</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4 text-accent" />
                  <span>Turn-based training</span>
                </div>
              </div>

              <Link to="/battlefield">
                <Button variant="combat" size="lg" className="w-full">
                  Enter Battlefield
                  <Users className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </Card>

          {/* Single Player Mode */}
          <Card className="p-8 bg-card/80 backdrop-blur-sm border-border hover:shadow-tactical transition-all duration-300 group">
            <div className="text-center">
              <div className="mb-6">
                <User className="w-16 h-16 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <Badge variant="outline" className="mb-2">PERSONAL</Badge>
                <h2 className="text-2xl font-bold mb-3">Single Player Mode</h2>
                <p className="text-muted-foreground mb-4">
                  Perfect your technique at your own pace with detailed performance analysis.
                </p>
              </div>
              
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <Target className="w-4 h-4 text-accent" />
                  <span>Personal best tracking</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 text-accent" />
                  <span>Self-paced training</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4 text-accent" />
                  <span>Detailed feedback</span>
                </div>
              </div>

              <Link to="/modules">
                <Button variant="tactical" size="lg" className="w-full">
                  Begin Training
                  <User className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center bg-card/60 backdrop-blur-sm border-border">
            <div className="text-2xl font-bold text-primary">3</div>
            <div className="text-sm text-muted-foreground">Training Modules</div>
          </Card>
          <Card className="p-4 text-center bg-card/60 backdrop-blur-sm border-border">
            <div className="text-2xl font-bold text-primary">12</div>
            <div className="text-sm text-muted-foreground">Combat Poses</div>
          </Card>
          <Card className="p-4 text-center bg-card/60 backdrop-blur-sm border-border">
            <div className="text-2xl font-bold text-primary">90%</div>
            <div className="text-sm text-muted-foreground">Accuracy Target</div>
          </Card>
          <Card className="p-4 text-center bg-card/60 backdrop-blur-sm border-border">
            <div className="text-2xl font-bold text-primary">3s</div>
            <div className="text-sm text-muted-foreground">Hold Duration</div>
          </Card>
        </div>
      </div>
    </div>
  );
};
// c
export default Home;