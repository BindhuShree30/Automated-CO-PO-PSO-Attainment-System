import { GoogleGenAI } from "@google/genai";
import ApiError from "../../shared/errors/ApiError.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

const analyzeCurriculumGaps = async (syllabusAnalysis, industryAnalysis) => {
  // ------------------------------------------------------------
  // 1. Validate input
  // ------------------------------------------------------------
  if (!syllabusAnalysis) {
    throw new ApiError(
      400,
      "Syllabus analysis is required for curriculum gap analysis."
    );
  }

  if (!industryAnalysis) {
    throw new ApiError(
      400,
      "Industry analysis is required for curriculum gap analysis."
    );
  }

  // ------------------------------------------------------------
  // 2. Validate API key
  // ------------------------------------------------------------
  if (!GEMINI_API_KEY) {
    throw new ApiError(500, "Gemini API key is not configured.");
  }

  // ------------------------------------------------------------
  // 3. Prompt
  // ------------------------------------------------------------
  const prompt = `
You are an academic curriculum gap analysis assistant.

Compare the university syllabus analysis with the industry skill analysis.

Your goal is to identify:
1. Fully covered industry skills
2. Partially covered industry skills
3. Industry skills not covered
4. Curriculum gaps
5. Practical solutions for those gaps
6. Recommended curriculum improvements

IMPORTANT RULES:
- Only use information supported by the supplied data.
- Do not invent syllabus topics.
- Do not claim that a skill is missing when it is clearly covered.
- If a syllabus topic partially covers an industry skill, classify it as PARTIALLY_COVERED.
- If the syllabus clearly covers an industry skill, classify it as FULLY_COVERED.
- If there is no meaningful syllabus coverage, classify it as NOT_COVERED.
- Do not create solutions for FULLY_COVERED skills.
- Solutions should focus on PARTIALLY_COVERED and NOT_COVERED skills.
- Avoid duplicate skills.
- Keep recommendations practical and concise.
- Return ONLY valid JSON.
- Do not use markdown code fences.

Required JSON format:
{
  "summary": {
    "totalIndustrySkillsEvaluated": 0,
    "fullyCovered": 0,
    "partiallyCovered": 0,
    "notCovered": 0
  },
  "curriculumGaps": [
    {
      "industrySkill": "",
      "status": "PARTIALLY_COVERED",
      "syllabusCoverage": [],
      "industryExpectation": "",
      "gapDescription": "",
      "severity": "HIGH"
    }
  ],
  "solutions": [
    {
      "industrySkill": "",
      "severity": "HIGH",
      "solution": "",
      "suggestedTopics": [],
      "suggestedTechnologies": [],
      "suggestedPracticalActivities": [],
      "suggestedProjects": []
    }
  ],
  "curriculumRecommendations": []
}

Allowed status values: FULLY_COVERED, PARTIALLY_COVERED, NOT_COVERED
Allowed severity values: LOW, MEDIUM, HIGH

SYLLABUS ANALYSIS:
${JSON.stringify(syllabusAnalysis, null, 2)}

INDUSTRY ANALYSIS:
${JSON.stringify(industryAnalysis, null, 2)}
`;

  // ------------------------------------------------------------
  // 4. Call Gemini
  // ------------------------------------------------------------
  try {
    console.log("Starting curriculum gap analysis with model:", GEMINI_MODEL);

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    let text = response.text?.trim();

    if (!text) {
      throw new ApiError(
        500,
        "Gemini returned an empty curriculum gap analysis."
      );
    }

    // Strip markdown code fences if present
    text = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    // ----------------------------------------------------------
    // 5. Parse JSON
    // ----------------------------------------------------------
    let result;
    try {
      result = JSON.parse(text);
    } catch (error) {
      console.error("Gemini gap analysis JSON error:", error);
      console.error("Raw response:", text);
      throw new ApiError(
        500,
        "Gemini returned invalid JSON for curriculum gap analysis."
      );
    }

    if (!result || typeof result !== "object") {
      throw new ApiError(
        500,
        "Invalid curriculum gap analysis returned by Gemini."
      );
    }

    // ----------------------------------------------------------
    // 6. Default fallback fields
    // ----------------------------------------------------------
    result.summary ??= {
      totalIndustrySkillsEvaluated: 0,
      fullyCovered: 0,
      partiallyCovered: 0,
      notCovered: 0,
    };
    result.curriculumGaps ??= [];
    result.solutions ??= [];
    result.curriculumRecommendations ??= [];

    return result;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    console.error("CURRICULUM GAP ANALYSIS ERROR:", error?.message);
    throw new ApiError(
      500,
      error?.message || "Failed to analyze curriculum gaps using Gemini AI."
    );
  }
};

export default {
  analyzeCurriculumGaps,
};