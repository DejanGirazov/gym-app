import { GoogleGenAI } from "@google/genai";

export const nutritionSummary = async (req, res) => {
  try {
    const { meals } = req.body;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const now = new Date();
    const timeString = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const hour = now.getHours();
    const timeOfDay =
      hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

    const prompt = `Here are the user's meals for today: ${JSON.stringify(meals)}.
The current time is ${timeString} (${timeOfDay}).

Summarise their nutrition in 2-3 sentences. Take the time of day into account —
if it's early, acknowledge they still have meals ahead; if it's late evening,
assess their full day. Mention total calories, protein, whether they hit a good
balance, and one actionable tip appropriate for this time of day.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({ summary: response.text });
  } catch (err) {
    console.log(err.errorMessage);
    res.status(500).json({ error: "Server error", errorMessage: err.message });
  }
};
