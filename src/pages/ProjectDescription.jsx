import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, Heart, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const ProjectDescription = () => {
  const [agreements, setAgreements] = useState({
    age: false,
    injury: false,
    warmup: false,
    terms: false
  });

  const canProceed = Object.values(agreements).every(Boolean);

  const handleAgreementChange = (key) => {
    setAgreements(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-gradient-hero p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-primary">
            Training Agreement & Safety
          </h1>
          <p className="text-lg text-muted-foreground">
            Please read and acknowledge the following before beginning your training
          </p>
        </div>

        <div className="space-y-6">
          {/* Project Description */}
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold">About PhoDefense</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              PhoDefense is an educational Krav Maga training application that uses AI-powered pose detection 
              to help you learn and practice self-defense techniques. Our system provides real-time feedback 
              on your form and technique, helping you build muscle memory and improve your defensive capabilities.
            </p>
          </Card>

          {/* Age Verification */}
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
            <div className="flex items-center space-x-3">
              <Checkbox 
                id="age"
                checked={agreements.age}
                onCheckedChange={() => handleAgreementChange('age')}
              />
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <label htmlFor="age" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  I am 18 years of age or older, or have parental consent to participate
                </label>
              </div>
            </div>
          </Card>

          {/* Injury Disclaimer */}
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important Safety Notice:</strong> Physical training carries inherent risks. 
                Participate only if you are in good health and free from injuries.
              </AlertDescription>
            </Alert>
            <div className="flex items-center space-x-3">
              <Checkbox 
                id="injury"
                checked={agreements.injury}
                onCheckedChange={() => handleAgreementChange('injury')}
              />
              <label htmlFor="injury" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I understand the risks and confirm I am physically able to participate in martial arts training
              </label>
            </div>
          </Card>

          {/* Warm-up Checklist */}
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold">Pre-Training Checklist</h3>
            </div>
            <div className="space-y-2 mb-4">
              <p className="text-sm text-muted-foreground">✓ Ensure adequate space for movement (6ft x 6ft minimum)</p>
              <p className="text-sm text-muted-foreground">✓ Wear comfortable, non-restrictive clothing</p>
              <p className="text-sm text-muted-foreground">✓ Have water available for hydration</p>
              <p className="text-sm text-muted-foreground">✓ Perform light stretching before intense training</p>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox 
                id="warmup"
                checked={agreements.warmup}
                onCheckedChange={() => handleAgreementChange('warmup')}
              />
              <label htmlFor="warmup" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I have completed the pre-training checklist and am ready to begin
              </label>
            </div>
          </Card>

          {/* Terms & Conditions */}
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
            <div className="flex items-center space-x-3">
              <Checkbox 
                id="terms"
                checked={agreements.terms}
                onCheckedChange={() => handleAgreementChange('terms')}
              />
              <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I accept the terms of service and privacy policy
              </label>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link to="/">
              <Button variant="tactical" size="lg">
                Back to Landing
              </Button>
            </Link>
            <Link to="/home">
              <Button 
                variant={canProceed ? "combat" : "secondary"} 
                size="lg" 
                disabled={!canProceed}
                className={canProceed ? "" : "opacity-50 cursor-not-allowed"}
              >
                Enter Training Ground
                <Shield className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDescription;