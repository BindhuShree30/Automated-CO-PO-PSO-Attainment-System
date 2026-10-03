import { GoogleGenAI } from "@google/genai";
import ApiError from "../../shared/errors/ApiError.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const analyzeCurriculumGaps = async (
  syllabusAnalysis,
  industryAnalysis
) => {
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

  if (!process.env.GEMINI_API_KEY) {
    throw new ApiError(
      500,
      "Gemini API key is not configured."
    );
  }

  // ------------------------------------------------------------
  // 3. Prompt
  // ------------------------------------------------------------

  const prompt = `
You are an academic curriculum gap analysis assistant.

Compare the university syllabus analysis with the
industry skill analysis.

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
- If a syllabus topic partially covers an industry skill,
  classify it as PARTIALLY_COVERED.
- If the syllabus clearly covers an industry skill,
  classify it as FULLY_COVERED.
- If there is no meaningful syllabus coverage,
  classify it as NOT_COVERED.
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
      "status": "",
      "syllabusCoverage": [],
      "industryExpectation": "",
      "gapDescription": "",
      "severity": ""
    }
  ],

  "solutions": [
    {
      "industrySkill": "",
      "severity": "",
      "solution": "",
      "suggestedTopics": [],
      "suggestedTechnologies": [],
      "suggestedPracticalActivities": [],
      "suggestedProjects": []
    }
  ],

  "curriculumRecommendations": []
}

Allowed status values:

FULLY_COVERED
PARTIALLY_COVERED
NOT_COVERED

Allowed severity values:

LOW
MEDIUM
HIGH

SYLLABUS ANALYSIS:

${JSON.stringify(
  syllabusAnalysis,
  null,
  2
)}

INDUSTRY ANALYSIS:

${JSON.stringify(
  industryAnalysis,
  null,
  2
)}
`;

  // ------------------------------------------------------------
  // 4. Call Gemini
  // ------------------------------------------------------------

  try {
    console.log(
      "Starting curriculum gap analysis..."
    );

    const response =
      await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

    // ----------------------------------------------------------
    // 5. Get response text
    // ----------------------------------------------------------

    const text =
      response.text?.trim();

    if (!text) {
      throw new ApiError(
        500,
        "Gemini returned an empty curriculum gap analysis."
      );
    }

    console.log(
      "Gemini gap analysis response received."
    );

    // ----------------------------------------------------------
    // 6. Parse JSON
    // ----------------------------------------------------------

    let result;

    try {
      result = JSON.parse(text);
    } catch (error) {
      console.error(
        "Gemini gap analysis JSON error:",
        error
      );

      console.error(
        "Raw Gemini response:",
        text
      );

      throw new ApiError(
        500,
        "Gemini returned invalid JSON for curriculum gap analysis."
      );
    }

    // ----------------------------------------------------------
    // 7. Validate result
    // ----------------------------------------------------------

    if (
      !result ||
      typeof result !== "object"
    ) {
      throw new ApiError(
        500,
        "Invalid curriculum gap analysis returned by Gemini."
      );
    }

    // ----------------------------------------------------------
    // 8. Default missing fields
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

    // ----------------------------------------------------------
    // 9. Log result
    // ----------------------------------------------------------

    console.log(
      "--------------------------------------------"
    );

    console.log(
      "Industry skills evaluated:",
      result.summary
        .totalIndustrySkillsEvaluated
    );

    console.log(
      "Fully covered:",
      result.summary
        .fullyCovered
    );

    console.log(
      "Partially covered:",
      result.summary
        .partiallyCovered
    );

    console.log(
      "Not covered:",
      result.summary
        .notCovered
    );

    console.log(
      "Curriculum gaps:",
      result.curriculumGaps.length
    );

    console.log(
      "Solutions:",
      result.solutions.length
    );

    console.log(
      "--------------------------------------------"
    );

    // ----------------------------------------------------------
    // 10. Return result
    // ----------------------------------------------------------

    return result;

  } catch (error) {

    // Preserve our own ApiError
    if (error instanceof ApiError) {
      throw error;
    }

    console.error(
      "============================================"
    );

    console.error(
      "CURRICULUM GAP ANALYSIS ERROR"
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
      "Full error:",
      error
    );

    console.error(
      "============================================"
    );

    throw new ApiError(
      500,
      error?.message ||
        "Failed to analyze curriculum gaps using Gemini AI."
    );
  }
};

export default {
  analyzeCurriculumGaps,
};