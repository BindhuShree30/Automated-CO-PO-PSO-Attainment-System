/**
 * ------------------------------------------------------------------
 * Automated CO–PO Mapping AI Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Uses Google Gemini to suggest meaningful CO–PO correlations.
 *
 * Mapping levels:
 *
 * - = No mapping
 * 1 = Low
 * 2 = Medium
 * 3 = High
 *
 * IMPORTANT:
 *
 * - Gemini returns ONLY meaningful CO–PO relationships.
 * - Unmapped CO–PO pairs are NOT returned.
 * - The frontend should display "-" for missing pairs.
 * - "-" is NOT stored as a database mapping.
 * - AI suggestions are returned to Faculty for review.
 * - They are NOT automatically persisted.
 *
 * ------------------------------------------------------------------
 */

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent";

/**
 * ------------------------------------------------------------------
 * Get Gemini API Key
 * ------------------------------------------------------------------
 */
const getGeminiApiKey = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured."
    );
  }

  return apiKey;
};

/**
 * ------------------------------------------------------------------
 * Build AI Prompt
 * ------------------------------------------------------------------
 */
const buildPrompt = ({
  course,
  courseOutcomes,
  programOutcomes,
}) => {
  const courseInformation = {
    id: course?.id ?? "",
    code: course?.code ?? "",
    name: course?.name ?? "",
    description: course?.description ?? "",
  };

  const cos = courseOutcomes.map((co) => ({
    id: co.id,
    code: co.code,
    description: co.description ?? "",
  }));

  const pos = programOutcomes.map((po) => ({
    id: po.id,
    code: po.code,
    description: po.description ?? "",
  }));

  return `
You are an expert in Outcome Based Education (OBE),
NBA accreditation, curriculum design, and CO-PO mapping.

Your task is to generate a meaningful CO-PO correlation
for the given course.

COURSE:
${JSON.stringify(
  courseInformation,
  null,
  2
)}

COURSE OUTCOMES:
${JSON.stringify(
  cos,
  null,
  2
)}

PROGRAM OUTCOMES:
${JSON.stringify(
  pos,
  null,
  2
)}

MAPPING SCALE:

1 = Low correlation
2 = Medium correlation
3 = High correlation
- = No meaningful mapping

IMPORTANT RULES:

1. Use ONLY 1, 2, or 3 when a meaningful CO-PO
   relationship exists.

2. If there is NO meaningful relationship between a
   Course Outcome and a Program Outcome, DO NOT
   return a mapping for that pair.

3. Do NOT force a mapping merely to fill the matrix.

4. A missing CO-PO pair means NO MAPPING and will
   be displayed as "-".

5. NEVER use 0.

6. NEVER use negative numbers.

7. NEVER use decimal values.

8. Evaluate the actual semantic and academic
   relationship between the CO and PO.

9. A higher mapping level means stronger contribution.

10. Use:
    1 = Low
    2 = Medium
    3 = High

11. Do not assign a mapping merely because a keyword
    appears in both the CO and PO.

12. Consider the actual knowledge, skills, application,
    analysis, design, problem-solving, communication,
    teamwork, ethics, modern tools, experimentation,
    professional skills, and other competencies
    represented by the CO and PO.

13. A CO may map to multiple POs when justified.

14. A PO may receive mappings from multiple COs when
    justified.

15. A CO does NOT need to map to every PO.

16. A PO does NOT need to map to every CO.

17. Some CO-PO pairs SHOULD remain unmapped when
    there is no meaningful academic relationship.

18. Do not invent new COs.

19. Do not invent new POs.

20. Preserve the exact IDs supplied for COs and POs.

21. Preserve the exact CO and PO codes supplied.

22. Do not duplicate any CO-PO pair.

23. Return ONLY meaningful mappings.

24. Do NOT return entries for unmapped pairs.

25. Every returned mapping must contain a valid
    mapping level of 1, 2, or 3.

26. Provide a concise academic reason for every
    returned mapping.

27. The number of mappings may be LESS than:

       Number of COs × Number of POs

28. Do NOT attempt to make the number of mappings equal
    to the total number of possible CO-PO combinations.

Return ONLY valid JSON.

The JSON must contain an array called "mappings".

Each mapping must have exactly this structure:

{
  "courseOutcomeId": "exact CO id",
  "courseOutcomeCode": "exact CO code",
  "programOutcomeId": "exact PO id",
  "programOutcomeCode": "exact PO code",
  "mappingLevel": 1,
  "reason": "short academic justification"
}

Remember:

- 1 = Low
- 2 = Medium
- 3 = High
- Missing pair = No mapping "-"
`;
};

/**
 * ------------------------------------------------------------------
 * Extract Gemini Text
 * ------------------------------------------------------------------
 */
const extractGeminiText = (response) => {
  const text =
    response?.candidates?.[0]
      ?.content?.parts
      ?.map((part) => part.text || "")
      .join("");

  if (!text) {
    throw new Error(
      "Gemini returned an empty response."
    );
  }

  return text;
};

/**
 * ------------------------------------------------------------------
 * Parse Gemini JSON Safely
 * ------------------------------------------------------------------
 */
const parseJsonResponse = (text) => {
  /**
   * --------------------------------------------------------------
   * First attempt:
   * Gemini returned pure JSON.
   * --------------------------------------------------------------
   */
  try {
    return JSON.parse(text);
  } catch {
    // Continue with cleanup.
  }

  /**
   * --------------------------------------------------------------
   * Remove accidental Markdown code fences.
   * --------------------------------------------------------------
   */
  const cleaned = text
    .replace(
      /^```json\s*/i,
      ""
    )
    .replace(
      /^```\s*/i,
      ""
    )
    .replace(
      /\s*```$/i,
      ""
    )
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error(
      "Gemini returned invalid JSON."
    );
  }
};

/**
 * ------------------------------------------------------------------
 * Validate AI Result
 * ------------------------------------------------------------------
 *
 * IMPORTANT:
 *
 * We DO NOT require:
 *
 * CO count × PO count
 *
 * because unmapped relationships are intentionally omitted.
 *
 * Example:
 *
 * 4 COs × 5 POs = 20 possible pairs
 *
 * Gemini may return:
 *
 * 8 mappings
 *
 * The remaining 12 pairs are displayed as "-".
 *
 * ------------------------------------------------------------------
 */
const validateMappings = (
  mappings,
  courseOutcomes,
  programOutcomes
) => {
  /**
   * --------------------------------------------------------------
   * Validate Array
   * --------------------------------------------------------------
   */
  if (!Array.isArray(mappings)) {
    throw new Error(
      "AI response does not contain a valid mappings array."
    );
  }

  /**
   * --------------------------------------------------------------
   * Create valid CO ID set
   * --------------------------------------------------------------
   */
  const validCOIds =
    new Set(
      courseOutcomes.map(
        (co) => co.id
      )
    );

  /**
   * --------------------------------------------------------------
   * Create valid PO ID set
   * --------------------------------------------------------------
   */
  const validPOIds =
    new Set(
      programOutcomes.map(
        (po) => po.id
      )
    );

  /**
   * --------------------------------------------------------------
   * Track returned CO-PO pairs
   * --------------------------------------------------------------
   */
  const returnedPairs =
    new Set();

  /**
   * --------------------------------------------------------------
   * Validate every returned mapping
   * --------------------------------------------------------------
   */
  const validatedMappings =
    mappings.map((mapping) => {
      /**
       * ----------------------------------------------------------
       * Validate mapping object
       * ----------------------------------------------------------
       */
      if (
        !mapping ||
        typeof mapping !== "object"
      ) {
        throw new Error(
          "AI returned an invalid mapping object."
        );
      }

      /**
       * ----------------------------------------------------------
       * Validate Course Outcome ID
       * ----------------------------------------------------------
       */
      if (
        !validCOIds.has(
          mapping.courseOutcomeId
        )
      ) {
        throw new Error(
          "AI returned an invalid Course Outcome ID."
        );
      }

      /**
       * ----------------------------------------------------------
       * Validate Program Outcome ID
       * ----------------------------------------------------------
       */
      if (
        !validPOIds.has(
          mapping.programOutcomeId
        )
      ) {
        throw new Error(
          "AI returned an invalid Program Outcome ID."
        );
      }

      /**
       * ----------------------------------------------------------
       * Validate Mapping Level
       *
       * ONLY:
       *
       * 1 = Low
       * 2 = Medium
       * 3 = High
       *
       * No mapping is represented by an absent pair,
       * NOT by a database value.
       * ----------------------------------------------------------
       */
      const level =
        Number(
          mapping.mappingLevel
        );

      if (
        !Number.isInteger(level) ||
        level < 1 ||
        level > 3
      ) {
        throw new Error(
          "AI returned an invalid mapping level. Only 1, 2, and 3 are allowed."
        );
      }

      /**
       * ----------------------------------------------------------
       * Create unique CO-PO pair
       * ----------------------------------------------------------
       */
      const pair =
        `${mapping.courseOutcomeId}:${mapping.programOutcomeId}`;

      /**
       * ----------------------------------------------------------
       * Prevent duplicate mappings
       * ----------------------------------------------------------
       */
      if (
        returnedPairs.has(pair)
      ) {
        throw new Error(
          "AI returned duplicate CO-PO mappings."
        );
      }

      returnedPairs.add(pair);

      /**
       * ----------------------------------------------------------
       * Return clean mapping object
       * ----------------------------------------------------------
       */
      return {
        courseOutcomeId:
          mapping.courseOutcomeId,

        courseOutcomeCode:
          String(
            mapping.courseOutcomeCode ?? ""
          ).trim(),

        programOutcomeId:
          mapping.programOutcomeId,

        programOutcomeCode:
          String(
            mapping.programOutcomeCode ?? ""
          ).trim(),

        mappingLevel:
          level,

        reason:
          String(
            mapping.reason ?? ""
          ).trim(),
      };
    });

  /**
   * --------------------------------------------------------------
   * Verify mapping codes against actual database data
   * --------------------------------------------------------------
   */
  for (const mapping of validatedMappings) {
    const courseOutcome =
      courseOutcomes.find(
        (co) =>
          co.id ===
          mapping.courseOutcomeId
      );

    const programOutcome =
      programOutcomes.find(
        (po) =>
          po.id ===
          mapping.programOutcomeId
      );

    /**
     * ------------------------------------------------------------
     * Verify CO code
     * ------------------------------------------------------------
     */
    if (
      mapping.courseOutcomeCode !==
      courseOutcome.code
    ) {
      throw new Error(
        `AI returned an incorrect Course Outcome code for ${mapping.courseOutcomeId}.`
      );
    }

    /**
     * ------------------------------------------------------------
     * Verify PO code
     * ------------------------------------------------------------
     */
    if (
      mapping.programOutcomeCode !==
      programOutcome.code
    ) {
      throw new Error(
        `AI returned an incorrect Program Outcome code for ${mapping.programOutcomeId}.`
      );
    }
  }

  /**
   * --------------------------------------------------------------
   * Return validated meaningful mappings
   *
   * Missing pairs intentionally remain absent.
   * The frontend displays them as "-".
   * --------------------------------------------------------------
   */
  return validatedMappings;
};

/**
 * ------------------------------------------------------------------
 * Generate Automated CO–PO Mapping
 * ------------------------------------------------------------------
 */
const generateMapping = async ({
  course,
  courseOutcomes,
  programOutcomes,
}) => {
  /**
   * --------------------------------------------------------------
   * Validate Course
   * --------------------------------------------------------------
   */
  if (!course) {
    throw new Error(
      "Course information is required."
    );
  }

  /**
   * --------------------------------------------------------------
   * Validate Course Outcomes
   * --------------------------------------------------------------
   */
  if (
    !Array.isArray(courseOutcomes) ||
    courseOutcomes.length === 0
  ) {
    throw new Error(
      "Course Outcomes are required."
    );
  }

  /**
   * --------------------------------------------------------------
   * Validate Program Outcomes
   * --------------------------------------------------------------
   */
  if (
    !Array.isArray(programOutcomes) ||
    programOutcomes.length === 0
  ) {
    throw new Error(
      "Program Outcomes are required."
    );
  }

  /**
   * --------------------------------------------------------------
   * Get Gemini API Key
   * --------------------------------------------------------------
   */
  const apiKey =
    getGeminiApiKey();

  /**
   * --------------------------------------------------------------
   * Build Prompt
   * --------------------------------------------------------------
   */
  const prompt =
    buildPrompt({
      course,
      courseOutcomes,
      programOutcomes,
    });

  /**
   * --------------------------------------------------------------
   * Call Gemini API
   * --------------------------------------------------------------
   */
  let response;

  try {
    response =
      await fetch(
        GEMINI_API_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "x-goog-api-key":
              apiKey,
          },

          body: JSON.stringify({
            contents: [
              {
                role: "user",

                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],

            generationConfig: {
              responseMimeType:
                "application/json",

              responseSchema: {
                type: "OBJECT",

                properties: {
                  mappings: {
                    type: "ARRAY",

                    items: {
                      type: "OBJECT",

                      properties: {
                        courseOutcomeId: {
                          type: "STRING",
                        },

                        courseOutcomeCode: {
                          type: "STRING",
                        },

                        programOutcomeId: {
                          type: "STRING",
                        },

                        programOutcomeCode: {
                          type: "STRING",
                        },

                        mappingLevel: {
                          type: "INTEGER",
                        },

                        reason: {
                          type: "STRING",
                        },
                      },

                      required: [
                        "courseOutcomeId",
                        "courseOutcomeCode",
                        "programOutcomeId",
                        "programOutcomeCode",
                        "mappingLevel",
                        "reason",
                      ],
                    },
                  },
                },

                required: [
                  "mappings",
                ],
              },
            },
          }),
        }
      );
  } catch (error) {
    console.error(
      "Gemini Request Error:",
      error
    );

    throw new Error(
      "Unable to connect to Gemini API."
    );
  }

  /**
   * --------------------------------------------------------------
   * Handle Gemini API Error
   * --------------------------------------------------------------
   */
  if (!response.ok) {
    const errorBody =
      await response.text();

    console.error(
      "Gemini API Error:",
      errorBody
    );

    throw new Error(
      "Unable to generate automated CO-PO mapping."
    );
  }

  /**
   * --------------------------------------------------------------
   * Parse Gemini Response
   * --------------------------------------------------------------
   */
  const result =
    await response.json();

  /**
   * --------------------------------------------------------------
   * Extract Text
   * --------------------------------------------------------------
   */
  const text =
    extractGeminiText(
      result
    );

  /**
   * --------------------------------------------------------------
   * Parse JSON
   * --------------------------------------------------------------
   */
  const parsed =
    parseJsonResponse(
      text
    );

  /**
   * --------------------------------------------------------------
   * Validate Result
   * --------------------------------------------------------------
   */
  const mappings =
    validateMappings(
      parsed.mappings,
      courseOutcomes,
      programOutcomes
    );

  /**
   * --------------------------------------------------------------
   * Return Suggestions
   * --------------------------------------------------------------
   */
  return mappings;
};

/**
 * ------------------------------------------------------------------
 * Export
 * ------------------------------------------------------------------
 */
export default {
  generateMapping,
};