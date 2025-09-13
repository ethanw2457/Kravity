import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Clock, Trophy, Zap, Shield, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const ModulesDescription = () => {
    const modules = [
        {
            id: 1,
            title: "Basic Defense Stances",
            difficulty: "Beginner",
            poses: 6,
            description:
                "Master fundamental defensive positions and blocking techniques",
            techniques: [
                "Guard Position Right Jab",
                "Guard Position Left Jab",
                "Basic Block with Right Hand",
                "Basic Block with Left Hand",
                "Crane Stance",
                "Crane Kick!",
            ],
            estimatedTime: "8-12 min",
        },
        {
            id: 2,
            title: "Counter-Attack Combinations",
            difficulty: "Intermediate",
            poses: 4,
            description:
                "Learn to transition from defense to offense with fluid combinations",
            techniques: [
                "Defensive Block Stance with Left Hand",
                "Defensive Block Stance with Right Hand",
                "Knee Defense with Left Hand",
                "Knee Defense with Right Hand",
            ],
            estimatedTime: "10-15 min",
        },
        {
            id: 3,
            title: "Advanced Grappling Defense",
            difficulty: "Advanced",
            poses: 4,
            description:
                "Escape techniques for close-quarters combat situations",
            techniques: [
                "Choke Defense",
                "Grab Release",
                "Ground Position",
                "Escape Stance",
            ],
            estimatedTime: "12-18 min",
        },
    ];

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case "Beginner":
                return "bg-green-500";
            case "Intermediate":
                return "bg-accent";
            case "Advanced":
                return "bg-destructive";
            default:
                return "bg-primary";
        }
    };

    return (
        <div className="min-h-screen bg-gradient-hero p-6">
            <div className="container mx-auto max-w-6xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                        Training Modules
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Each module contains multiple pose sequences designed to
                        build your defensive skills progressively
                    </p>
                </div>

                {/* Training Overview */}
                <Card className="p-6 mb-8 bg-card/80 backdrop-blur-sm border-border">
                    <div className="grid md:grid-cols-4 gap-6 text-center">
                        <div className="flex flex-col items-center gap-2">
                            <Target className="w-8 h-8 text-primary" />
                            <div className="text-2xl font-bold">90%</div>
                            <div className="text-sm text-muted-foreground">
                                Accuracy Required
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Clock className="w-8 h-8 text-primary" />
                            <div className="text-2xl font-bold">3s</div>
                            <div className="text-sm text-muted-foreground">
                                Hold Duration
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Trophy className="w-8 h-8 text-primary" />
                            <div className="text-2xl font-bold">300</div>
                            <div className="text-sm text-muted-foreground">
                                Max Points
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Zap className="w-8 h-8 text-primary" />
                            <div className="text-2xl font-bold">100</div>
                            <div className="text-sm text-muted-foreground">
                                Starting Points
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Module Cards */}
                <div className="space-y-6 mb-8">
                    {modules.map((module) => (
                        <Card
                            key={module.id}
                            className="p-6 bg-card/80 backdrop-blur-sm border-border hover:shadow-tactical transition-all duration-300"
                        >
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="md:col-span-2">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Badge
                                            variant="outline"
                                            className={`${getDifficultyColor(
                                                module.difficulty
                                            )} text-white border-0`}
                                        >
                                            {module.difficulty}
                                        </Badge>
                                        <Badge variant="outline">
                                            {module.poses} Poses
                                        </Badge>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3">
                                        {module.title}
                                    </h3>
                                    <p className="text-muted-foreground mb-4">
                                        {module.description}
                                    </p>

                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        {module.techniques.map(
                                            (technique, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-2 text-sm"
                                                >
                                                    <Shield className="w-4 h-4 text-primary" />
                                                    <span>{technique}</span>
                                                </div>
                                            )
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="w-4 h-4" />
                                        <span>
                                            Estimated time:{" "}
                                            {module.estimatedTime}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-between">
                                    <div className="text-center mb-4">
                                        <div className="text-3xl font-bold text-primary mb-2">
                                            Module {module.id}
                                        </div>
                                        <Progress
                                            value={0}
                                            className="w-full mb-2"
                                        />
                                        <div className="text-sm text-muted-foreground">
                                            0% Complete
                                        </div>
                                    </div>

                                    <Link to={`/dojo/${module.id}`}>
                                        <Button
                                            variant="combat"
                                            className="w-full"
                                        >
                                            Start Module
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Navigation */}
                <div className="flex justify-center gap-4">
                    <Link to="/home">
                        <Button variant="tactical" size="lg">
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ModulesDescription;
