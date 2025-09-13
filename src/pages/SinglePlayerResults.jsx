import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Trophy,
    Clock,
    Target,
    Star,
    TrendingUp,
    RotateCcw,
} from "lucide-react";
import { Link } from "react-router-dom";

const SinglePlayerResults = () => {
    // Mock data - would come from actual training session
    const sessionData = {
        totalScore: 267,
        maxScore: 300,
        totalTime: "8:43",
        accuracy: 89,
        poses: [
            {
                name: "Guard Position",
                score: 85,
                maxScore: 100,
                accuracy: 92,
                time: "2:15",
            },
            {
                name: "Defensive Stance",
                score: 78,
                maxScore: 100,
                accuracy: 87,
                time: "2:08",
            },
            {
                name: "Basic Block",
                score: 67,
                maxScore: 100,
                accuracy: 81,
                time: "2:45",
            },
            {
                name: "Ready Position",
                score: 37,
                maxScore: 100,
                accuracy: 94,
                time: "1:35",
            },
        ],
    };

    const percentage = Math.round(
        (sessionData.totalScore / sessionData.maxScore) * 100
    );

    const getPerformanceRating = (percentage) => {
        if (percentage >= 90)
            return {
                rating: "EXCELLENT",
                color: "bg-green-500",
                message: "Outstanding performance!",
            };
        if (percentage >= 80)
            return {
                rating: "GREAT",
                color: "bg-primary",
                message: "Strong defensive skills!",
            };
        if (percentage >= 70)
            return {
                rating: "GOOD",
                color: "bg-accent",
                message: "Solid foundation!",
            };
        return {
            rating: "POOR",
            color: "bg-destructive",
            message: "Keep training!",
        };
    };

    const performance = getPerformanceRating(percentage);

    const getPoseRating = (score) => {
        const posePercentage = score;
        if (posePercentage >= 90)
            return { rating: "Excellent", color: "text-green-400" };
        if (posePercentage >= 80)
            return { rating: "Great", color: "text-primary" };
        if (posePercentage >= 70)
            return { rating: "Good", color: "text-accent" };
        return { rating: "Poor", color: "text-destructive" };
    };

    return (
        <div className="min-h-screen bg-gradient-hero p-6">
            <div className="container mx-auto max-w-4xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
                    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                        Training Complete
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Your performance analysis is ready
                    </p>
                </div>

                {/* Overall Results */}
                <Card className="p-8 mb-8 bg-card/80 backdrop-blur-sm border-border">
                    <div className="text-center mb-6">
                        <Badge
                            className={`${performance.color} text-white text-lg px-4 py-2 mb-4`}
                        >
                            {performance.rating}
                        </Badge>
                        <h2 className="text-3xl font-bold mb-2">
                            {sessionData.totalScore} / {sessionData.maxScore}
                        </h2>
                        <p className="text-muted-foreground mb-4">
                            {performance.message}
                        </p>
                        <Progress
                            value={percentage}
                            className="w-full max-w-md mx-auto mb-4"
                        />
                        <div className="text-2xl font-bold text-primary">
                            {percentage}%
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
                            <div className="text-2xl font-bold">
                                {sessionData.totalTime}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Total Time
                            </div>
                        </div>
                        <div className="text-center">
                            <Target className="w-8 h-8 text-primary mx-auto mb-2" />
                            <div className="text-2xl font-bold">
                                {sessionData.accuracy}%
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Average Accuracy
                            </div>
                        </div>
                        <div className="text-center">
                            <Star className="w-8 h-8 text-primary mx-auto mb-2" />
                            <div className="text-2xl font-bold">
                                {sessionData.poses.length}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Poses Completed
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Detailed Breakdown */}
                <Card className="p-6 mb-8 bg-card/80 backdrop-blur-sm border-border">
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-primary" />
                        Pose Performance Breakdown
                    </h3>

                    <div className="space-y-4">
                        {sessionData.poses.map((pose, index) => {
                            const poseRating = getPoseRating(pose.accuracy);
                            return (
                                <div
                                    key={index}
                                    className="border border-border rounded-lg p-4"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h4 className="font-semibold">
                                                {pose.name}
                                            </h4>
                                            <Badge
                                                variant="outline"
                                                className={poseRating.color}
                                            >
                                                {poseRating.rating}
                                            </Badge>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold">
                                                {pose.score}/100
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {pose.time}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <div className="text-muted-foreground">
                                                Accuracy
                                            </div>
                                            <div className="font-semibold">
                                                {pose.accuracy}%
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-muted-foreground">
                                                Completion Time
                                            </div>
                                            <div className="font-semibold">
                                                {pose.time}
                                            </div>
                                        </div>
                                    </div>

                                    <Progress
                                        value={pose.score}
                                        className="mt-3"
                                    />
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/modules">
                        <Button variant="combat" size="lg">
                            <RotateCcw className="w-5 h-5 mr-2" />
                            Train Again
                        </Button>
                    </Link>
                    <Link to="/home">
                        <Button variant="tactical" size="lg">
                            Return to Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SinglePlayerResults;
