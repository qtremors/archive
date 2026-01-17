/**
 * Script to list available Gemini models
 * Run with: npx tsx scripts/list-gemini-models.ts
 */

import * as dotenv from "dotenv";
import * as path from "path";

// Load .env.local first, then .env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";

interface GeminiModel {
    name: string;
    displayName: string;
    description: string;
    inputTokenLimit: number;
    outputTokenLimit: number;
    supportedGenerationMethods: string[];
}

interface ModelsResponse {
    models: GeminiModel[];
}

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY not found in .env or .env.local");
        process.exit(1);
    }

    console.log("🔍 Fetching available Gemini models...\n");

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`);

        if (!response.ok) {
            console.error("API Error:", response.status, await response.text());
            process.exit(1);
        }

        const data: ModelsResponse = await response.json();

        // Filter for generative models
        const generativeModels = data.models.filter((m) =>
            m.supportedGenerationMethods.includes("generateContent")
        );

        console.log("📚 Available Gemini Models for Content Generation:\n");
        console.log("=".repeat(80));

        for (const model of generativeModels) {
            const modelId = model.name.replace("models/", "");
            console.log(`\n🤖 ${modelId}`);
            console.log(`   Name: ${model.displayName}`);
            console.log(`   Description: ${(model.description || "No description").slice(0, 100)}...`);
            console.log(`   Input Tokens: ${model.inputTokenLimit.toLocaleString()}`);
            console.log(`   Output Tokens: ${model.outputTokenLimit.toLocaleString()}`);
        }

        console.log("\n" + "=".repeat(80));
        console.log(`\n✅ Found ${generativeModels.length} models with generateContent support`);

        // Recommend best for creative writing
        console.log("\n💡 Recommended for hilarious newspaper content:");
        console.log("   • gemini-2.0-flash-exp (fast, creative, free tier)");
        console.log("   • gemini-1.5-pro (longer context, more nuanced)");
    } catch (error) {
        console.error("Failed to fetch models:", error);
        process.exit(1);
    }
}

listModels();
