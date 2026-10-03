/**
 * ------------------------------------------------------------------
 * Automated CO–PSO Mapping AI Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Uses Google Gemini to suggest meaningful CO–PSO correlations.
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
 * - Gemini returns ONLY meaningful CO–PSO relationships.
 * - Unmapped CO–PSO pairs are NOT returned.
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
  programSpecificOutcomes,
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

  const psos = programSpecificOutcomes.map((pso) => ({
    id: pso.id,
    code: pso.code,
    description: pso.description ?? "",
  }));

  return `
You are an expert in Outcome Based Education (OBE),
NBA accreditation, VTU engineering education,
Computer Science and Engineering curriculum design,
and CO–PSO mapping.

Your task is to generate a meaningful CO–PSO correlation
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

PROGRAM SPECIFIC OUTCOMES:

${JSON.stringify(
  psos,
  null,
  2
)}

MAPPING SCALE:

1 = Low correlation
2 = Medium correlation
3 = High correlation
- = No meaningful mapping

IMPORTANT RULES:

1. Use ONLY 1, 2, or 3 when a meaningful CO–PSO
   relationship exists.

2. If there is NO meaningful relationship between a
   Course Outcome and a Program Specific Outcome,
   DO NOT return a mapping for that pair.

3. Do NOT force a mapping merely to fill the matrix.

4. A missing CO–PSO pair means NO MAPPING and will
   be displayed as "-".

5. NEVER use 0.

6. NEVER use negative numbers.

7. NEVER use decimal values.

8. Evaluate the actual semantic and academic
   relationship between the CO and PSO.

9. A higher mapping level means stronger contribution.

10. Use:
    1 = Low
    2 = Medium
    3 = High

11. Do not assign a mapping merely because a keyword
    appears in both the CO and PSO.

12. Consider the actual knowledge, skills, application,
    analysis, design, problem-solving, programming,
    software development, computing tools, emerging
    technologies, data-driven techniques, and other
    competencies represented by the CO and PSO.

13. A CO may map to multiple PSOs when justified.

14. A PSO may receive mappings from multiple COs
    when justified.

15. A CO does NOT need to map to every PSO.

16. A PSO does NOT need to map to every CO.

17. Some CO–PSO pairs SHOULD remain unmapped when
    there is no meaningful academic relationship.

18. Do not invent new COs.

19. Do not invent new PSOs.

20. Preserve the exact IDs supplied for COs and PSOs.

21. Preserve the exact CO and PSO codes supplied.

22. Do not duplicate any CO–PSO pair.

23. Return ONLY meaningful mappings.

24. Do NOT return entries for unmapped pairs.

25. Every returned mapping must contain a valid
    mapping level of 1, 2, or 3.

26. Provide a concise academic reason for every
    returned mapping.

27. The number of mappings may be LESS than:

       Number of COs × Number of PSOs

28. Do NOT attempt to make the number of mappings
    equal to the total number of possible CO–PSO
    combinations.

29. The AI output is only a recommendation.
    Faculty must review the generated mapping before
    saving it.

Return ONLY valid JSON.

The JSON must contain an array called "mappings".

Each mapping must have exactly this structure:

{
  "courseOutcomeId": "exact CO id",
  "courseOutcomeCode": "exact CO code",
  "programSpecificOutcomeId": "exact PSO id",
  "programSpecificOutcomeCode": "exact PSO code",
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
 * CO count × PSO count
 *
 * because unmapped relationships are intentionally omitted.
 *
 * Example:
 *
 * 4 COs × 2 PSOs = 8 possible pairs
 *
 * Gemini may return:
 *
 * 5 mappings
 *
 * The remaining 3 pairs are displayed as "-".
 *
 * ------------------------------------------------------------------
 */

const validateMappings = (
  mappings,
  courseOutcomes,
  programSpecificOutcomes
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
   * Create valid PSO ID set
   * --------------------------------------------------------------
   */

  const validPSOIds =
    new Set(
      programSpecificOutcomes.map(
        (pso) => pso.id
      )
    );

  /**
   * --------------------------------------------------------------
   * Track returned CO–PSO pairs
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
       * Validate PSO ID
       * ----------------------------------------------------------
       */

      if (
        !validPSOIds.has(
          mapping.programSpecificOutcomeId
        )
      ) {
        throw new Error(
          "AI returned an invalid Program Specific Outcome ID."
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
       * Create unique CO–PSO pair
       * ----------------------------------------------------------
       */

      const pair =
        `${mapping.courseOutcomeId}:${mapping.programSpecificOutcomeId}`;

      /**
       * ----------------------------------------------------------
       * Prevent duplicate mappings
       * ----------------------------------------------------------
       */

      if (
        returnedPairs.has(pair)
      ) {
        throw new Error(
          "AI returned duplicate CO–PSO mappings."
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

        programSpecificOutcomeId:
          mapping.programSpecificOutcomeId,

        programSpecificOutcomeCode:
          String(
            mapping.programSpecificOutcomeCode ?? ""
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

    const programSpecificOutcome =
      programSpecificOutcomes.find(
        (pso) =>
          pso.id ===
          mapping.programSpecificOutcomeId
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
     * Verify PSO code
     * ------------------------------------------------------------
     */

    if (
      mapping.programSpecificOutcomeCode !==
      programSpecificOutcome.code
    ) {
      throw new Error(
        `AI returned an incorrect Program Specific Outcome code for ${mapping.programSpecificOutcomeId}.`
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
 * Generate Automated CO–PSO Mapping
 * ------------------------------------------------------------------
 */

const generateMapping = async ({
  course,
  courseOutcomes,
  programSpecificOutcomes,
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
   * Validate PSOs
   * --------------------------------------------------------------
   */

  if (
    !Array.isArray(
      programSpecificOutcomes
    ) ||
    programSpecificOutcomes.length === 0
  ) {
    throw new Error(
      "Program Specific Outcomes are required."
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
      programSpecificOutcomes,
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

                        programSpecificOutcomeId: {
                          type: "STRING",
                        },

                        programSpecificOutcomeCode: {
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
                        "programSpecificOutcomeId",
                        "programSpecificOutcomeCode",
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
      "Unable to generate automated CO–PSO mapping."
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
      programSpecificOutcomes
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