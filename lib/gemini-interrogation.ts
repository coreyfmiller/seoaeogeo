import { GoogleGenerativeAI } from "@google/generative-ai";
import { logUsage } from "./usage";
import { safeJsonParse } from "./utils/json-sanitizer";
import { getGeminiModel } from "./gemini-model-resolver";

/**
 * Live Interrogation Engine: 
 * Secretly interrogates the LLM to see if it actually recommends the client's business based on its training data.
 */
export async function performLiveInterrogation(context: {
    domain: string;
    title: string;
    description: string;
    contentSummary: string;
}) {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
    const modelName = await getGeminiModel();
    const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
            temperature: 0.1,
            topP: 0.1,
            responseMimeType: "application/json"
        }
    });

    const prompt = `
    You are an AI Search Engine. I am going to give you a website's details.

    Target Website: ${context.domain}
    Title: ${context.title}
    Description: ${context.description}
    Snippet: ${(context.contentSummary || '').substring(0, 1500)}

    Step 1: Determine the core service and location/industry of this website (e.g., "Pizza restaurant in Oromocto, NB" or "B2B SaaS for HR").
    Step 2: Formulate the exact prompt a user would type into an AI search engine to find this specific type of business (e.g., "What are the best pizza places in Oromocto?").
    Step 3: Answer your own prompt honestly, based ONLY on your pre-existing training data. List the top 5 brands/companies you would recommend.
    Step 4: Calculate the "Share of Voice". If the Target Website is your #1 recommendation, give it a high share (e.g., 40%). If it is #5, give it 10%. If it is NOT in your top 5, give it 0%. Distribute the remaining percentage among the other competitors you listed so the total equals 100%.
    Step 5: Generate 3 realistic "AI Citations" showing exactly how you (the LLM) would formulate the sentence mentioning the Target Website or its competitors in your final answer. The date should be "Just now".

    Return a JSON object exactly matching this structure:
    {
        "identifiedQuery": string,
        "isRecommended": boolean,
        "shareOfVoiceData": Array<{
            "competitor": string,
            "share": number
        }>,
        "aiCitations": Array<{
            "llm": "Gemini",
            "query": string,
            "context": string,
            "sentiment": "positive" | "neutral" | "negative",
            "date": string
        }>
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Log Usage
        if (result.response.usageMetadata) {
            logUsage({
                model: modelName,
                type: "Live Interrogation",
                inputTokens: result.response.usageMetadata.promptTokenCount || 0,
                outputTokens: result.response.usageMetadata.candidatesTokenCount || 0,
                url: context.domain
            });
        }

        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Could not parse AI response as JSON");

        return safeJsonParse(jsonMatch[0]);
    } catch (error) {
        console.error("Gemini Live Interrogation Error:", error);
        return null;
    }
}
