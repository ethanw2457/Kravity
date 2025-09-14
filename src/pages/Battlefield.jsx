import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Crown, Timer, Target, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const Battlefield = () => {
    const [gameState, setGameState] = useState("setup");
    const [scores, setScores] = useState({ player1: 0, player2: 0 });
    const [currentPlayer, setCurrentPlayer] = useState(1);

    const handleStartGame = () => {
        setGameState("player1");
    };

    const handlePlayerComplete = (score) => {
        if (currentPlayer === 1) {
            setScores((prev) => ({ ...prev, player1: score }));
            setCurrentPlayer(2);
            setGameState("player2");
        } else {
            setScores((prev) => ({ ...prev, player2: score }));
            setGameState("results");
        }
    };

    const renderSetup = () => (
        <div className="text-center">
            <div className="mb-8">
                <Users className="w-24 h-24 text-primary mx-auto mb-6" />
                <h2 className="text-3xl font-bold mb-4">
                    Multiplayer Battlefield
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Two warriors will compete in turn-based combat training.
                    Each player completes the same module, then scores are
                    compared to determine the victor.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
                    <div className="text-center">
                        <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">Player 1</h3>
                        <Badge variant="outline" className="mb-2">
                            Ready
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                            First to enter the battlefield
                        </p>
                    </div>
                </Card>
                <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
                    <div className="text-center">
                        <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">Player 2</h3>
                        <Badge variant="outline" className="mb-2">
                            Waiting
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                            Awaits their turn
                        </p>
                    </div>
                </Card>
            </div>

            <div className="space-y-4 mb-8">
                <h3 className="text-xl font-semibold">Combat Rules</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-accent" />
                        <span>Same module for both players</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Timer className="w-4 h-4 text-accent" />
                        <span>Best time and accuracy wins</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-accent" />
                        <span>Winner takes the battlefield</span>
                    </div>
                </div>
            </div>

            <Button variant="combat" size="lg" onClick={handleStartGame}>
                Enter Battlefield
                <Users className="w-5 h-5 ml-2" />
            </Button>
        </div>
    );

    const renderPlayerTurn = () => (
        <div className="text-center">
            <div className="mb-8">
                <Badge variant="outline" className="mb-4 text-lg px-4 py-2">
                    Player {currentPlayer}'s Turn
                </Badge>
                <h2 className="text-3xl font-bold mb-4">Ready for Combat</h2>
                <p className="text-lg text-muted-foreground">
                    Complete the training module with maximum precision and
                    speed
                </p>
            </div>

            <Card className="p-8 mb-8 bg-card/80 backdrop-blur-sm border-border">
                <h3 className="text-2xl font-bold mb-4">
                    Basic Defense Stances
                </h3>
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary">4</div>
                        <div className="text-sm text-muted-foreground">
                            Combat Poses
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                            100
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Starting Points
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                            90%
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Target Accuracy
                        </div>
                    </div>
                </div>

                {currentPlayer === 1 && scores.player1 === 0 && (
                    <Link to="/dojo/1">
                        <Button variant="hero" size="lg">
                            Begin Training Module
                            <Shield className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                )}

                {currentPlayer === 2 && scores.player2 === 0 && (
                    <Link to="/dojo/1">
                        <Button variant="hero" size="lg">
                            Begin Training Module
                            <Shield className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                )}
            </Card>

            {/* Mock completion for demo */}
            <Button
                variant="tactical"
                onClick={() =>
                    handlePlayerComplete(Math.floor(Math.random() * 50) + 200)
                }
                className="mr-4"
            >
                Simulate Completion (Demo)
            </Button>
        </div>
    );

    const renderResults = () => {
        const winner = scores.player1 > scores.player2 ? 1 : 2;
        const loser = winner === 1 ? 2 : 1;

        return (
            <div className="text-center">
                <div className="mb-8">
                    <Crown className="w-24 h-24 text-primary mx-auto mb-6" />
                    <h2 className="text-3xl font-bold mb-4">Battle Results</h2>
                    <p className="text-lg text-muted-foreground">
                        The battlefield has been conquered!
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <Card
                        className={`p-6 border-2 ${
                            winner === 1
                                ? "border-primary bg-primary/10"
                                : "border-border"
                        }`}
                    >
                        <div className="text-center">
                            {winner === 1 && (
                                <Crown className="w-8 h-8 text-primary mx-auto mb-2" />
                            )}
                            <h3 className="text-xl font-bold mb-2">Player 1</h3>
                            <div className="text-3xl font-bold text-primary mb-2">
                                {scores.player1}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Final Score
                            </div>
                            {winner === 1 && (
                                <Badge
                                    variant="outline"
                                    className="mt-2 bg-primary text-primary-foreground"
                                >
                                    VICTOR
                                </Badge>
                            )}
                        </div>
                    </Card>
                    <Card
                        className={`p-6 border-2 ${
                            winner === 2
                                ? "border-primary bg-primary/10"
                                : "border-border"
                        }`}
                    >
                        <div className="text-center">
                            {winner === 2 && (
                                <Crown className="w-8 h-8 text-primary mx-auto mb-2" />
                            )}
                            <h3 className="text-xl font-bold mb-2">Player 2</h3>
                            <div className="text-3xl font-bold text-primary mb-2">
                                {scores.player2}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Final Score
                            </div>
                            {winner === 2 && (
                                <Badge
                                    variant="outline"
                                    className="mt-2 bg-primary text-primary-foreground"
                                >
                                    VICTOR
                                </Badge>
                            )}
                        </div>
                    </Card>
                </div>

                <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-primary mb-2">
                        Player {winner} Dominates the Battlefield!
                    </h3>
                    <p className="text-muted-foreground">
                        Victory margin:{" "}
                        {Math.abs(scores.player1 - scores.player2)} points
                    </p>
                </div>

                <div className="space-x-4">
                    <Button
                        variant="combat"
                        size="lg"
                        onClick={() => {
                            setGameState("setup");
                            setScores({ player1: 0, player2: 0 });
                            setCurrentPlayer(1);
                        }}
                    >
                        New Battle
                    </Button>
                    <Link to="/home">
                        <Button variant="tactical" size="lg">
                            Return to Base
                        </Button>
                    </Link>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-hero p-6">
            <div className="container mx-auto max-w-4xl">
                {gameState === "setup" && renderSetup()}
                {(gameState === "player1" || gameState === "player2") &&
                    renderPlayerTurn()}
                {gameState === "results" && renderResults()}
            </div>
        </div>
    );
};

export default Battlefield;
