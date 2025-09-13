import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini AI client with the API key from environment variables
const apiKey = "AIzaSyAXWk9QDf1NzjfQ4oZvxNCwSlhfl1BGg28";
console.log("API Key loaded:", apiKey ? "✅ Present" : "❌ Missing");

if (!apiKey) {
    console.error(
        "VITE_APP_GEMINI_API_KEY is not set in environment variables"
    );
}

const ai = new GoogleGenAI({ apiKey });

/**
 * Generate feedback for pose training
 * @param {string} poseName - The name of the pose being practiced
 * @param {string} poseDescription - The description of the pose being practiced
 * @param {number} accuracy - The accuracy percentage achieved
 * @param {Object} referenceAngles - The reference angles for the pose
 * @param {Object} currentAngles - The current angles for the pose
 * @returns {Promise<string>} - Generated feedback text
 */
export async function generatePoseFeedback(
    poseName,
    poseDescription,
    accuracy,
    referenceAngles,
    currentAngles
) {
    console.log("🤖 generatePoseFeedback called with:", {
        poseName,
        poseDescription,
        accuracy,
        referenceAngles,
        currentAngles,
    });

    try {
        if (!apiKey) {
            throw new Error(
                "API key is not configured. Please check your environment variables."
            );
        }
        const prompt = `
        You are a martial arts instructor providing feedback on pose training. 
        
        Here is some information about the pose being practiced and the user training information:
        Pose Name: ${poseName}
        Pose Description: ${poseDescription}
        Accuracy: ${accuracy}%
        Reference Angles: ${JSON.stringify(referenceAngles)}
        Current Angles: ${JSON.stringify(currentAngles)}
        
        Provide constructive feedback in MAXIMUM 1 quick sentence/phrase based off the information provided above so the user can improve their form and technique for the pose. 
        Focus on:
        - Areas for improvement for the pose
        - How they should specifically adjust their body
        - Tips and tricks for added accuracy
        
        Examples:
        - "Your left elbow is too high, try bringing it down"
        - "Your right knee is too low, try lifting it up"
        - "Your left arm is a bit low, raising it a bit more will help"
        
        Keep the tone positive and supportive. In order for the user to pass the pose, they need to have at least 90% overall accuracy. 
        The way accuracy is calculated is based on the difference between the reference angles and the current angles (with a 10 degree tolerance). The difference is then multiplied by the weight of the joint. The overall accuracy is the sum of the weighted accuracies divided by the sum of the weights.
        `;

        console.log("🚀 Sending request to Gemini API...");
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        console.log("✅ Gemini API response:", response);
        console.log("📝 Response text:", response.text);

        return response.text;
    } catch (error) {
        console.error("Error generating feedback:", error);
        return "Great effort! Keep practicing to improve your form and technique.";
    }
}

/**
 * Generate overall session feedback
 * @param {Object} sessionData - The complete session data
 * @returns {Promise<string>} - Generated feedback text
 */
export async function generateSessionFeedback(sessionData) {
    try {
        if (!apiKey) {
            throw new Error(
                "API key is not configured. Please check your environment variables."
            );
        }
        const prompt = `
        You are a martial arts instructor providing overall training session feedback.
        
        Session Summary:
        - Total Score: ${sessionData.totalScore}/${sessionData.maxScore}
        - Average Accuracy: ${sessionData.accuracy}%
        - Total Time: ${sessionData.totalTime}
        - Poses Completed: ${
            sessionData.poses.filter((p) => p.completed).length
        }/${sessionData.poses.length}
        
        Provide comprehensive feedback in 3-4 sentences covering:
        - Overall performance assessment
        - Specific strengths shown
        - Areas to focus on in future sessions
        - Encouragement and motivation
        
        Keep the tone positive, professional, and motivating.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating session feedback:", error);
        return "Excellent training session! Your dedication to improving your martial arts skills is commendable. Keep up the great work!";
    }
}
