"use client";

import { useEffect, useRef, useState } from "react";

const PoseDetector = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);

    // MediaPipe Pose states
    const [isMediaPipeLoaded, setIsMediaPipeLoaded] = useState(false);
    const [poseDetector, setPoseDetector] = useState(null);
    const [poseResults, setPoseResults] = useState(null);
    const [isPoseDetectionActive, setIsPoseDetectionActive] = useState(false);

    // Joint angle tracking states
    const [jointAngles, setJointAngles] = useState({
        leftShoulder: 0,
        rightShoulder: 0,
        leftElbow: 0,
        rightElbow: 0,
        leftKnee: 0,
        rightKnee: 0,
    });

    // Pose comparison states
    const [referenceAngles, setReferenceAngles] = useState(null);
    const [jointScores, setJointScores] = useState({
        leftShoulder: 0,
        rightShoulder: 0,
        leftElbow: 0,
        rightElbow: 0,
        leftKnee: 0,
        rightKnee: 0,
    });
    const [overallAccuracy, setOverallAccuracy] = useState(0);
    const [isComparisonActive, setIsComparisonActive] = useState(false);

    // Animation frame references for cleanup
    const videoAnimationRef = useRef(null);
    const poseAnimationRef = useRef(null);
    const drawingUtilsRef = useRef(null);
    const poseConnectionsRef = useRef(null);

    // Reference angles ref for immediate access in callbacks
    const referenceAnglesRef = useRef(null);

    // Joint angles ref for immediate access in interval
    const jointAnglesRef = useRef(null);

    let angles = localStorage.getItem("referencePoseAngles");
    console.log("Reference pose angles:", angles);

    // Utility function to calculate angle between three points
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

    // Function to calculate all joint angles from pose landmarks
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
        const LEFT_HEEL = 29;
        const RIGHT_HEEL = 30;
        const LEFT_FOOT_INDEX = 31;
        const RIGHT_FOOT_INDEX = 32;

        const angles = {
            // Shoulder angles (elbow-shoulder-hip)
            leftShoulder: calculateAngle(
                landmarks[LEFT_ELBOW],
                landmarks[LEFT_SHOULDER],
                landmarks[LEFT_HIP]
            ),
            rightShoulder: calculateAngle(
                landmarks[RIGHT_ELBOW],
                landmarks[RIGHT_SHOULDER],
                landmarks[RIGHT_HIP]
            ),

            // Elbow angles (bend angle: 180° - internal angle)
            leftElbow:
                180 -
                calculateAngle(
                    landmarks[LEFT_WRIST],
                    landmarks[LEFT_ELBOW],
                    landmarks[LEFT_SHOULDER]
                ),
            rightElbow:
                180 -
                calculateAngle(
                    landmarks[RIGHT_WRIST],
                    landmarks[RIGHT_ELBOW],
                    landmarks[RIGHT_SHOULDER]
                ),

            // Knee angles (ankle-knee-hip)
            leftKnee: calculateAngle(
                landmarks[LEFT_ANKLE],
                landmarks[LEFT_KNEE],
                landmarks[LEFT_HIP]
            ),
            rightKnee: calculateAngle(
                landmarks[RIGHT_ANKLE],
                landmarks[RIGHT_KNEE],
                landmarks[RIGHT_HIP]
            ),
        };

        return angles;
    };

    // Load reference angles from localStorage
    const loadReferenceAngles = () => {
        try {
            const stored = localStorage.getItem("referencePoseAngles");
            if (stored) {
                const data = JSON.parse(stored);
                if (data.angles) {
                    setReferenceAngles(data.angles);
                    referenceAnglesRef.current = data.angles; // Update ref for immediate access
                    console.log("Reference angles loaded:", data.angles);
                    return true;
                }
            }
        } catch (error) {
            console.error("Error loading reference angles:", error);
        }
        return false;
    };

    // Calculate joint score with tolerance and linear drop-off
    const calculateJointScore = (
        referenceAngle,
        currentAngle,
        tolerance = 15
    ) => {
        // Check for invalid angles (null, undefined, or NaN)
        if (
            referenceAngle == null ||
            currentAngle == null ||
            isNaN(referenceAngle) ||
            isNaN(currentAngle)
        ) {
            return 0;
        }

        const angleDifference = Math.abs(referenceAngle - currentAngle);

        if (angleDifference >= tolerance) {
            return 0;
        }

        // Linear drop-off: max(0, 1 - angleDifference/tolerance)
        return Math.max(0, 1 - angleDifference / tolerance);
    };

    // Calculate all joint scores and overall accuracy
    const calculatePoseAccuracy = (currentAngles, referenceAngles) => {
        if (!referenceAngles || !currentAngles) {
            return { jointScores: {}, overallAccuracy: 0 };
        }

        const jointTolerances = {
            leftShoulder: 15,
            rightShoulder: 15,
            leftElbow: 15,
            rightElbow: 15,
            leftKnee: 15,
            rightKnee: 15,
        };

        const scores = {};
        let totalScore = 0;
        let validJoints = 0;

        Object.keys(jointTolerances).forEach((joint) => {
            const score = calculateJointScore(
                referenceAngles[joint],
                currentAngles[joint],
                jointTolerances[joint]
            );
            scores[joint] = score;

            // Count as valid if both angles are valid numbers (including 0)
            if (
                referenceAngles[joint] != null &&
                currentAngles[joint] != null &&
                !isNaN(referenceAngles[joint]) &&
                !isNaN(currentAngles[joint])
            ) {
                totalScore += score;
                validJoints++;
            }
        });

        const overallAccuracy =
            validJoints > 0 ? (totalScore / validJoints) * 100 : 0;

        return {
            jointScores: scores,
            overallAccuracy: Math.round(overallAccuracy),
        };
    };

    // Initialize MediaPipe Pose
    useEffect(() => {
        const initializeMediaPipe = async () => {
            console.log("Starting MediaPipe initialization...");
            try {
                // Dynamically import MediaPipe packages
                console.log("Importing MediaPipe packages...");
                const { Pose, POSE_CONNECTIONS } = await import(
                    "@mediapipe/pose"
                );

                console.log("Creating Pose instance...");
                const pose = new Pose({
                    locateFile: (file) => {
                        // Use local files from public directory
                        console.log("MediaPipe requesting file:", file);
                        return `/mediapipe/${file}`;
                    },
                });

                console.log("Setting Pose options...");
                // Configure pose detection with better smoothing
                pose.setOptions({
                    modelComplexity: 1,
                    smoothLandmarks: true,
                    enableSegmentation: false,
                    smoothSegmentation: true,
                    minDetectionConfidence: 0.5,
                    minTrackingConfidence: 0.5,
                });

                console.log("Setting up pose detection callback...");
                // Set up pose detection callback
                pose.onResults(async (results) => {
                    console.log("Pose results received:", results);
                    setPoseResults(results);

                    // Calculate and update joint angles in real-time
                    if (results.poseLandmarks) {
                        const angles = calculateJointAngles(
                            results.poseLandmarks
                        );
                        setJointAngles(angles);
                        jointAnglesRef.current = angles; // Update ref for interval access
                        console.log("Joint angles updated:", angles);

                        // Note: Accuracy calculation is now handled by useEffect interval
                    }

                    // Always draw when we have results, regardless of state
                    console.log("Drawing pose landmarks...");
                    try {
                        await drawPoseLandmarks(results);
                    } catch (error) {
                        console.error("Error drawing pose landmarks:", error);
                    }
                });

                setPoseDetector(pose);
                setIsMediaPipeLoaded(true);
                const drawingUtils = await import("@mediapipe/drawing_utils");
                drawingUtilsRef.current = drawingUtils;
                poseConnectionsRef.current = POSE_CONNECTIONS;
                console.log("MediaPipe Pose initialized successfully");
            } catch (error) {
                console.error("Error initializing MediaPipe Pose:", error);
            }
        };

        initializeMediaPipe();

        // Load reference angles on component mount
        loadReferenceAngles();

        // Cleanup function for component unmount
        return () => {
            console.log("Component unmounting, cleaning up...");
            if (isPoseDetectionActive) {
                stopPoseDetection();
            }
            if (stream) {
                console.log("Stopping all media tracks on unmount...");
                stream.getTracks().forEach((track) => {
                    console.log("Stopping track:", track.kind);
                    track.stop();
                });
            }
            // Cancel animation frames
            if (videoAnimationRef.current) {
                cancelAnimationFrame(videoAnimationRef.current);
            }
            if (poseAnimationRef.current) {
                cancelAnimationFrame(poseAnimationRef.current);
            }
            console.log("Component cleanup completed");
        };
    }, []);

    // Listen for changes in localStorage to update reference angles
    useEffect(() => {
        const handleStorageChange = () => {
            loadReferenceAngles();
        };

        // Listen for storage events (when localStorage changes in other tabs/components)
        window.addEventListener("storage", handleStorageChange);

        // Also check periodically for changes (in case of same-tab updates)
        const interval = setInterval(() => {
            const stored = localStorage.getItem("referencePoseAngles");
            if (stored && referenceAnglesRef.current === null) {
                loadReferenceAngles();
            }
        }, 1000);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    // Auto-calculate pose accuracy when pose detection is active
    useEffect(() => {
        if (!isPoseDetectionActive || !referenceAnglesRef.current) return;

        console.log("Setting up automatic accuracy calculation interval...");

        const interval = setInterval(() => {
            if (jointAnglesRef.current && referenceAnglesRef.current) {
                console.log("Auto-calculating accuracy from interval...");
                console.log("Current joint angles:", jointAnglesRef.current);
                console.log("Reference angles:", referenceAnglesRef.current);

                const accuracy = calculatePoseAccuracy(
                    jointAnglesRef.current,
                    referenceAnglesRef.current
                );
                console.log("Interval-calculated accuracy:", accuracy);

                setJointScores(accuracy.jointScores);
                setOverallAccuracy(accuracy.overallAccuracy);
            } else {
                console.log("Skipping interval calculation - missing data:", {
                    hasJointAngles: !!jointAnglesRef.current,
                    hasReferenceAngles: !!referenceAnglesRef.current,
                });
            }
        }, 500); // Update every 0.5 seconds

        return () => {
            console.log("Clearing accuracy calculation interval...");
            clearInterval(interval);
        };
    }, [isPoseDetectionActive]); // Only depend on isPoseDetectionActive

    // Custom drawing functions for pose landmarks
    const drawPoseLandmarks = (results) => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (!canvas || !video) return;

        const ctx = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame first
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Only draw pose if utils and landmarks exist
        if (!drawingUtilsRef.current || !poseConnectionsRef.current) return;
        if (!results.poseLandmarks) return;

        const { drawLandmarks, drawConnectors } = drawingUtilsRef.current;

        drawConnectors(ctx, results.poseLandmarks, poseConnectionsRef.current, {
            color: "#00FF00",
            lineWidth: 2,
        });
        drawLandmarks(ctx, results.poseLandmarks, {
            color: "#FF0000",
            lineWidth: 1,
        });
    };

    // Start continuous video drawing when camera starts
    useEffect(() => {
        if (stream && videoRef.current) {
            console.log("Camera stream started, setting up video drawing...");

            // Wait for video to be ready
            const handleVideoReady = () => {
                console.log("Video ready, starting continuous drawing...");
                if (videoRef.current.videoWidth > 0) {
                    // Cancel any existing animation frame
                    if (videoAnimationRef.current) {
                        cancelAnimationFrame(videoAnimationRef.current);
                    }
                }
            };

            videoRef.current.addEventListener(
                "loadedmetadata",
                handleVideoReady
            );
            videoRef.current.addEventListener("canplay", handleVideoReady);

            return () => {
                if (videoRef.current) {
                    videoRef.current.removeEventListener(
                        "loadedmetadata",
                        handleVideoReady
                    );
                    videoRef.current.removeEventListener(
                        "canplay",
                        handleVideoReady
                    );
                }
                // Cancel animation frame on cleanup
                if (videoAnimationRef.current) {
                    cancelAnimationFrame(videoAnimationRef.current);
                }
            };
        } else if (!stream) {
            // Clear canvas when stream is stopped
            if (canvasRef.current) {
                const ctx = canvasRef.current.getContext("2d");
                ctx.clearRect(
                    0,
                    0,
                    canvasRef.current.width,
                    canvasRef.current.height
                );
            }
            // Cancel animation frame
            if (videoAnimationRef.current) {
                cancelAnimationFrame(videoAnimationRef.current);
            }
        }
    }, [stream]);

    // Start camera stream
    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: 640,
                    height: 480,
                    frameRate: { ideal: 30, max: 60 },
                },
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                await videoRef.current
                    .play()
                    .catch((err) => console.error("Video play error:", err));
            }
        } catch (error) {
            console.error("Error accessing camera:", error);
        }
    };

    // Stop camera stream
    const stopCamera = () => {
        console.log("Stopping camera and cleaning up...");

        // Stop pose detection if it's active
        if (isPoseDetectionActive) {
            console.log("Stopping pose detection...");
            stopPoseDetection();
        }

        // Stop all video tracks
        if (stream) {
            stream.getTracks().forEach((track) => {
                console.log("Stopping track:", track.kind);
                track.stop();
            });
            setStream(null);
        }

        // Clear video source
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        // Clear canvas
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            ctx.clearRect(
                0,
                0,
                canvasRef.current.width,
                canvasRef.current.height
            );
        }

        // Cancel animation frames
        if (videoAnimationRef.current) {
            cancelAnimationFrame(videoAnimationRef.current);
        }
        if (poseAnimationRef.current) {
            cancelAnimationFrame(poseAnimationRef.current);
        }

        console.log("Camera stopped and cleanup completed");
    };

    // Enable pose comparison automatically when pose detection starts
    const enablePoseComparison = () => {
        if (referenceAnglesRef.current) {
            setIsComparisonActive(true);
            console.log(
                "Pose comparison enabled automatically - accuracy will update every 0.5 seconds via useEffect interval"
            );
        } else {
            console.log("No reference angles available for pose comparison.");
        }
    };

    // Disable pose comparison when pose detection stops
    const disablePoseComparison = () => {
        setIsComparisonActive(false);
        // Reset scores when comparison is turned off
        setJointScores({
            leftShoulder: 0,
            rightShoulder: 0,
            leftElbow: 0,
            rightElbow: 0,
            leftKnee: 0,
            rightKnee: 0,
        });
        setOverallAccuracy(0);
        console.log("Pose comparison disabled.");
    };

    // Toggle pose detection
    const togglePoseDetection = () => {
        console.log("Toggle pose detection clicked");
        console.log("isMediaPipeLoaded:", isMediaPipeLoaded);
        console.log("poseDetector:", poseDetector);
        console.log("Current isPoseDetectionActive:", isPoseDetectionActive);

        if (!isMediaPipeLoaded || !poseDetector) {
            console.log("Cannot toggle - MediaPipe not ready");
            return;
        }

        const newState = !isPoseDetectionActive;
        setIsPoseDetectionActive(newState);
        console.log("Setting pose detection to:", newState);

        if (newState) {
            // Start pose detection with the new state value
            console.log("Starting pose detection...");
            enablePoseComparison(); // Automatically enable pose comparison
            startPoseDetection(true); // Pass true directly
        } else {
            // Stop pose detection
            console.log("Stopping pose detection...");
            disablePoseComparison(); // Automatically disable pose comparison
            stopPoseDetection();
        }
    };

    // Start pose detection with improved performance
    const startPoseDetection = (forceActive = false) => {
        console.log("startPoseDetection called, forceActive:", forceActive);
        if (!poseDetector || !videoRef.current) {
            console.log("Cannot start - missing poseDetector or videoRef");
            return;
        }

        console.log("Starting pose detection loop...");
        const detectPose = async () => {
            // Use forceActive if provided, otherwise check state
            const shouldContinue = forceActive || isPoseDetectionActive;
            // Reduced logging for better performance
            if (Math.random() < 0.1) {
                // Only log 10% of the time
                console.log(
                    "detectPose iteration, shouldContinue:",
                    shouldContinue,
                    "forceActive:",
                    forceActive,
                    "isPoseDetectionActive:",
                    isPoseDetectionActive
                );
            }

            if (shouldContinue && videoRef.current && poseDetector) {
                try {
                    // Validate video frame before sending
                    if (
                        !videoRef.current.videoWidth ||
                        !videoRef.current.videoHeight
                    ) {
                        console.log("Video frame not ready, skipping...");
                        // Still continue the loop but skip this frame
                        if (forceActive || isPoseDetectionActive) {
                            poseAnimationRef.current =
                                requestAnimationFrame(detectPose);
                        }
                        return;
                    }

                    // Check if video is actually playing
                    if (videoRef.current.readyState < 3) {
                        console.log("Video not ready, skipping...");
                        if (forceActive || isPoseDetectionActive) {
                            poseAnimationRef.current =
                                requestAnimationFrame(detectPose);
                        }
                        return;
                    }

                    // Reduced logging for better performance
                    if (Math.random() < 0.05) {
                        // Only log 5% of the time
                        console.log("Sending frame to MediaPipe...");
                    }
                    await poseDetector.send({ image: videoRef.current });
                    if (Math.random() < 0.05) {
                        // Only log 5% of the time
                        console.log("Frame sent successfully");
                    }
                } catch (error) {
                    console.error("Error detecting pose:", error);

                    // If it's a memory access error, wait a bit before continuing
                    if (
                        error.message &&
                        error.message.includes("memory access")
                    ) {
                        console.log(
                            "Memory access error detected, waiting before retry..."
                        );
                        setTimeout(() => {
                            if (forceActive || isPoseDetectionActive) {
                                poseAnimationRef.current =
                                    requestAnimationFrame(detectPose);
                            }
                        }, 100);
                        return;
                    }
                }

                // Continue the loop if still active, with better frame rate control
                if (forceActive || isPoseDetectionActive) {
                    // Reduced logging for better performance
                    if (Math.random() < 0.05) {
                        // Only log 5% of the time
                        console.log("Scheduling next frame...");
                    }
                    // Limit pose detection to ~30 FPS for better performance and stability
                    setTimeout(() => {
                        if (forceActive || isPoseDetectionActive) {
                            poseAnimationRef.current =
                                requestAnimationFrame(detectPose);
                        }
                    }, 33); // ~30 FPS (1000ms / 30)
                } else {
                    console.log("Pose detection stopped, exiting loop");
                }
            } else {
                console.log("Pose detection conditions not met, exiting loop");
            }
        };

        // Wait a bit for video to be fully ready before starting detection
        setTimeout(() => {
            console.log("Starting pose detection after delay...");
            detectPose();
        }, 500);
    };

    // Stop pose detection
    const stopPoseDetection = () => {
        console.log("Stopping pose detection...");
        setIsPoseDetectionActive(false);

        // Cancel pose animation frame
        if (poseAnimationRef.current) {
            cancelAnimationFrame(poseAnimationRef.current);
        }

        // Clear canvas but keep video frame
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            ctx.clearRect(
                0,
                0,
                canvasRef.current.width,
                canvasRef.current.height
            );
            // Redraw video frame
            if (videoRef.current && videoRef.current.videoWidth > 0) {
                ctx.drawImage(
                    videoRef.current,
                    0,
                    0,
                    canvasRef.current.width,
                    canvasRef.current.height
                );
            }
            console.log("Pose detection canvas cleared");
        }

        console.log("Pose detection stopped");
    };
};

export default PoseDetector;
