import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Trophy,
    Crown,
    Users,
    Target,
    Clock,
    Star,
    TrendingUp,
    RotateCcw,
    Home,
    Sword,
    Shield,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { number } from "zod";

const MultiPlayerResults = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Get results data from location state or use defaults
    const { player1Score, player2Score, player1Data, player2Data } =
        location.state || {
            player1Score: 0,
            player2Score: 0,
            player1Data: null,
            player2Data: null,
        };

    // Fallback: try to get data from localStorage if not in location state
    const [fallbackPlayer1Data, setFallbackPlayer1Data] = useState(null);
    const [fallbackPlayer2Data, setFallbackPlayer2Data] = useState(null);

    useEffect(() => {
        if (!player1Data || !player2Data) {
            const storedPlayer1 = JSON.parse(
                localStorage.getItem("multiplayer_player1_results") || "null"
            );
            const storedPlayer2 = JSON.parse(
                localStorage.getItem("multiplayer_player2_results") || "null"
            );
            setFallbackPlayer1Data(storedPlayer1);
            setFallbackPlayer2Data(storedPlayer2);
        }
    }, [player1Data, player2Data]);

    const [scores, setScores] = useState({
        player1: player1Score,
        player2: player2Score,
    });

    const [loading, setLoading] = useState(true);

    // Function to stop camera if it's running
    const stopCamera = () => {
        try {
            console.log("🎥 Starting comprehensive camera cleanup...");

            const videoElements = document.querySelectorAll("video");
            console.log(`Found ${videoElements.length} video elements`);

            videoElements.forEach((video, index) => {
                if (video.srcObject) {
                    const stream = video.srcObject;
                    console.log(`Video ${index} has stream:`, stream);

                    if (stream && stream.getTracks) {
                        const tracks = stream.getTracks();
                        console.log(
                            `Video ${index} has ${tracks.length} tracks`
                        );

                        tracks.forEach((track, trackIndex) => {
                            console.log(
                                `Stopping track ${trackIndex}:`,
                                track.kind,
                                track.label
                            );
                            track.stop();
                        });
                    }
                    video.srcObject = null;
                    video.pause();
                }
            });

            // Stop any MediaPipe cameras that might be running
            if (
                window.mediaPipeCameraRef &&
                window.mediaPipeCameraRef.current
            ) {
                console.log("Stopping MediaPipe camera");
                window.mediaPipeCameraRef.current.stop();
                window.mediaPipeCameraRef.current = null;
            }

            // Clear any global camera references
            if (window.streamRef && window.streamRef.current) {
                console.log("Stopping global stream reference");
                window.streamRef.current
                    .getTracks()
                    .forEach((track) => track.stop());
                window.streamRef.current = null;
            }

            console.log("🎥 Camera cleanup completed - all streams stopped");

            // Additional cleanup for any remaining streams
            setTimeout(() => {
                const remainingVideos = document.querySelectorAll("video");
                remainingVideos.forEach((video) => {
                    if (video.srcObject) {
                        video.srcObject = null;
                        video.pause();
                    }
                });
                console.log("🎥 Final camera cleanup completed");
            }, 100);
        } catch (error) {
            console.error("Error stopping camera:", error);
        }
    };

    // Stop camera when component mounts
    useEffect(() => {
        stopCamera();
        setLoading(false);
    }, []);

    const renderResults = () => {
        // Get player data with fallback to localStorage
        const player1Results = fallbackPlayer1Data || player1Data;
        const player2Results = fallbackPlayer2Data || player2Data;

        // Get accuracy and time for comparison
        const player1Accuracy = player1Results?.averageAccuracy || 0;
        const player2Accuracy = player2Results?.averageAccuracy || 0;
        const player1Time = player1Results?.totalTime || 0;
        const player2Time = player2Results?.totalTime || 0;

        // Determine winner: accuracy first, then time as tiebreaker
        let winner, loser, victoryMargin, isTie;

        if (Math.abs(player1Accuracy - player2Accuracy) < 0.1) {
            // Accuracies are essentially the same, compare times
            if (Math.abs(player1Time - player2Time) < 1) {
                // Times are also essentially the same
                isTie = true;
                winner = 1; // Default for display purposes
                loser = 2;
                victoryMargin = 0;
            } else {
                // Faster time wins
                winner = player1Time < player2Time ? 1 : 2;
                loser = winner === 1 ? 2 : 1;
                victoryMargin = Math.abs(player1Time - player2Time);
                isTie = false;
            }
        } else {
            // Higher accuracy wins
            winner = player1Accuracy > player2Accuracy ? 1 : 2;
            loser = winner === 1 ? 2 : 1;
            victoryMargin = Math.abs(player1Accuracy - player2Accuracy);
            isTie = false;
        }

        return (
            <div className="min-h-screen bg-gradient-hero p-6">
                <div className="container mx-auto max-w-6xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="mb-6">
                            {isTie ? (
                                <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-4" />
                            ) : (
                                <Crown className="w-24 h-24 text-primary mx-auto mb-4" />
                            )}
                            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                                {isTie ? "Battle Draw!" : "Battle Results"}
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                {isTie
                                    ? "Both warriors fought with equal skill!"
                                    : "The battlefield has been conquered!"}
                            </p>
                        </div>
                    </div>

                    {/* Winner Announcement */}
                    {!isTie && (
                        <Card className="p-8 mb-8 bg-card/80 backdrop-blur-sm border-border text-center">
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <Crown className="w-12 h-12 text-primary" />
                                <h2 className="text-3xl font-bold text-primary">
                                    Player {winner} Dominates the Battlefield!
                                </h2>
                                <Crown className="w-12 h-12 text-primary" />
                            </div>
                            <p className="text-lg text-muted-foreground">
                                Victory Margin: {victoryMargin.toFixed(1)}
                                {Math.abs(player1Accuracy - player2Accuracy) <
                                0.1
                                    ? " seconds"
                                    : "%"}
                            </p>
                        </Card>
                    )}

                    {/* Player Results */}
                    <div className="grid lg:grid-cols-2 gap-8 mb-8">
                        {/* Player 1 */}
                        <Card
                            className={`p-4 border-2 transition-all duration-300 ${
                                winner === 1 && !isTie
                                    ? "border-primary bg-primary/10 shadow-lg scale-105"
                                    : isTie
                                    ? "border-yellow-500 bg-yellow-500/10"
                                    : "border-border hover:border-primary/50"
                            }`}
                        >
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-3 mb-3">
                                    <Shield className="w-6 h-6 text-primary" />
                                    <h3 className="text-xl font-bold">
                                        Player 1
                                    </h3>
                                    {winner === 1 && !isTie && (
                                        <Crown className="w-6 h-6 text-primary" />
                                    )}
                                </div>

                                {/* Performance Stats */}
                                {player1Results && (
                                    <div className="mb-4 text-center">
                                        <div className="text-base text-muted-foreground space-y-2 font-semibold">
                                            <div>
                                                Accuracy:{" "}
                                                {player1Results.averageAccuracy.toFixed(
                                                    1
                                                )}
                                                %
                                            </div>
                                            <div>
                                                Time:{" "}
                                                {Math.round(
                                                    player1Results.totalTime ||
                                                        0
                                                )}
                                                s
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Victory Badge for Winner */}
                                {winner === 1 && !isTie && (
                                    <Badge className="mb-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-lg px-4 py-2 font-bold shadow-lg">
                                        <Trophy className="w-4 h-4 mr-2" />
                                        VICTORY
                                    </Badge>
                                )}

                                {isTie && (
                                    <Badge
                                        variant="outline"
                                        className="mt-2 bg-yellow-500 text-white text-lg px-4 py-2"
                                    >
                                        🤝 TIE
                                    </Badge>
                                )}
                            </div>
                        </Card>

                        {/* Player 2 */}
                        <Card
                            className={`p-4 border-2 transition-all duration-300 ${
                                winner === 2 && !isTie
                                    ? "border-primary bg-primary/10 shadow-lg scale-105"
                                    : isTie
                                    ? "border-yellow-500 bg-yellow-500/10"
                                    : "border-border hover:border-primary/50"
                            }`}
                        >
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-3 mb-3">
                                    <Sword className="w-6 h-6 text-primary" />
                                    <h3 className="text-xl font-bold">
                                        Player 2
                                    </h3>
                                    {winner === 2 && !isTie && (
                                        <Crown className="w-6 h-6 text-primary" />
                                    )}
                                </div>

                                {/* Performance Stats */}
                                {player2Results && (
                                    <div className="mb-4 text-center">
                                        <div className="text-base text-muted-foreground space-y-2 font-semibold">
                                            <div>
                                                Accuracy:{" "}
                                                {player2Results.averageAccuracy.toFixed(
                                                    1
                                                )}
                                                %
                                            </div>
                                            <div>
                                                Time:{" "}
                                                {Math.round(
                                                    player2Results.totalTime ||
                                                        0
                                                )}
                                                s
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Victory Badge for Winner */}
                                {winner === 2 && !isTie && (
                                    <Badge className="mb-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-lg px-4 py-2 font-bold shadow-lg">
                                        <Trophy className="w-4 h-4 mr-2" />
                                        VICTORY
                                    </Badge>
                                )}

                                {isTie && (
                                    <Badge
                                        variant="outline"
                                        className="mt-2 bg-yellow-500 text-white text-lg px-4 py-2"
                                    >
                                        🤝 TIE
                                    </Badge>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Battle Statistics */}
                    <Card className="p-8 mb-8 bg-card/80 backdrop-blur-sm border-border">
                        <h3 className="text-2xl font-bold mb-6 text-center">
                            Battle Statistics
                        </h3>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <Target className="w-12 h-12 text-primary mx-auto mb-3" />
                                <div className="text-3xl font-bold text-primary mb-2">
                                    {Math.max(
                                        scores.player1,
                                        scores.player2
                                    ).toFixed(2)}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Highest Score
                                </div>
                            </div>
                            <div className="text-center">
                                <TrendingUp className="w-12 h-12 text-primary mx-auto mb-3" />
                                <div className="text-3xl font-bold text-primary mb-2">
                                    {Math.round(victoryMargin)}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Victory Margin
                                </div>
                            </div>
                            <div className="text-center">
                                <Users className="w-12 h-12 text-primary mx-auto mb-3" />
                                <div className="text-3xl font-bold text-primary mb-2">
                                    2
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Warriors
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Detailed Player Statistics */}
                    {(player1Data ||
                        fallbackPlayer1Data ||
                        player2Data ||
                        fallbackPlayer2Data) && (
                        <Card className="p-8 mb-8 bg-card/80 backdrop-blur-sm border-border">
                            <h3 className="text-2xl font-bold mb-6 text-center">
                                Detailed Training Statistics
                            </h3>
                            <div className="grid lg:grid-cols-2 gap-8">
                                {/* Player 1 Details */}
                                <div className="space-y-4">
                                    <h4 className="text-xl font-semibold text-primary flex items-center gap-2">
                                        <Shield className="w-5 h-5" />
                                        Player 1 Details
                                    </h4>
                                    {(player1Data || fallbackPlayer1Data) && (
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Module:
                                                </span>
                                                <span className="font-semibold">
                                                    {(
                                                        player1Data ||
                                                        fallbackPlayer1Data
                                                    )?.module || "Module 1"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Total Time:
                                                </span>
                                                <span className="font-semibold">
                                                    {(
                                                        (
                                                            player1Data ||
                                                            fallbackPlayer1Data
                                                        )?.totalTime || 0
                                                    ).toFixed(1)}
                                                    s
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Average Accuracy:
                                                </span>
                                                <span className="font-semibold">
                                                    {(
                                                        (
                                                            player1Data ||
                                                            fallbackPlayer1Data
                                                        )?.averageAccuracy || 0
                                                    ).toFixed(1)}
                                                    %
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Player 2 Details */}
                                <div className="space-y-4">
                                    <h4 className="text-xl font-semibold text-primary flex items-center gap-2">
                                        <Sword className="w-5 h-5" />
                                        Player 2 Details
                                    </h4>
                                    {(player2Data || fallbackPlayer2Data) && (
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Module:
                                                </span>
                                                <span className="font-semibold">
                                                    {(
                                                        player2Data ||
                                                        fallbackPlayer2Data
                                                    )?.module || "Module 1"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Total Time:
                                                </span>
                                                <span className="font-semibold">
                                                    {(
                                                        (
                                                            player2Data ||
                                                            fallbackPlayer2Data
                                                        )?.totalTime || 0
                                                    ).toFixed(1)}
                                                    s
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Average Accuracy:
                                                </span>
                                                <span className="font-semibold">
                                                    {(
                                                        (
                                                            player2Data ||
                                                            fallbackPlayer2Data
                                                        )?.averageAccuracy || 0
                                                    ).toFixed(1)}
                                                    %
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            variant="combat"
                            size="lg"
                            onClick={() => {
                                // Reset game state and navigate back to battlefield
                                navigate("/battlefield");
                            }}
                            className="flex items-center gap-2"
                        >
                            <RotateCcw className="w-5 h-5" />
                            New Battle
                        </Button>
                        <Link to="/home">
                            <Button
                                variant="tactical"
                                size="lg"
                                className="flex items-center gap-2 w-full sm:w-auto"
                            >
                                <Home className="w-5 h-5" />
                                Return to Base
                            </Button>
                        </Link>
                    </div>

                    {/* Camera Cleanup Button */}
                    <div className="mt-8 text-center">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={stopCamera}
                            className="text-xs"
                        >
                            🎥 Stop Camera (if running)
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-hero p-6 flex items-center justify-center">
                <div className="text-center">
                    <Trophy className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
                    <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                        Loading Battle Results...
                    </h1>
                    <p className="text-muted-foreground">
                        Calculating final scores and determining the victor
                    </p>
                </div>
            </div>
        );
    }

    return renderResults();
};

export default MultiPlayerResults;
