import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, Target, Clock, Zap, AlertCircle, Play, Pause } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

const Dojo = () => {
  const { moduleId } = useParams();
  const [currentPose, setCurrentPose] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [accuracy, setAccuracy] = useState(0);
  const [holdTimer, setHoldTimer] = useState(0);
  const [score, setScore] = useState(100);
  const [feedback, setFeedback] = useState("");

  const poses = [
    { 
      id: 1, 
      name: "Guard Position", 
      description: "Maintain a balanced defensive stance with hands raised",
      keyPoints: ["Feet shoulder-width apart", "Hands at face level", "Weight evenly distributed", "Eyes focused forward"]
    },
    { 
      id: 2, 
      name: "Defensive Stance", 
      description: "Lower defensive position ready to block incoming attacks",
      keyPoints: ["Slight crouch", "Arms positioned to protect body", "Quick reaction posture", "Stable base"]
    },
    { 
      id: 3, 
      name: "Basic Block", 
      description: "Execute a fundamental blocking movement",
      keyPoints: ["Forearm parallel to ground", "Elbow at 90 degrees", "Strong defensive position", "Ready to counter"]
    },
    { 
      id: 4, 
      name: "Ready Position", 
      description: "Return to neutral combat-ready stance",
      keyPoints: ["Relaxed but alert", "Hands at sides", "Weight balanced", "Ready to react"]
    }
  ];

  const currentPoseData = poses[currentPose];

  // Simulate pose detection and feedback
  useEffect(() => {
    if (isTraining) {
      const interval = setInterval(() => {
        // Simulate accuracy fluctuation
        const newAccuracy = Math.floor(Math.random() * 30) + 70; // 70-100%
        setAccuracy(newAccuracy);

        if (newAccuracy >= 90) {
          setHoldTimer(prev => prev + 1);
          setFeedback("Excellent form! Hold this position...");
        } else {
          setHoldTimer(0);
          // Simulate GPT feedback
          const feedbacks = [
            "Raise your elbows slightly",
            "Widen your stance for better balance",
            "Keep your hands at face level",
            "Distribute weight evenly",
            "Focus on your posture"
          ];
          setFeedback(feedbacks[Math.floor(Math.random() * feedbacks.length)]);
          
          // Degrade score
          setScore(prev => Math.max(0, prev - 1));
        }

        // Check if pose is completed
        if (holdTimer >= 3) {
          setScore(prev => prev + 5); // Compensation points
          if (currentPose < poses.length - 1) {
            setCurrentPose(prev => prev + 1);
            setHoldTimer(0);
            setFeedback("Pose completed! Moving to next position...");
          } else {
            setIsTraining(false);
            setFeedback("Module completed! Excellent work!");
          }
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isTraining, holdTimer, currentPose]);

  const handleStartTraining = () => {
    setIsTraining(true);
    setFeedback("Position yourself in front of the camera and begin!");
  };

  const handlePauseTraining = () => {
    setIsTraining(false);
    setFeedback("Training paused. Click resume when ready.");
  };

  const isCompleted = currentPose >= poses.length;

  return (
    <div className="min-h-screen bg-gradient-hero p-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Training Dojo
          </h1>
          <Badge variant="outline" className="text-lg px-4 py-2">
            Module {moduleId} - Basic Defense Stances
          </Badge>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Camera/Training Area */}
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4 relative">
              <Camera className="w-16 h-16 text-muted-foreground" />
              <div className="absolute top-4 left-4">
                <Badge variant="outline" className={accuracy >= 90 ? "bg-green-500 text-white" : "bg-yellow-500 text-black"}>
                  {accuracy}% Accuracy
                </Badge>
              </div>
              {holdTimer > 0 && (
                <div className="absolute top-4 right-4">
                  <Badge variant="outline" className="bg-primary text-primary-foreground">
                    Hold: {holdTimer}/3s
                  </Badge>
                </div>
              )}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="text-center text-sm text-white bg-black/50 rounded p-2">
                  {feedback || "Position yourself in front of the camera"}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="font-semibold">Score: {score}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <span>Pose {currentPose + 1}/{poses.length}</span>
              </div>
            </div>

            <div className="space-y-3">
              {!isTraining && !isCompleted && (
                <Button variant="combat" className="w-full" onClick={handleStartTraining}>
                  <Play className="w-4 h-4 mr-2" />
                  Start Training
                </Button>
              )}
              {isTraining && (
                <Button variant="tactical" className="w-full" onClick={handlePauseTraining}>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause Training
                </Button>
              )}
              {isCompleted && (
                <Link to="/single-player-results">
                  <Button variant="hero" className="w-full">
                    View Results
                    <Zap className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          </Card>

          {/* Pose Instructions */}
          <div className="space-y-6">
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
              <h3 className="text-2xl font-bold mb-4">{currentPoseData.name}</h3>
              <p className="text-muted-foreground mb-6">{currentPoseData.description}</p>
              
              <div className="space-y-3">
                <h4 className="font-semibold">Key Points:</h4>
                {currentPoseData.keyPoints.map((point, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="text-sm">{point}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Progress Tracking */}
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
              <h4 className="font-semibold mb-4">Training Progress</h4>
              <div className="space-y-4">
                {poses.map((pose, index) => (
                  <div key={pose.id} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      index < currentPose ? 'bg-green-500' : 
                      index === currentPose ? 'bg-primary' : 'bg-muted'
                    }`} />
                    <span className={`text-sm ${
                      index === currentPose ? 'font-semibold text-primary' : 
                      index < currentPose ? 'text-green-400' : 'text-muted-foreground'
                    }`}>
                      {pose.name}
                    </span>
                  </div>
                ))}
              </div>
              <Progress value={(currentPose / poses.length) * 100} className="mt-4" />
            </Card>

            {/* Training Tips */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Pro Tip:</strong> Maintain 90% accuracy for 3 seconds to complete each pose. 
                Focus on form over speed for better results.
              </AlertDescription>
            </Alert>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mt-8">
          <Link to="/modules">
            <Button variant="tactical" size="lg">
              Back to Modules
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dojo;