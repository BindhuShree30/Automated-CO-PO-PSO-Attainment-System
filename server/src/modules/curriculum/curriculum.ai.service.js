import { GoogleGenAI } from "@google/genai";
import ApiError from "../../shared/errors/ApiError.js";

// ============================================================
// Gemini Configuration
// ============================================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is not configured.");
}

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

// ============================================================
// Retry Configuration
// ============================================================

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 5000;

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
    Number(error?.status) ||
    Number(error?.statusCode) ||
    Number(error?.code);

  const message = String(
    error?.message || ""
  ).toLowerCase();

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

const buildPrompt = (syllabusText) => {
  return `
You are an academic curriculum analysis assistant.

Analyze the following university syllabus.

Your task is ONLY to extract and structure information that is
explicitly present in the syllabus.

DO NOT invent topics, technologies, skills, tools, frameworks,
or concepts that are not supported by the syllabus text.

Return ONLY valid JSON.

Required JSON structure:

{
  "course": {
    "name": "",
    "code": "",
    "semester": "",
    "credits": ""
  },
  "objectives": [],
  "modules": [
    {
      "module": "",
      "topics": []
    }
  ],
  "technicalSkills": [],
  "technologiesAndTools": [],
  "programmingSkills": [],
  "practicalSkills": [],
  "dataAndAnalyticsSkills": [],
  "securitySkills": [],
  "cloudAndInfrastructureSkills": [],
  "aiAndMlSkills": []
}

Rules:

1. Extract course name, course code, semester and credits
   when available.

2. Extract course objectives only when supported by the syllabus.

3. For every module, identify the module number/name and its topics.

4. technicalSkills:
   Include technical concepts explicitly taught.

5. technologiesAndTools:
   Include named technologies, frameworks, platforms,
   protocols, libraries and software explicitly mentioned.

6. programmingSkills:
   Include programming languages and programming concepts
   explicitly present.

7. practicalSkills:
   Include laboratory, implementation, programming exercises,
   hardware interfacing and practical activities.

8. dataAndAnalyticsSkills:
   Include data analytics, data processing, Hadoop,
   MapReduce, Spark, Storm, databases or similar topics
   ONLY when present.

9. securitySkills:
   Include security concepts ONLY when present.

10. cloudAndInfrastructureSkills:
    Include cloud, fog computing, distributed systems,
    infrastructure or deployment concepts ONLY when present.

11. aiAndMlSkills:
    Include artificial intelligence, machine learning and
    related concepts ONLY when present.

12. Avoid duplicate entries.

13. Use concise skill/topic names.

14. Do not add modern industry technologies unless they
    actually appear in the syllabus.

15. If a category has no supported information,
    return an empty array.

16. Do not use markdown code fences.

17. Return valid JSON only.

18. Preserve the meaning of the original syllabus.

19. Do not convert ordinary syllabus topics into unrelated
    industry skills.

SYLLABUS:

${syllabusText}
`;
};

// ============================================================
// Normalize Result
// ============================================================

const normalizeResult = (result) => {
  if (!result || typeof result !== "object") {
    throw new ApiError(
      500,
      "Gemini returned an invalid syllabus analysis."
    );
  }

  result.course ??= {};

  result.course.name ??= "";
  result.course.code ??= "";
  result.course.semester ??= "";
  result.course.credits ??= "";

  result.objectives ??= [];
  result.modules ??= [];
  result.technicalSkills ??= [];
  result.technologiesAndTools ??= [];
  result.programmingSkills ??= [];
  result.practicalSkills ??= [];
  result.dataAndAnalyticsSkills ??= [];
  result.securitySkills ??= [];
  result.cloudAndInfrastructureSkills ??= [];
  result.aiAndMlSkills ??= [];

  return result;
};

// ============================================================
// Remove Duplicates
// ============================================================

const removeDuplicates = (array) => {
  if (!Array.isArray(array)) {
    return [];
  }

  return [
    ...new Set(
      array
        .map((item) =>
          typeof item === "string"
            ? item.trim()
            : item
        )
        .filter(Boolean)
    ),
  ];
};

// ============================================================
// Clean AI Result
// ============================================================

const cleanResult = (result) => {
  const normalized = normalizeResult(result);

  const arrayFields = [
    "objectives",
    "technicalSkills",
    "technologiesAndTools",
    "programmingSkills",
    "practicalSkills",
    "dataAndAnalyticsSkills",
    "securitySkills",
    "cloudAndInfrastructureSkills",
    "aiAndMlSkills",
  ];

  for (const field of arrayFields) {
    normalized[field] =
      removeDuplicates(normalized[field]);
  }

  if (Array.isArray(normalized.modules)) {
    normalized.modules =
      normalized.modules.map((module) => ({
        module:
          typeof module?.module === "string"
            ? module.module.trim()
            : "",

        topics:
          removeDuplicates(module?.topics),
      }));
  } else {
    normalized.modules = [];
  }

  return normalized;
};

// ============================================================
// Parse Gemini Response
// ============================================================

const parseGeminiResponse = (text) => {
  if (!text || !text.trim()) {
    throw new ApiError(
      500,
      "Gemini returned an empty response."
    );
  }

  let cleanedText = text.trim();

  // Remove markdown code fences if Gemini returns them.
  cleanedText = cleanedText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error(
      "❌ Gemini JSON parsing failed."
    );

    console.error(
      "Raw Gemini response:"
    );

    console.error(cleanedText);

    throw new ApiError(
      500,
      "Gemini returned invalid JSON."
    );
  }
};

// ============================================================
// Call Gemini With Retry
// ============================================================

const callGemini = async (prompt) => {
  let lastError = null;

  for (
    let attempt = 1;
    attempt <= MAX_RETRIES;
    attempt++
  ) {
    try {
      console.log("");
      console.log(
        "============================================"
      );

      console.log(
        `Gemini attempt ${attempt}/${MAX_RETRIES}`
      );

      console.log(
        `Gemini model: ${GEMINI_MODEL}`
      );

      console.log(
        "============================================"
      );

      const response =
        await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,

          config: {
            responseMimeType:
              "application/json",
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
        "✅ Gemini response received."
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
        "❌ Gemini request failed."
      );

      console.error(
        "Attempt:",
        attempt
      );

      console.error(
        "Model:",
        GEMINI_MODEL
      );

      console.error(
        "Message:",
        error?.message
      );

      console.error(
        "Status:",
        error?.status
      );

      console.error(
        "Code:",
        error?.code
      );

      // Don't retry application errors.
      if (error instanceof ApiError) {
        throw error;
      }

      // Don't retry permanent errors.
      if (!isTemporaryGeminiError(error)) {
        throw error;
      }

      // Stop after final attempt.
      if (attempt >= MAX_RETRIES) {
        break;
      }

      const delay =
        INITIAL_RETRY_DELAY *
        Math.pow(2, attempt - 1);

      console.log(
        `Waiting ${delay}ms before retry...`
      );

      await sleep(delay);
    }
  }

  throw lastError ||
    new Error(
      "Gemini AI service is unavailable."
    );
};

// ============================================================
// Extract Structured Syllabus Skills
// ============================================================

const extractSyllabusSkills = async (
  syllabusText
) => {

  // ----------------------------------------------------------
  // Validate syllabus text
  // ----------------------------------------------------------

  if (
    !syllabusText ||
    !syllabusText.trim()
  ) {
    throw new ApiError(
      400,
      "Syllabus text is required for AI analysis."
    );
  }

  // ----------------------------------------------------------
  // Validate API key
  // ----------------------------------------------------------

  if (!GEMINI_API_KEY) {
    throw new ApiError(
      500,
      "Gemini API key is not configured."
    );
  }

  console.log("");
  console.log(
    "============================================"
  );

  console.log(
    "Starting Gemini syllabus analysis..."
  );

  console.log(
    "Syllabus text length:",
    syllabusText.length
  );

  console.log(
    "Gemini model:",
    GEMINI_MODEL
  );

  console.log(
    "============================================"
  );

  try {

    // --------------------------------------------------------
    // Build prompt
    // --------------------------------------------------------

    const prompt =
      buildPrompt(syllabusText);

    // --------------------------------------------------------
    // Gemini request
    // --------------------------------------------------------

    const result =
      await callGemini(prompt);

    // --------------------------------------------------------
    // Clean result
    // --------------------------------------------------------

    const finalResult =
      cleanResult(result);

    console.log("");
    console.log(
      "============================================"
    );

    console.log(
      "✅ Gemini syllabus analysis completed."
    );

    console.log(
      "Modules:",
      finalResult.modules.length
    );

    console.log(
      "Technical skills:",
      finalResult.technicalSkills.length
    );

    console.log(
      "Technologies/tools:",
      finalResult.technologiesAndTools.length
    );

    console.log(
      "Programming skills:",
      finalResult.programmingSkills.length
    );

    console.log(
      "Practical skills:",
      finalResult.practicalSkills.length
    );

    console.log(
      "Data/analytics skills:",
      finalResult.dataAndAnalyticsSkills.length
    );

    console.log(
      "Security skills:",
      finalResult.securitySkills.length
    );

    console.log(
      "Cloud/infrastructure skills:",
      finalResult.cloudAndInfrastructureSkills.length
    );

    console.log(
      "AI/ML skills:",
      finalResult.aiAndMlSkills.length
    );

    console.log(
      "============================================"
    );

    return finalResult;

  } catch (error) {

    if (error instanceof ApiError) {
      throw error;
    }

    console.error("");
    console.error(
      "============================================"
    );

    console.error(
      "GEMINI SYLLABUS ANALYSIS ERROR"
    );

    console.error(
      "============================================"
    );

    console.error(
      "Error name:",
      error?.name
    );

    console.error(
      "Error message:",
      error?.message
    );

    console.error(
      "Error status:",
      error?.status
    );

    console.error(
      "Error code:",
      error?.code
    );

    console.error(
      "============================================"
    );

    // IMPORTANT:
    // Keep the actual Gemini message during development.
    throw new ApiError(
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
  extractSyllabusSkills,
};