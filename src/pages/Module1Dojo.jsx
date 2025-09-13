import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Camera,
    Target,
    Clock,
    Zap,
    AlertCircle,
    Play,
    Pause,
    ArrowLeft,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera as MediaPipeCamera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import poseReferenceAngles from "../data/poseReferenceAngles.json";

const Module1Dojo = () => {
    const { moduleId } = useParams();
    const [currentPose, setCurrentPose] = useState(0);
    const [isTraining, setIsTraining] = useState(false);
    const [accuracy, setAccuracy] = useState(0);
    const [holdTimer, setHoldTimer] = useState(0);
    const [score, setScore] = useState(100);
    const [feedback, setFeedback] = useState("");
    const [cameraActive, setCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState("");
    const [accuracyTimer, setAccuracyTimer] = useState(0);
    const [isAccuracyTimerActive, setIsAccuracyTimerActive] = useState(false);
    const [poseStartTime, setPoseStartTime] = useState(null);
    const [poseTimes, setPoseTimes] = useState({});
    const [stopwatchTime, setStopwatchTime] = useState(0);
    const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const canvasRef = useRef(null);

    // Pose detection states
    const [isMediaPipeLoaded, setIsMediaPipeLoaded] = useState(false);
    const [poseDetector, setPoseDetector] = useState(null);
    const [poseResults, setPoseResults] = useState(null);
    const [jointAngles, setJointAngles] = useState({
        leftShoulder: 0,
        rightShoulder: 0,
        leftElbow: 0,
        rightElbow: 0,
        leftKnee: 0,
        rightKnee: 0,
    });
    const [referenceAngles, setReferenceAngles] = useState(null);
    const [jointScores, setJointScores] = useState({
        leftShoulder: 0,
        rightShoulder: 0,
        leftElbow: 0,
        rightElbow: 0,
        leftKnee: 0,
        rightKnee: 0,
    });
    const [individualJointAccuracies, setIndividualJointAccuracies] = useState({
        leftShoulder: 0,
        rightShoulder: 0,
        leftElbow: 0,
        rightElbow: 0,
        leftKnee: 0,
        rightKnee: 0,
    });
    const [overallAccuracy, setOverallAccuracy] = useState(0);

    // Animation frame references
    const videoAnimationRef = useRef(null);
    const poseAnimationRef = useRef(null);
    const mediaPipeCameraRef = useRef(null);
    const referenceAnglesRef = useRef(null);
    const referenceWeightsRef = useRef(null);

    const poses = [
        {
            id: 1,
            name: "Guard Position Right Jab",
            description:
                "Maintain a balanced defensive stance with hands raised",
            keyPoints: [
                "Feet shoulder-width apart",
                "Hands at face level",
                "Weight evenly distributed",
                "Eyes focused forward",
            ],
        },
        {
            id: 2,
            name: "Guard Position Left Jab",
            description:
                "Lower defensive position ready to block incoming attacks",
            keyPoints: [
                "Slight crouch",
                "Arms positioned to protect body",
                "Quick reaction posture",
                "Stable base",
            ],
        },
        {
            id: 3,
            name: "Basic Block with Right Hand",
            description: "Execute a fundamental blocking movement",
            keyPoints: [
                "Forearm parallel to ground",
                "Elbow at 90 degrees",
                "Strong defensive position",
                "Ready to counter",
            ],
        },
        {
            id: 4,
            name: "Basic Block with Left Hand",
            description: "Return to neutral combat-ready stance",
            keyPoints: [
                "Relaxed but alert",
                "Hands at sides",
                "Weight balanced",
                "Ready to react",
            ],
        },
        {
            id: 5,
            name: "Crane Stance",
            description: "Crane stance",
            keyPoints: ["Hands at sides", "Weight balanced", "Ready to react"],
        },
        {
            id: 6,
            name: "Crane Kick!",
            description: "Crane kick",
            keyPoints: ["Hands at sides", "Weight balanced", "Just Kick!"],
        },
    ];

    const currentPoseData = poses[currentPose];

    // Functions for pose timing and localStorage
    const savePoseTime = (poseIndex, timeInSeconds) => {
        const poseKey = `pose${poseIndex + 1}`;
        const newPoseTimes = { ...poseTimes, [poseKey]: timeInSeconds };
        setPoseTimes(newPoseTimes);
        localStorage.setItem(
            "module1_pose_times",
            JSON.stringify(newPoseTimes)
        );
        console.log(
            `Pose ${poseIndex + 1} completed in ${timeInSeconds.toFixed(
                2
            )} seconds`
        );
    };

    const loadPoseTimes = () => {
        const saved = localStorage.getItem("module1_pose_times");
        if (saved) {
            const parsed = JSON.parse(saved);
            setPoseTimes(parsed);
            console.log("Loaded pose times:", parsed);
        }
    };

    // Function to get reference angles and weights for current pose
    const getPoseReferenceData = (poseIndex) => {
        switch (poseIndex) {
            case 0: // First pose - Guard Position Right Jab
                return poseReferenceAngles.poses.guardRight;
            case 1: // Second pose - Guard Position Left Jab
                return poseReferenceAngles.poses.guardLeft;
            case 2: // Third pose - Basic Block with Right Hand
                return poseReferenceAngles.poses.basicBlockRight;
            case 3: // Fourth pose - Basic Block with Left Hand
                return poseReferenceAngles.poses.basicBlockLeft;
            case 4: // Fifth pose - Crane Stance
                return poseReferenceAngles.poses.crane;
            case 5: // Sixth pose - Crane Kick!
                return poseReferenceAngles.poses.craneKick;
            default:
                // Default to guardRight for any additional poses
                return poseReferenceAngles.poses.guardRight;
        }
    };

    // Load pose times from localStorage on component mount
    useEffect(() => {
        loadPoseTimes();
    }, []);

    // Stopwatch timer effect
    useEffect(() => {
        let interval = null;
        if (isStopwatchRunning) {
            interval = setInterval(() => {
                setStopwatchTime((time) => time + 0.1);
            }, 100);
        } else if (!isStopwatchRunning && stopwatchTime !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isStopwatchRunning, stopwatchTime]);

    // MediaPipe initialization
    useEffect(() => {
        const initializeMediaPipe = async () => {
            try {
                const pose = new Pose({
                    locateFile: (file) => {
                        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
                    },
                });

                pose.setOptions({
                    modelComplexity: 1,
                    smoothLandmarks: true,
                    enableSegmentation: false,
                    smoothSegmentation: false,
                    minDetectionConfidence: 0.5,
                    minTrackingConfidence: 0.5,
                });

                pose.onResults((results) => {
                    setPoseResults(results);
                    if (results.poseLandmarks) {
                        console.log(
                            "Pose detected with",
                            results.poseLandmarks.length,
                            "landmarks"
                        );
                        calculateJointAngles(results.poseLandmarks);
                        drawPoseLandmarks(results);
                    } else {
                        console.log("No pose landmarks detected");
                    }
                });

                setPoseDetector(pose);
                setIsMediaPipeLoaded(true);
            } catch (error) {
                console.error("Error initializing MediaPipe:", error);
            }
        };

        initializeMediaPipe();
    }, []);

    // Utility function to calculate angle between three points (3D)
    const calculateAngle = (p1, p2, p3) => {
        const v1 = { x: p1.x - p2.x, y: p1.y - p2.y, z: p1.z - p2.z };
        const v2 = { x: p3.x - p2.x, y: p3.y - p2.y, z: p3.z - p2.z };
        const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
        const mag1 = Math.sqrt(v1.x ** 2 + v1.y ** 2 + v1.z ** 2);
        const mag2 = Math.sqrt(v2.x ** 2 + v2.y ** 2 + v2.z ** 2);
        if (mag1 === 0 || mag2 === 0) return 0;
        const cos = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
        return Math.round((Math.acos(cos) * 180) / Math.PI);
    };

    // Calculate joint angles from pose landmarks
    const calculateJointAngles = (landmarks) => {
        if (!landmarks || landmarks.length < 33) {
            return {
                leftShoulder: 0,
                rightShoulder: 0,
                leftElbow: 0,
                rightElbow: 0,
                leftKnee: 0,
                rightKnee: 0,
            };
        }

        // MediaPipe pose landmark indices
        const LEFT_SHOULDER = 11;
        const RIGHT_SHOULDER = 12;
        const LEFT_ELBOW = 13;
        const RIGHT_ELBOW = 14;
        const LEFT_WRIST = 15;
        const RIGHT_WRIST = 16;
        const LEFT_HIP = 23;
        const RIGHT_HIP = 24;
        const LEFT_KNEE = 25;
        const RIGHT_KNEE = 26;
        const LEFT_ANKLE = 27;
        const RIGHT_ANKLE = 28;

        const angles = {
            // Shoulder angles (elbow-shoulder-hip)
            // Note: Camera shows mirrored view, so left/right labels match what you see
            leftShoulder: calculateAngle(
                landmarks[LEFT_ELBOW], // What you see as left elbow
                landmarks[LEFT_SHOULDER], // What you see as left shoulder
                landmarks[LEFT_HIP] // What you see as left hip
            ),
            rightShoulder: calculateAngle(
                landmarks[RIGHT_ELBOW], // What you see as right elbow
                landmarks[RIGHT_SHOULDER], // What you see as right shoulder
                landmarks[RIGHT_HIP] // What you see as right hip
            ),

            // Elbow angles (bend angle: 180° - internal angle)
            // Note: Camera shows mirrored view, so left/right labels match what you see
            leftElbow:
                180 -
                calculateAngle(
                    landmarks[LEFT_WRIST], // What you see as left wrist
                    landmarks[LEFT_ELBOW], // What you see as left elbow
                    landmarks[LEFT_SHOULDER] // What you see as left shoulder
                ),
            rightElbow:
                180 -
                calculateAngle(
                    landmarks[RIGHT_WRIST], // What you see as right wrist
                    landmarks[RIGHT_ELBOW], // What you see as right elbow
                    landmarks[RIGHT_SHOULDER] // What you see as right shoulder
                ),

            // Knee angles (ankle-knee-hip)
            // Note: Camera shows mirrored view, so left/right labels match what you see
            leftKnee: calculateAngle(
                landmarks[LEFT_ANKLE], // What you see as left ankle
                landmarks[LEFT_KNEE], // What you see as left knee
                landmarks[LEFT_HIP] // What you see as left hip
            ),
            rightKnee: calculateAngle(
                landmarks[RIGHT_ANKLE], // What you see as right ankle
                landmarks[RIGHT_KNEE], // What you see as right knee
                landmarks[RIGHT_HIP] // What you see as right hip
            ),
        };

        setJointAngles(angles);

        // Calculate overall accuracy based on joint angles
        const currentReferenceAngles = referenceAnglesRef.current;
        console.log("Reference angles available:", currentReferenceAngles);
        if (currentReferenceAngles) {
            const accuracy = calculateAccuracy(angles, currentReferenceAngles);
            console.log(
                "Calculated accuracy:",
                accuracy,
                "from angles:",
                angles
            );
            setOverallAccuracy(accuracy);
        } else {
            console.log("No reference angles set yet, current angles:", angles);
        }
    };

    // Calculate accuracy based on joint angles with degree tolerance
    const calculateAccuracy = (currentAngles, targetAngles) => {
        if (!targetAngles) return 0;

        const jointAccuracies = {};
        let totalAccuracy = 0;
        let jointCount = 0;
        const weights = referenceWeightsRef.current || {};

        // Define tolerance for each joint type (in degrees)
        const tolerances = {
            leftElbow: 10,
            rightElbow: 10,
            leftKnee: 10,
            rightKnee: 10,
            leftShoulder: 10,
            rightShoulder: 10,
        };

        // Calculate accuracy for each joint
        Object.keys(currentAngles).forEach((joint) => {
            if (targetAngles[joint] !== undefined) {
                // Calculate error: absolute difference between real and reference angle
                const error = Math.abs(
                    currentAngles[joint] - targetAngles[joint]
                );
                const tolerance = tolerances[joint] || 5; // Default 5 degree tolerance

                let jointAccuracy;

                if (error <= tolerance) {
                    // Within tolerance - give high score (90-100%)
                    // Linear interpolation: 0° error = 100%, tolerance° error = 90%
                    jointAccuracy = 100 - (error / tolerance) * 10;
                } else {
                    // Outside tolerance - apply penalty
                    const excessError = error - tolerance;
                    const k = 2; // 2 points per degree beyond tolerance
                    jointAccuracy = Math.max(0, 90 - excessError * k);
                }

                jointAccuracies[joint] = jointAccuracy;
                totalAccuracy += jointAccuracy;
                jointCount++;

                const weight = weights[joint] || 1.0;
                console.log(
                    `${joint}: current=${currentAngles[joint]}°, target=${
                        targetAngles[joint]
                    }°, error=${error}°, tolerance=${tolerance}°, weight=${weight}, accuracy=${jointAccuracy.toFixed(
                        1
                    )}%`
                );
            }
        });

        // Calculate weighted overall accuracy
        let weightedTotal = 0;
        let totalWeight = 0;

        Object.keys(jointAccuracies).forEach((joint) => {
            const weight = weights[joint] || 1.0;
            weightedTotal += jointAccuracies[joint] * weight;
            totalWeight += weight;
        });

        const overallAccuracy =
            totalWeight > 0 ? weightedTotal / totalWeight : 0;

        // Store individual joint accuracies for potential display
        setIndividualJointAccuracies(jointAccuracies);

        console.log(
            `Weighted overall accuracy: ${overallAccuracy.toFixed(1)}%`
        );

        return overallAccuracy;
    };

    // Draw pose landmarks on canvas
    const drawPoseLandmarks = (results) => {
        if (!canvasRef.current || !results.poseLandmarks) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        // Set canvas size to match video
        if (videoRef.current) {
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
        }

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw pose landmarks
        if (results.poseLandmarks) {
            const landmarks = results.poseLandmarks;

            // Draw skeleton connections manually
            ctx.strokeStyle = "#00FF00";
            ctx.lineWidth = 3;
            ctx.beginPath();

            // Define pose connections (MediaPipe pose landmark indices)
            const connections = [
                // Face
                [0, 1],
                [1, 2],
                [2, 3],
                [3, 7],
                [0, 4],
                [4, 5],
                [5, 6],
                [6, 8],
                // Torso
                [11, 12],
                [11, 13],
                [12, 14],
                [11, 23],
                [12, 24],
                [23, 24],
                // Left arm
                [11, 13],
                [13, 15],
                [15, 17],
                [15, 19],
                [15, 21],
                [17, 19],
                [19, 21],
                // Right arm
                [12, 14],
                [14, 16],
                [16, 18],
                [16, 20],
                [16, 22],
                [18, 20],
                [20, 22],
                // Left leg
                [23, 25],
                [25, 27],
                [27, 29],
                [27, 31],
                [29, 31],
                // Right leg
                [24, 26],
                [26, 28],
                [28, 30],
                [28, 32],
                [30, 32],
            ];

            // Draw connections
            connections.forEach(([start, end]) => {
                if (landmarks[start] && landmarks[end]) {
                    const startX = landmarks[start].x * canvas.width;
                    const startY = landmarks[start].y * canvas.height;
                    const endX = landmarks[end].x * canvas.width;
                    const endY = landmarks[end].y * canvas.height;

                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                }
            });
            ctx.stroke();

            // Draw landmarks (joints) on top
            ctx.fillStyle = "#FF0000";
            landmarks.forEach((landmark, index) => {
                if (landmark.visibility > 0.5) {
                    // Only draw visible landmarks
                    const x = landmark.x * canvas.width;
                    const y = landmark.y * canvas.height;
                    ctx.beginPath();
                    ctx.arc(x, y, 4, 0, 2 * Math.PI);
                    ctx.fill();
                }
            });
        }
    };

    // Camera functions
    const startCamera = async () => {
        try {
            setCameraError("");
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: "user",
                },
                audio: false,
            });

            streamRef.current = stream;
            setCameraActive(true);

            // Start pose detection when camera is active
            if (isMediaPipeLoaded && poseDetector && videoRef.current) {
                startPoseDetection();
            }
        } catch (error) {
            console.error("Error accessing camera:", error);
            setCameraError(
                "Unable to access camera. Please check permissions and try again."
            );
        }
    };

    // Start pose detection
    const startPoseDetection = () => {
        if (videoRef.current && poseDetector) {
            const camera = new MediaPipeCamera(videoRef.current, {
                onFrame: async () => {
                    if (poseDetector) {
                        await poseDetector.send({ image: videoRef.current });
                    }
                },
                width: 1280,
                height: 720,
            });
            mediaPipeCameraRef.current = camera;
            camera.start();
        }
    };

    const stopCamera = () => {
        // Stop the media stream
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        // Clear video element
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        // Stop MediaPipe camera if it's running
        if (mediaPipeCameraRef.current) {
            mediaPipeCameraRef.current.stop();
            mediaPipeCameraRef.current = null;
        }

        // Cancel any animation frames
        if (poseAnimationRef.current) {
            cancelAnimationFrame(poseAnimationRef.current);
            poseAnimationRef.current = null;
        }

        // Reset accuracy and timer when camera stops
        setAccuracy(0);
        setAccuracyTimer(0);
        setIsAccuracyTimerActive(false);

        setCameraActive(false);
    };

    // Set video srcObject when stream is available and start pose detection
    useEffect(() => {
        if (streamRef.current && videoRef.current) {
            videoRef.current.srcObject = streamRef.current;

            // Start pose detection when both camera and MediaPipe are ready
            if (cameraActive && isMediaPipeLoaded && poseDetector) {
                startPoseDetection();
            }
        }
    }, [cameraActive, isMediaPipeLoaded, poseDetector]);

    // Cleanup camera on component unmount or when training stops
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    // Stop camera when training stops
    useEffect(() => {
        if (!isTraining && cameraActive) {
            stopCamera();
        }
    }, [isTraining, cameraActive]);

    // Update accuracy immediately when overallAccuracy changes
    useEffect(() => {
        if (isTraining && cameraActive && overallAccuracy > 0) {
            setAccuracy(overallAccuracy);
        }
    }, [overallAccuracy, isTraining, cameraActive]);

    // Update accuracy every 0.5 seconds during training for fallback
    useEffect(() => {
        if (isTraining && cameraActive) {
            const interval = setInterval(() => {
                if (poseResults && poseResults.poseLandmarks) {
                    // Update accuracy based on actual pose detection
                    if (overallAccuracy > 0) {
                        setAccuracy(overallAccuracy);
                    } else if (poseResults.poseLandmarks) {
                        // Show that pose is detected but no reference angles set yet
                        setAccuracy(85); // Default accuracy when pose is detected
                    }
                } else {
                    // No pose detected yet
                    setAccuracy(0);
                }
            }, 500); // Update every 0.5 seconds

            return () => clearInterval(interval);
        }
    }, [isTraining, cameraActive, poseResults, overallAccuracy]);

    // Monitor accuracy and manage timer for pose progression
    useEffect(() => {
        if (isTraining && cameraActive && accuracy >= 90) {
            // Start or continue the timer
            if (!isAccuracyTimerActive) {
                setIsAccuracyTimerActive(true);
                setAccuracyTimer(0);
            }
        } else if (isTraining && cameraActive && accuracy < 90) {
            // Reset timer if accuracy falls below 90%
            if (isAccuracyTimerActive) {
                setIsAccuracyTimerActive(false);
                setAccuracyTimer(0);
            }
        }
    }, [accuracy, isTraining, cameraActive, isAccuracyTimerActive]);

    // Timer effect - increment timer every second when active
    useEffect(() => {
        if (isAccuracyTimerActive && isTraining && cameraActive) {
            const timerInterval = setInterval(() => {
                setAccuracyTimer((prev) => {
                    const newTime = prev + 1;
                    if (newTime >= 3) {
                        // Timer reached 3 seconds, progress to next pose
                        progressToNextPose();
                        return 0;
                    }
                    return newTime;
                });
            }, 1000);

            return () => clearInterval(timerInterval);
        }
    }, [isAccuracyTimerActive, isTraining, cameraActive]);

    const handleStartTraining = async () => {
        // Reset timer when starting training
        setAccuracyTimer(0);
        setIsAccuracyTimerActive(false);

        // Start stopwatch
        setStopwatchTime(0);
        setIsStopwatchRunning(true);

        // Start timing for this pose
        setPoseStartTime(Date.now());

        // Set reference angles and weights FIRST before starting camera
        const poseData = getPoseReferenceData(currentPose);
        const poseAngles = poseData.angles;
        const poseWeights = poseData.weights;

        setReferenceAngles(poseAngles);
        referenceAnglesRef.current = poseAngles; // Also set ref for immediate access
        referenceWeightsRef.current = poseWeights; // Store weights for calculation

        console.log("Reference angles set:", poseAngles);
        console.log("Reference weights set:", poseWeights);

        await startCamera();
        setIsTraining(true);
        setFeedback("Position yourself in front of the camera and begin!");
    };

    const handlePauseTraining = () => {
        setIsTraining(false);
        stopCamera();
        // Stop and reset timer when pausing
        setAccuracyTimer(0);
        setIsAccuracyTimerActive(false);
        // Pause stopwatch
        setIsStopwatchRunning(false);
        setFeedback("Training paused. Click resume when ready.");
    };

    // Function to progress to next pose
    const progressToNextPose = () => {
        // Stop and reset timer immediately
        setAccuracyTimer(0);
        setIsAccuracyTimerActive(false);

        // Reset stopwatch
        setStopwatchTime(0);
        setIsStopwatchRunning(false);

        // Save pose completion time
        if (poseStartTime) {
            const completionTime = (Date.now() - poseStartTime) / 1000; // Convert to seconds
            savePoseTime(currentPose, completionTime);
            setPoseStartTime(null);
        }

        if (currentPose < poses.length - 1) {
            // Turn off camera and pause training
            stopCamera();
            setIsTraining(false);

            // Move to next pose
            setCurrentPose((prev) => prev + 1);
            setScore((prev) => prev + 5);
            setFeedback(
                "Pose completed! Click 'Start Training' to begin the next pose."
            );

            // Set reference angles for the new pose
            const nextPoseIndex = currentPose + 1;
            if (nextPoseIndex < poses.length) {
                const poseData = getPoseReferenceData(nextPoseIndex);
                const poseAngles = poseData.angles;
                const poseWeights = poseData.weights;

                setReferenceAngles(poseAngles);
                referenceAnglesRef.current = poseAngles;
                referenceWeightsRef.current = poseWeights;
            }
        } else {
            // All poses completed
            setIsTraining(false);
            stopCamera();
            setFeedback("Module completed! Excellent work!");
        }
    };

    const isCompleted = currentPose >= poses.length;

    return (
        <div className="min-h-screen bg-gradient-hero p-6">
            <div className="container mx-auto max-w-6xl">
                {/* Back Button */}
                <div className="mb-6">
                    <Link to="/modules">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Modules
                        </Button>
                    </Link>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                        Training Dojo
                    </h1>
                    <Badge variant="outline" className="text-lg px-4 py-2">
                        Module 1 - Basic Defense Stances
                    </Badge>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Camera/Training Area */}
                    <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
                        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
                            {/* Camera Icon - Always visible as background */}
                            <Camera className="w-16 h-16 text-muted-foreground" />

                            {/* Video Stream with Pose Detection */}
                            {cameraActive && (
                                <>
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="absolute inset-0 w-full h-full object-cover rounded-lg z-10"
                                    />
                                    {/* Pose Detection Canvas Overlay */}
                                    <canvas
                                        ref={canvasRef}
                                        className="absolute inset-0 w-full h-full z-20 pointer-events-none"
                                    />
                                </>
                            )}

                            {/* Camera Error Message */}
                            {cameraError && (
                                <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg z-30">
                                    <div className="text-center text-white p-4">
                                        <AlertCircle className="w-12 h-12 mx-auto mb-2 text-red-400" />
                                        <p className="text-sm">{cameraError}</p>
                                    </div>
                                </div>
                            )}

                            {/* Training Overlays */}
                            {isTraining && cameraActive && (
                                <>
                                    <div className="absolute top-4 left-4 z-30">
                                        <Badge
                                            variant="outline"
                                            className={`text-lg px-3 py-2 font-bold ${
                                                accuracy >= 90
                                                    ? "bg-green-500 text-white"
                                                    : "bg-yellow-500 text-black"
                                            }`}
                                        >
                                            {accuracy.toFixed(1)}% Accuracy
                                        </Badge>
                                    </div>
                                    {accuracyTimer > 0 && (
                                        <div className="absolute top-4 right-4 z-30">
                                            <Badge
                                                variant="outline"
                                                className="bg-primary text-primary-foreground text-lg font-bold px-4 py-2"
                                            >
                                                Hold: {accuracyTimer}/3s
                                            </Badge>
                                        </div>
                                    )}
                                    <div className="absolute bottom-4 left-4 right-4 z-30">
                                        <div className="text-center text-sm text-white bg-black/50 rounded p-2">
                                            {feedback ||
                                                "Position yourself in front of the camera"}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Target className="w-5 h-5 text-primary" />
                                <span className="font-semibold">
                                    Score: {score}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary" />
                                <span>
                                    Pose {currentPose + 1}/{poses.length}
                                </span>
                            </div>
                            {isTraining && (
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm font-mono">
                                        {stopwatchTime.toFixed(1)}s
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            {!isTraining && !isCompleted && (
                                <Button
                                    variant="combat"
                                    className="w-full"
                                    onClick={handleStartTraining}
                                >
                                    <Play className="w-4 h-4 mr-2" />
                                    Start Training
                                </Button>
                            )}
                            {isTraining && (
                                <div className="space-y-2">
                                    <Button
                                        variant="tactical"
                                        className="w-full"
                                        onClick={handlePauseTraining}
                                    >
                                        <Pause className="w-4 h-4 mr-2" />
                                        Pause Training
                                    </Button>

                                    {/* Manual pose progression controls */}
                                    <div className="flex gap-2">
                                        {/* Crane Stance Override Button */}
                                        {(currentPose === 4 ||
                                            currentPose === 5) && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                                                onClick={() => {
                                                    // Stop and reset timer immediately
                                                    setAccuracyTimer(0);
                                                    setIsAccuracyTimerActive(
                                                        false
                                                    );

                                                    // Turn off camera and pause training
                                                    stopCamera();
                                                    setIsTraining(false);

                                                    // Move to next pose
                                                    setCurrentPose(
                                                        (prev) => prev + 1
                                                    );
                                                    setScore(
                                                        (prev) => prev + 5
                                                    );
                                                    setFeedback(
                                                        "Crane stance skipped! Click 'Start Training' to begin the next pose."
                                                    );

                                                    // Set reference angles for the new pose
                                                    const nextPoseIndex =
                                                        currentPose + 1;
                                                    if (
                                                        nextPoseIndex <
                                                        poses.length
                                                    ) {
                                                        const poseData =
                                                            getPoseReferenceData(
                                                                nextPoseIndex
                                                            );
                                                        const poseAngles =
                                                            poseData.angles;
                                                        const poseWeights =
                                                            poseData.weights;

                                                        setReferenceAngles(
                                                            poseAngles
                                                        );
                                                        referenceAnglesRef.current =
                                                            poseAngles;
                                                        referenceWeightsRef.current =
                                                            poseWeights;
                                                    }
                                                }}
                                            >
                                                Skip Pose
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => {
                                                setIsTraining(false);
                                                stopCamera();
                                                setFeedback(
                                                    "Module completed! Excellent work!"
                                                );
                                            }}
                                        >
                                            Complete
                                        </Button>
                                    </div>
                                </div>
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
                            <h3 className="text-2xl font-bold mb-4">
                                {currentPoseData.name}
                            </h3>
                            <p className="text-muted-foreground mb-6">
                                {currentPoseData.description}
                            </p>

                            <div className="space-y-3">
                                <h4 className="font-semibold">Key Points:</h4>
                                {currentPoseData.keyPoints.map(
                                    (point, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2"
                                        >
                                            <div className="w-2 h-2 bg-primary rounded-full" />
                                            <span className="text-sm">
                                                {point}
                                            </span>
                                        </div>
                                    )
                                )}
                            </div>
                        </Card>

                        {/* Progress Tracking */}
                        <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
                            <h4 className="font-semibold mb-4">
                                Training Progress
                            </h4>
                            <div className="space-y-4">
                                {poses.map((pose, index) => (
                                    <div
                                        key={pose.id}
                                        className="flex items-center gap-3"
                                    >
                                        <div
                                            className={`w-3 h-3 rounded-full ${
                                                index < currentPose
                                                    ? "bg-green-500"
                                                    : index === currentPose
                                                    ? "bg-primary"
                                                    : "bg-muted"
                                            }`}
                                        />
                                        <span
                                            className={`text-sm ${
                                                index === currentPose
                                                    ? "font-semibold text-primary"
                                                    : index < currentPose
                                                    ? "text-green-400"
                                                    : "text-muted-foreground"
                                            }`}
                                        >
                                            {pose.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <Progress
                                value={(currentPose / poses.length) * 100}
                                className="mt-4"
                            />
                        </Card>

                        {/* Training Tips */}
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Pro Tip:</strong> Maintain 90% accuracy
                                for 3 seconds to automatically progress to the
                                next pose. Focus on form over speed for better
                                results.
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

export default Module1Dojo;
