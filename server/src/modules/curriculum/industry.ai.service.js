import { GoogleGenAI } from "@google/genai";
import ApiError from "../../shared/errors/ApiError.js";

// ============================================================
// Gemini Configuration
// ============================================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const GEMINI_MODELS = [
  process.env.GEMINI_MODEL || "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
];

if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is not configured.");
}

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

// ============================================================
// Retry Configuration
// ============================================================

const MAX_RETRIES_PER_MODEL = 3;
const INITIAL_RETRY_DELAY = 2000;

// ============================================================
// Sleep
// ============================================================

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================
// Detect Temporary Gemini Errors
// ============================================================

const isTemporaryGeminiError = (error) => {
  const status =
    error?.status ||
    error?.statusCode ||
    error?.code;

  const message =
    String(error?.message || "").toLowerCase();

  return (
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    message.includes("high demand") ||
    message.includes("unavailable") ||
    message.includes("temporarily") ||
    message.includes("overloaded") ||
    message.includes("rate limit") ||
    message.includes("too many requests")
  );
};

// ============================================================
// Build Prompt
// ============================================================

const buildPrompt = (syllabusAnalysis) => {
  const syllabusJson =
    typeof syllabusAnalysis === "string"
      ? syllabusAnalysis
      : JSON.stringify(syllabusAnalysis);

  return `
You are an Industry Intelligence and Curriculum Analysis AI.

Analyze the supplied university syllabus analysis and identify:

1. Relevant industry domains
2. Industry-relevant professional skills

The system must be INDUSTRY-INDEPENDENT.

Do NOT assume that the course belongs to Computer Science,
Information Technology, IoT, Artificial Intelligence,
Software Engineering, or any other predefined domain.

Identify domains strictly from the supplied syllabus content.

IMPORTANT:

Do not simply copy syllabus topics into industrySkills.

Instead, identify the professional capability represented by
the syllabus topics.

For example:

"Python programming" may support an industry capability such as
"Python Application Development".

"Raspberry Pi and Arduino" may support
"IoT Hardware Prototyping".

"Hadoop MapReduce" may support
"Big Data Processing".

These are interpretations of syllabus content and must be
supported by explicit evidence from the supplied analysis.

Return ONLY valid JSON.

Required structure:

{
  "industryDomains": [
    {
      "name": "",
      "description": "",
      "confidenceScore": 0
    }
  ],
  "industrySkills": [
    {
      "name": "",
      "description": "",
      "domain": "",
      "category": "",
      "importance": "LOW",
      "isEmerging": false,
      "confidenceScore": 0,
      "reason": "",
      "evidence": ""
    }
  ]
}

Rules:

1. Identify one or more relevant industry domains.

2. Do not force the syllabus into one domain.

3. Industry skills must represent practical or professional
   capabilities.

4. Do not simply copy module names as skills.

5. Use concise professional skill names.

6. Avoid duplicate skills.

7. category must be one of:
   Technical
   Programming
   Data
   Security
   Cloud
   Infrastructure
   Hardware
   Design
   Research
   Practical
   Tools
   Emerging Technology

8. importance must be exactly:
   LOW
   MEDIUM
   HIGH
   CRITICAL

9. isEmerging must be a boolean.

10. confidenceScore must be between 0 and 100.

11. reason must explain why the skill is relevant.

12. evidence must identify the syllabus concept supporting it.

13. Do not invent syllabus content.

14. Do not assume industry skills without syllabus support.

15. Mark isEmerging=true only when there is reasonable evidence
    from the syllabus.

16. Industry skills may be reasonable professional interpretations
    of academic topics, but the evidence must clearly explain
    the connection.

17. Prefer broadly understandable professional skill names.

18. Return valid JSON only.

SUPPLIED SYLLABUS ANALYSIS:

${syllabusJson}
`;
};

// ============================================================
// Parse Gemini Response
// ============================================================

const parseGeminiResponse = (text) => {
  if (!text || !text.trim()) {
    throw new ApiError(
      500,
      "Gemini returned an empty industry skill analysis."
    );
  }

  let cleanedText = text.trim();

  // Remove markdown fences if Gemini accidentally returns them.
  if (cleanedText.startsWith("```")) {
    cleanedText = cleanedText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
  }

  try {
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("❌ Gemini JSON parsing failed.");
    console.error("Raw response:");
    console.error(cleanedText);

    throw new ApiError(
      500,
      "Gemini returned invalid industry skill JSON."
    );
  }
};

// ============================================================
// Validate Result
// ============================================================

const normalizeResult = (result) => {
  if (!result || typeof result !== "object") {
    throw new ApiError(
      500,
      "Gemini returned an invalid industry skill analysis."
    );
  }

  if (!Array.isArray(result.industryDomains)) {
    result.industryDomains = [];
  }

  if (!Array.isArray(result.industrySkills)) {
    result.industrySkills = [];
  }

  return result;
};

// ============================================================
// Remove Duplicates
// ============================================================

const removeDuplicateObjects = (array, key) => {
  if (!Array.isArray(array)) {
    return [];
  }

  const seen = new Set();

  return array.filter((item) => {
    const value = String(item?.[key] || "")
      .trim()
      .toLowerCase();

    if (!value || seen.has(value)) {
      return false;
    }

    seen.add(value);
    return true;
  });
};

// ============================================================
// Clean Result
// ============================================================

const cleanResult = (result) => {
  const normalized = normalizeResult(result);

  normalized.industryDomains =
    removeDuplicateObjects(
      normalized.industryDomains,
      "name"
    );

  normalized.industrySkills =
    removeDuplicateObjects(
      normalized.industrySkills,
      "name"
    );

  return normalized;
};

// ============================================================
// Call Gemini With Retry + Model Fallback
// ============================================================

const callGeminiWithFallback = async (prompt) => {
  let lastError = null;

  for (const model of GEMINI_MODELS) {
    console.log("");
    console.log("============================================");
    console.log(`Trying Gemini model: ${model}`);
    console.log("============================================");

    for (
      let attempt = 1;
      attempt <= MAX_RETRIES_PER_MODEL;
      attempt++
    ) {
      try {
        console.log(
          `Attempt ${attempt}/${MAX_RETRIES_PER_MODEL}`
        );

        const response =
          await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              responseMimeType: "application/json",
            },
          });

        const text =
          response?.text?.trim();

        if (!text) {
          throw new Error(
            "Gemini returned an empty response."
          );
        }

        console.log(
          `✅ Gemini response received from ${model}`
        );

        console.log(
          "Response length:",
          text.length
        );

        return parseGeminiResponse(text);

      } catch (error) {
        lastError = error;

        console.error("");
        console.error(
          "--------------------------------------------"
        );
        console.error(
          "❌ Gemini industry discovery failed"
        );
        console.error("Model:", model);
        console.error("Attempt:", attempt);
        console.error(
          "Message:",
          error?.message
        );
        console.error(
          "Status:",
          error?.status
        );
        console.error(
          "StatusCode:",
          error?.statusCode
        );
        console.error(
          "Code:",
          error?.code
        );
        console.error(
          "--------------------------------------------"
        );

        if (error instanceof ApiError) {
          throw error;
        }

        if (!isTemporaryGeminiError(error)) {
          throw error;
        }

        if (
          attempt < MAX_RETRIES_PER_MODEL
        ) {
          const delay =
            INITIAL_RETRY_DELAY *
            Math.pow(2, attempt - 1);

          console.log(
            `Waiting ${delay}ms before retry...`
          );

          await sleep(delay);
        }
      }
    }

    console.log(
      `Model ${model} unavailable.`
    );

    console.log(
      "Trying next Gemini model..."
    );
  }

  throw lastError ||
    new Error(
      "All Gemini models failed."
    );
};

// ============================================================
// Main Function
// ============================================================

const discoverIndustrySkills = async (
  syllabusAnalysis
) => {

  if (!syllabusAnalysis) {
    throw new ApiError(
      400,
      "Syllabus analysis is required for industry skill discovery."
    );
  }

  if (!GEMINI_API_KEY) {
    throw new ApiError(
      500,
      "Gemini API key is not configured."
    );
  }

  console.log("");
  console.log("============================================");
  console.log("Starting Industry Skill Discovery");
  console.log("Available models:", GEMINI_MODELS.join(", "));
  console.log("============================================");

  try {

    const prompt =
      buildPrompt(syllabusAnalysis);

    const result =
      await callGeminiWithFallback(prompt);

    const finalResult =
      cleanResult(result);

    console.log("");
    console.log("============================================");
    console.log(
      "✅ Industry skill discovery completed"
    );
    console.log(
      "Industry domains:",
      finalResult.industryDomains.length
    );
    console.log(
      "Industry skills:",
      finalResult.industrySkills.length
    );
    console.log("============================================");

    return finalResult;

  } catch (error) {

    if (error instanceof ApiError) {
      throw error;
    }

    console.error("");
    console.error("============================================");
    console.error(
      "❌ INDUSTRY SKILL DISCOVERY ERROR"
    );
    console.error("============================================");
    console.error("Error name:", error?.name);
    console.error("Error message:", error?.message);
    console.error("Error status:", error?.status);
    console.error(
      "Error statusCode:",
      error?.statusCode
    );
    console.error("Error code:", error?.code);
    console.error("Full error:", error);
    console.error("============================================");

    throw new ApiError(
      error?.status ||
        error?.statusCode ||
        503,
      error?.message ||
        "Gemini AI service is temporarily unavailable."
    );
  }
};

// ============================================================
// Export
// ============================================================

export default {
  discoverIndustrySkills,
};