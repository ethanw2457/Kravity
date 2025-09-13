# 🥋 PhoDefense

### 🔑 Onboarding & Environment Check
- Camera/mic permissions, lighting/distance calibration.
- Warm-up checklist, safety disclaimers, and injury waivers.

### 📚 Technique Library
- Cards for Krav Maga techniques with tags, demo media, and step phases.
- Search and filter with difficulty levels.

### 🧑‍🏫 Guided Lesson Flow
- **Learn → Drill → Assess** format for each technique.
- Demo videos (GIFs/loops), text prompts, and real-time coaching.

### 🎥 Live Practice with Pose Tracking
- Real-time skeleton overlay using **MediaPipe/MoveNet**.
- Angle-based comparisons vs. reference poses.
- Accuracy threshold: **90%+ for 3 seconds** to pass a pose.
- Feedback prompts (e.g., “Raise elbow 10°”, “Wider stance”).

### 🏆 Scoring & Feedback
- Point system:
  - Start with 100 points per pose.
  - Lose points if accuracy < 90%.
  - Bonus points for quick completion.
- Evaluations: **Poor, Good, Great, Excellent**.
- Post-drill summary with scores, timing, and heatmaps.

### 🤝 Multiplayer Modes
- **Versus Battles**: Compete against friends in real-time.
- **Turn-based scoring**: Player 1 completes drill, then Player 2, results compared.
- Room system with WebRTC for video + WebSockets for scoring.

### 📈 Progress Tracking
- History of sessions, streaks, and personal records.
- Achievements and badges for milestones.
- Per-joint heatmaps for form analysis.

### 🛡️ Safety & Accessibility
- Warm-up and cooldown prompts.
- Colorblind-safe UI, captions, and mirroring options.
- “Not a substitute for professional training” disclaimer.
- Optional SOS launcher for emergencies.

## ⚙️ Technical Stack

**Frontend**
- [Next.js](https://nextjs.org/) + Tailwind CSS.
- Zustand for state management.
- React-webcam + `<canvas>` overlay.

**Backend**
- [FastAPI](https://fastapi.tiangolo.com/) + SQLAlchemy.
- WebSockets for real-time events.
- Postgres (sessions, techniques, leaderboards).
- Redis (presence, rooms).
- S3/Cloud Storage for media and pose JSON.

**Computer Vision**
- Pose detection: MediaPipe Pose / TF.js MoveNet Lightning.
- Angles computed via cosine law + atan2.
- Real-time smoothing with EMA.
- Scoring via Mean Squared Error (MSE) + threshold rules.

**Multiplayer**
- WebRTC (STUN/TURN via coturn).
- Socket.IO for room state & scoring sync.
- Anti-cheat: frame timestamp checks, jitter detection.

---

## 📊 Minimal Data Model
- **users**: profiles, settings, localization.
- **sessions**: scores, metrics, pose-series storage.
- **techniques & phases**: reference media, weights.
- **rooms & members**: multiplayer states and scores.
- **leaderboards & entries**: global/friends ranking.

---

## 🎮 Gameplay Loop

1. **Onboard** → Camera/lighting check, safety disclaimers.
2. **Choose Mode** → Single-player or Multiplayer.
3. **Modules** → Sequence of poses with demo + live tracking.
4. **Pose Evaluation** → Must hold correct form at ≥90% accuracy for 3 seconds.
5. **Scoring** → Points calculated based on accuracy and speed.
6. **Results** → Percentages, per-pose breakdown, leaderboard updates.
7. **Progress** → Save session stats, unlock achievements.
