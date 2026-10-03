/**
 * ------------------------------------------------------------------
 * CO–PO Matrix
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Mapping Levels:
 *
 * 1 = Low
 * 2 = Medium
 * 3 = High
 *
 * Empty / "-" = No Mapping
 *
 * Automated Mapping:
 * - Gemini generates suggestions.
 * - Suggestions are shown to Faculty.
 * - Faculty can review/change them.
 * - Suggestions are NOT automatically saved.
 *
 * Printing:
 * - Professional A4 landscape layout.
 * - Page 1 = CO–PO Matrix.
 * - Page 2 = AI Suggestions, when available.
 * ------------------------------------------------------------------
 */

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../../api/axios";

function COPOMatrix() {
  /* ================================================================
     STATE
  ================================================================ */

  const [courses, setCourses] = useState([]);

  const [selectedCourseId, setSelectedCourseId] =
    useState("");

  const [course, setCourse] = useState(null);

  const [courseOutcomes, setCourseOutcomes] =
    useState([]);

  const [programOutcomes, setProgramOutcomes] =
    useState([]);

  const [matrix, setMatrix] = useState({});

  const [aiSuggestions, setAiSuggestions] =
    useState([]);

  const [loadingCourses, setLoadingCourses] =
    useState(false);

  const [loadingMatrix, setLoadingMatrix] =
    useState(false);

  const [generating, setGenerating] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* ================================================================
     LOAD COURSES
  ================================================================ */

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoadingCourses(true);
      setError("");

      const response =
        await api.get("/courses");

      const data =
        response.data?.data ?? [];

      setCourses(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load courses:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load courses."
      );
    } finally {
      setLoadingCourses(false);
    }
  };

  /* ================================================================
     SELECTED COURSE
  ================================================================ */

  const selectedCourse = useMemo(() => {
    return courses.find(
      (item) =>
        item.id === selectedCourseId
    );
  }, [
    courses,
    selectedCourseId,
  ]);

  /* ================================================================
     COURSE CHANGE
  ================================================================ */

  const handleCourseChange = async (
    event
  ) => {
    const courseId =
      event.target.value;

    setSelectedCourseId(courseId);

    setCourse(null);
    setCourseOutcomes([]);
    setProgramOutcomes([]);
    setMatrix({});
    setAiSuggestions([]);
    setError("");
    setSuccess("");

    if (!courseId) {
      return;
    }

    await loadCourseData(courseId);
  };

  /* ================================================================
     LOAD COURSE DATA
  ================================================================ */

  const loadCourseData = async (
    courseId
  ) => {
    try {
      setLoadingMatrix(true);
      setError("");

      /* ------------------------------------------------------------
         Get Course
      ------------------------------------------------------------ */

      const courseResponse =
        await api.get(
          `/courses/${courseId}`
        );

      const courseData =
        courseResponse.data?.data ??
        null;

      setCourse(courseData);

      /* ------------------------------------------------------------
         Get Course Outcomes
      ------------------------------------------------------------ */

      const coResponse =
        await api.get(
          `/co/course/${courseId}`
        );

      const coData =
        coResponse.data?.data ?? [];

      const normalizedCOs =
        Array.isArray(coData)
          ? [...coData].sort(
              (a, b) =>
                Number(a.coNumber || 0) -
                Number(b.coNumber || 0)
            )
          : [];

      setCourseOutcomes(
        normalizedCOs
      );

      /* ------------------------------------------------------------
         Program ID
      ------------------------------------------------------------ */

      const programId =
        courseData?.programId ||
        courseData?.program?.id ||
        selectedCourse?.programId;

      if (!programId) {
        throw new Error(
          "Program information is missing for this course."
        );
      }

      /* ------------------------------------------------------------
         Get Program Outcomes
      ------------------------------------------------------------ */

      const poResponse =
        await api.get(
          `/program-outcomes/program/${programId}`
        );

      const poData =
        poResponse.data?.data ?? [];

      /*
       * IMPORTANT:
       * Sort PO numerically.
       *
       * PO1
       * PO2
       * ...
       * PO9
       * PO10
       * PO11
       * PO12
       */

      const normalizedPOs =
        Array.isArray(poData)
          ? [...poData].sort(
              (a, b) => {
                const aNumber =
                  parseInt(
                    String(
                      a.code || ""
                    ).replace(
                      /\D/g,
                      ""
                    ),
                    10
                  );

                const bNumber =
                  parseInt(
                    String(
                      b.code || ""
                    ).replace(
                      /\D/g,
                      ""
                    ),
                    10
                  );

                if (
                  Number.isNaN(aNumber) &&
                  Number.isNaN(bNumber)
                ) {
                  return String(
                    a.code || ""
                  ).localeCompare(
                    String(
                      b.code || ""
                    )
                  );
                }

                if (
                  Number.isNaN(aNumber)
                ) {
                  return 1;
                }

                if (
                  Number.isNaN(bNumber)
                ) {
                  return -1;
                }

                return (
                  aNumber - bNumber
                );
              }
            )
          : [];

      setProgramOutcomes(
        normalizedPOs
      );

      /* ------------------------------------------------------------
         Get Existing Matrix
      ------------------------------------------------------------ */

      const matrixResponse =
        await api.get(
          `/co-po-mappings/matrix/${courseId}`
        );

      const existingMappings =
        matrixResponse.data?.data
          ?.mappings ?? [];

      buildMatrix(
        normalizedCOs,
        normalizedPOs,
        existingMappings
      );
    } catch (err) {
      console.error(
        "Failed to load CO-PO data:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load CO-PO mapping data."
      );
    } finally {
      setLoadingMatrix(false);
    }
  };

  /* ================================================================
     BUILD MATRIX
  ================================================================ */

  const buildMatrix = (
    cos,
    pos,
    existingMappings
  ) => {
    const newMatrix = {};

    cos.forEach((co) => {
      newMatrix[co.id] = {};

      pos.forEach((po) => {
        newMatrix[co.id][po.id] = "";
      });
    });

    if (
      Array.isArray(existingMappings)
    ) {
      existingMappings.forEach(
        (mapping) => {
          const coId =
            mapping.courseOutcomeId;

          const poId =
            mapping.programOutcomeId;

          const level =
            Number(
              mapping.mappingLevel
            );

          if (
            newMatrix[coId] &&
            newMatrix[coId][poId] !==
              undefined &&
            [1, 2, 3].includes(
              level
            )
          ) {
            newMatrix[coId][poId] =
              level;
          }
        }
      );
    }

    setMatrix(newMatrix);
  };

  /* ================================================================
     MANUAL MAPPING CHANGE
  ================================================================ */

  const handleMappingChange = (
    courseOutcomeId,
    programOutcomeId,
    value
  ) => {
    const level =
      Number(value);

    if (
      value !== "" &&
      ![1, 2, 3].includes(level)
    ) {
      return;
    }

    setMatrix((previous) => ({
      ...previous,

      [courseOutcomeId]: {
        ...(previous[
          courseOutcomeId
        ] || {}),

        [programOutcomeId]:
          value === ""
            ? ""
            : level,
      },
    }));

    setAiSuggestions([]);
    setSuccess("");
  };

  /* ================================================================
     GENERATE AUTOMATIC MAPPING
  ================================================================ */

  const handleGenerateAutomaticMapping =
    async () => {
      if (!selectedCourseId) {
        setError(
          "Please select a course first."
        );

        return;
      }

      try {
        setGenerating(true);
        setError("");
        setSuccess("");
        setAiSuggestions([]);

        const response =
          await api.post(
            "/co-po-mappings/automate",
            {
              courseId:
                selectedCourseId,
            }
          );

        const suggestions =
          response.data?.data
            ?.suggestions ?? [];

        if (
          !Array.isArray(
            suggestions
          )
        ) {
          throw new Error(
            "Invalid automated mapping response."
          );
        }

        const validSuggestions =
          suggestions
            .filter((mapping) => {
              const level =
                Number(
                  mapping.mappingLevel
                );

              return (
                [1, 2, 3].includes(
                  level
                ) &&
                mapping.courseOutcomeId &&
                mapping.programOutcomeId
              );
            })
            .map((mapping) => ({
              ...mapping,

              mappingLevel:
                Number(
                  mapping.mappingLevel
                ),
            }));

        setAiSuggestions(
          validSuggestions
        );

        /*
         * Apply AI suggestions
         * only to frontend matrix.
         *
         * NOT saved automatically.
         */

        setMatrix((previous) => {
          const updated = {
            ...previous,
          };

          validSuggestions.forEach(
            (mapping) => {
              if (
                !updated[
                  mapping.courseOutcomeId
                ]
              ) {
                updated[
                  mapping.courseOutcomeId
                ] = {};
              }

              updated[
                mapping.courseOutcomeId
              ][
                mapping.programOutcomeId
              ] =
                mapping.mappingLevel;
            }
          );

          return updated;
        });

        setSuccess(
          "Automated CO–PO mapping generated successfully. Please review the suggestions before saving."
        );
      } catch (err) {
        console.error(
          "Automatic CO-PO mapping failed:",
          err
        );

        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to generate automated CO-PO mapping."
        );
      } finally {
        setGenerating(false);
      }
    };

  /* ================================================================
     VALIDATE MATRIX
  ================================================================ */

  const validateMatrix = () => {
    if (
      courseOutcomes.length === 0
    ) {
      return "No Course Outcomes available.";
    }

    if (
      programOutcomes.length === 0
    ) {
      return "No Program Outcomes available.";
    }

    /*
     * Only mapped cells are required.
     *
     * Empty cells are allowed and will
     * be printed as "-".
     */

    return null;
  };

  /* ================================================================
     SAVE MATRIX
  ================================================================ */

  const handleSaveMatrix =
    async () => {
      const validationError =
        validateMatrix();

      if (validationError) {
        setError(
          validationError
        );

        return;
      }

      try {
        setSaving(true);
        setError("");
        setSuccess("");

        const payload = [];

        courseOutcomes.forEach(
          (co) => {
            programOutcomes.forEach(
              (po) => {
                const rawValue =
                  matrix?.[co.id]?.[
                    po.id
                  ];

                /*
                 * IMPORTANT:
                 * Empty mapping means NO MAPPING.
                 *
                 * Do not send "-" to backend.
                 * Simply skip the mapping.
                 */

                if (
                  rawValue === "" ||
                  rawValue === null ||
                  rawValue === undefined
                ) {
                  return;
                }

                const level =
                  Number(rawValue);

                if (
                  ![1, 2, 3].includes(
                    level
                  )
                ) {
                  throw new Error(
                    "Mapping level must be between 1 and 3."
                  );
                }

                payload.push({
                  courseOutcomeId:
                    co.id,

                  programOutcomeId:
                    po.id,

                  mappingLevel:
                    level,
                });
              }
            );
          }
        );

        await api.post(
          "/co-po-mappings/matrix",
          {
            matrix: payload,
          }
        );

        setSuccess(
          "CO–PO Matrix saved successfully."
        );

        setAiSuggestions([]);

        await loadCourseData(
          selectedCourseId
        );
      } catch (err) {
        console.error(
          "Failed to save CO-PO matrix:",
          err
        );

        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to save CO-PO matrix."
        );
      } finally {
        setSaving(false);
      }
    };

  /* ================================================================
     RESET MATRIX
  ================================================================ */

  const handleReset = () => {
    if (
      courseOutcomes.length === 0 ||
      programOutcomes.length === 0
    ) {
      return;
    }

    const emptyMatrix = {};

    courseOutcomes.forEach(
      (co) => {
        emptyMatrix[co.id] = {};

        programOutcomes.forEach(
          (po) => {
            emptyMatrix[co.id][
              po.id
            ] = "";
          }
        );
      }
    );

    setMatrix(emptyMatrix);
    setAiSuggestions([]);
    setError("");
    setSuccess("");
  };

  /* ================================================================
     LEVEL LABEL
  ================================================================ */

  const getLevelLabel = (
    level
  ) => {
    switch (
      Number(level)
    ) {
      case 1:
        return "Low";

      case 2:
        return "Medium";

      case 3:
        return "High";

      default:
        return "No Mapping";
    }
  };

  /* ================================================================
     SUGGESTION
  ================================================================ */

  const getSuggestion = (
    courseOutcomeId,
    programOutcomeId
  ) => {
    return aiSuggestions.find(
      (item) =>
        item.courseOutcomeId ===
          courseOutcomeId &&
        item.programOutcomeId ===
          programOutcomeId
    );
  };

  /* ================================================================
     PRINT MATRIX
  ================================================================ */

  const handlePrint = () => {
    if (
      !selectedCourseId ||
      !course ||
      courseOutcomes.length === 0 ||
      programOutcomes.length === 0
    ) {
      setError(
        "Please select a course with Course Outcomes and Program Outcomes before printing."
      );

      return;
    }

    setTimeout(() => {
      window.print();
    }, 100);
  };

  /* ================================================================
     PRINT DATE
  ================================================================ */

  const printDate =
    new Date().toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  /* ================================================================
     RENDER
  ================================================================ */

  return (
    <>
      {/* ============================================================
          PRINT STYLES
      ============================================================ */}

      <style>
        {`
          /* --------------------------------------------------------
             NORMAL SCREEN LAYOUT
          -------------------------------------------------------- */

          .copo-page {
            width: 100%;
            max-width: 100%;
            padding: 24px 28px;
          }

          .copo-matrix-wrapper {
            width: 100%;
            overflow-x: auto;
            overflow-y: auto;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            background: #ffffff;
          }

          .copo-matrix-table {
            width: max-content;
            min-width: 100%;
            margin-bottom: 0;
          }

          .copo-matrix-table th,
          .copo-matrix-table td {
            vertical-align: middle;
            padding: 12px;
          }

          .copo-po-header {
            min-width: 105px;
            width: 105px;
          }

          .copo-co-column {
            min-width: 330px;
            width: 330px;
            position: sticky;
            left: 0;
            z-index: 3;
            background: #ffffff;
          }

          .copo-header-row th {
            position: sticky;
            top: 0;
            z-index: 4;
            background: #f8f9fa;
          }

          .copo-header-row
          .copo-co-column {
            z-index: 5;
            background: #f8f9fa;
          }

          .copo-select {
            width: 82px;
            min-width: 82px;
            height: 44px;
            padding: 0 30px 0 10px;
            border: 1px solid #dbe3ef;
            border-radius: 10px;
            background-color: #ffffff;
            color: #172033;
            font-size: 16px;
            font-weight: 700;
            text-align: center;
            cursor: pointer;
            outline: none;
            transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
          }

          .copo-select:hover {
            border-color: #9db4d8;
            background-color: #f8fafc;
          }

          .copo-select:focus {
            border-color: #2563eb;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
          }

          .copo-select option {
            background: #ffffff;
            color: #172033;
            font-size: 15px;
            font-weight: 600;
          }

          .copo-cell {
            min-width: 105px;
            width: 105px;
            text-align: center;
          }

          .copo-no-mapping {
            font-size: 20px;
            font-weight: 600;
            color: #adb5bd;
          }

          .copo-course-info {
            border-left: 4px solid #0d6efd;
          }

          .copo-scale-item {
            padding: 8px 14px;
            border-radius: 8px;
            background: #f8f9fa;
            font-size: 14px;
          }

          /* --------------------------------------------------------
             PRINT-ONLY AREA
          -------------------------------------------------------- */

          .print-document {
            display: none;
          }

          /* --------------------------------------------------------
             PRINT
          -------------------------------------------------------- */

          @media print {

            @page {
              size: A4 landscape;
              margin: 10mm;
            }

            html,
            body {
              width: 100%;
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
            }

            body * {
              visibility: hidden !important;
            }

            .print-document,
            .print-document * {
              visibility: visible !important;
            }

            .print-document {
              display: block !important;
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              background: #ffffff;
              color: #000000;
            }

            .print-page {
              width: 100%;
              min-height: 185mm;
              page-break-after: always;
              break-after: page;
              background: #ffffff;
            }

            .print-page:last-child {
              page-break-after: auto;
              break-after: auto;
            }

            .print-header {
              text-align: center;
              margin-bottom: 12px;
            }

            .print-title {
              font-size: 22px;
              font-weight: 700;
              margin-bottom: 4px;
            }

            .print-subtitle {
              font-size: 13px;
              color: #444;
            }

            .print-course-info {
              display: grid;
              grid-template-columns:
                repeat(4, 1fr);
              border: 1px solid #444;
              margin-bottom: 14px;
            }

            .print-info-item {
              padding: 8px 10px;
              border-right: 1px solid #444;
            }

            .print-info-item:last-child {
              border-right: none;
            }

            .print-info-label {
              display: block;
              font-size: 9px;
              color: #555;
              text-transform: uppercase;
              font-weight: 600;
              margin-bottom: 2px;
            }

            .print-info-value {
              font-size: 12px;
              font-weight: 700;
            }

            .print-matrix-title {
              text-align: center;
              font-size: 15px;
              font-weight: 700;
              margin-bottom: 8px;
            }

            .print-matrix {
              width: 100%;
              border-collapse: collapse;
              table-layout: fixed;
            }

            .print-matrix th,
            .print-matrix td {
              border: 1px solid #333;
              padding: 6px 5px;
              text-align: center;
              vertical-align: middle;
              font-size: 10px;
            }

            .print-matrix th {
              background: #eeeeee !important;
              font-weight: 700;
            }

            .print-matrix .print-co-column {
              width: 25%;
              text-align: left;
            }

            .print-co-code {
              font-weight: 700;
              font-size: 11px;
              margin-bottom: 2px;
            }

            .print-co-description {
              font-size: 8.5px;
              line-height: 1.25;
            }

            .print-mapping-value {
              font-size: 12px;
              font-weight: 700;
            }

            .print-no-mapping {
              color: #777;
              font-size: 12px;
              font-weight: 600;
            }

            .print-scale {
              margin-top: 12px;
              display: flex;
              justify-content: center;
              gap: 25px;
              font-size: 10px;
            }

            .print-footer {
              margin-top: 12px;
              display: flex;
              justify-content: space-between;
              border-top: 1px solid #777;
              padding-top: 6px;
              font-size: 9px;
              color: #555;
            }

            .print-suggestion-title {
              text-align: center;
              font-size: 18px;
              font-weight: 700;
              margin-bottom: 15px;
            }

            .print-suggestion-table {
              width: 100%;
              border-collapse: collapse;
            }

            .print-suggestion-table th,
            .print-suggestion-table td {
              border: 1px solid #333;
              padding: 7px;
              font-size: 10px;
              vertical-align: top;
            }

            .print-suggestion-table th {
              background: #eeeeee !important;
              font-weight: 700;
            }

            .print-ai-note {
              border: 1px solid #555;
              padding: 8px;
              margin-bottom: 12px;
              font-size: 10px;
            }

            .screen-only {
              display: none !important;
            }
          }

          /* --------------------------------------------------------
             SMALL SCREEN
          -------------------------------------------------------- */

          @media (max-width: 992px) {

            .copo-page {
              padding: 16px;
            }

            .copo-co-column {
              min-width: 270px;
              width: 270px;
            }

            .copo-po-header,
            .copo-cell {
              min-width: 90px;
              width: 90px;
            }
          }
        `}
      </style>

      {/* ============================================================
          SCREEN CONTENT
      ============================================================ */}

      <div className="copo-page screen-only">

        {/* ==========================================================
            HEADER
        ========================================================== */}

        <div className="d-flex justify-content-between align-items-center mb-4">

          <div>
            <h2 className="fw-bold mb-1">
              CO–PO Mapping
            </h2>

            <p className="text-muted mb-0">
              Map Course Outcomes with Program Outcomes
            </p>
          </div>

        </div>

        {/* ==========================================================
            ALERTS
        ========================================================== */}

        {error && (
          <div
            className="alert alert-danger"
            role="alert"
          >
            <strong>Error:</strong>{" "}
            {error}
          </div>
        )}

        {success && (
          <div
            className="alert alert-success"
            role="alert"
          >
            {success}
          </div>
        )}

        {/* ==========================================================
            COURSE SELECTION
        ========================================================== */}

        <div className="card shadow-sm border-0 mb-4">

          <div className="card-body p-4">

            <div className="row align-items-end">

              <div className="col-lg-7">

                <label
                  htmlFor="course"
                  className="form-label fw-semibold"
                >
                  Select Course
                </label>

                <select
                  id="course"
                  className="form-select form-select-lg"
                  value={
                    selectedCourseId
                  }
                  onChange={
                    handleCourseChange
                  }
                  disabled={
                    loadingCourses ||
                    loadingMatrix ||
                    generating ||
                    saving
                  }
                >

                  <option value="">
                    {loadingCourses
                      ? "Loading courses..."
                      : "Select a course"}
                  </option>

                  {courses.map(
                    (item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.code
                          ? `${item.code} - ${item.name}`
                          : item.name}
                      </option>
                    )
                  )}

                </select>

              </div>

              <div className="col-lg-5 mt-3 mt-lg-0">

                <div className="d-flex gap-2 justify-content-lg-end flex-wrap">

                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    onClick={
                      handleGenerateAutomaticMapping
                    }
                    disabled={
                      !selectedCourseId ||
                      loadingMatrix ||
                      generating ||
                      saving
                    }
                  >

                    {generating ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        />

                        Generating...
                      </>
                    ) : (
                      "Generate Automatic Mapping"
                    )}

                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* ==========================================================
            COURSE INFORMATION
        ========================================================== */}

        {course && (
          <div className="card shadow-sm border-0 mb-4 copo-course-info">

            <div className="card-body p-4">

              <h5 className="fw-bold mb-3">
                Course Information
              </h5>

              <div className="row g-4">

                <div className="col-md-3">

                  <small className="text-muted d-block">
                    Course Code
                  </small>

                  <div className="fw-bold fs-5">
                    {course.code || "-"}
                  </div>

                </div>

                <div className="col-md-3">

                  <small className="text-muted d-block">
                    Course Name
                  </small>

                  <div className="fw-bold">
                    {course.name || "-"}
                  </div>

                </div>

                <div className="col-md-3">

                  <small className="text-muted d-block">
                    Program
                  </small>

                  <div className="fw-bold">
                    {course.program?.name ||
                      course.program?.code ||
                      "-"}
                  </div>

                </div>

                <div className="col-md-3">

                  <small className="text-muted d-block">
                    Semester
                  </small>

                  <div className="fw-bold">
                    {course.semester || "-"}
                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* ==========================================================
            MAPPING SCALE
        ========================================================== */}

        {selectedCourseId && (
          <div className="card shadow-sm border-0 mb-4">

            <div className="card-body p-4">

              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

                <div>
                  <h6 className="fw-bold mb-1">
                    CO–PO Mapping Scale
                  </h6>

                  <small className="text-muted">
                    Use "-" or leave the cell empty when there is no mapping.
                  </small>
                </div>

                <div className="d-flex gap-2 flex-wrap">

                  <span className="copo-scale-item">
                    <strong>1</strong>{" "}
                    = Low
                  </span>

                  <span className="copo-scale-item">
                    <strong>2</strong>{" "}
                    = Medium
                  </span>

                  <span className="copo-scale-item">
                    <strong>3</strong>{" "}
                    = High
                  </span>

                  <span className="copo-scale-item">
                    <strong>-</strong>{" "}
                    = No Mapping
                  </span>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* ==========================================================
            LOADING
        ========================================================== */}

        {loadingMatrix && (
          <div className="text-center py-5">

            <div
              className="spinner-border"
              role="status"
            />

            <div className="mt-2 text-muted">
              Loading CO–PO matrix...
            </div>

          </div>
        )}

        {/* ==========================================================
            MATRIX
        ========================================================== */}

        {!loadingMatrix &&
          selectedCourseId &&
          courseOutcomes.length > 0 &&
          programOutcomes.length > 0 && (

          <div className="card shadow-sm border-0 mb-4">

            <div className="card-header bg-white py-3 px-4">

              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

                <div>

                  <h5 className="fw-bold mb-1">
                    CO–PO Matrix
                  </h5>

                  <small className="text-muted">
                    Review and assign the correlation level for each CO–PO pair.
                  </small>

                </div>

                <div className="d-flex gap-2 flex-wrap">

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={
                      handleReset
                    }
                    disabled={
                      saving ||
                      generating
                    }
                  >
                    Reset
                  </button>

                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={
                      handleSaveMatrix
                    }
                    disabled={
                      saving ||
                      generating
                    }
                  >

                    {saving ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        />

                        Saving...
                      </>
                    ) : (
                      "Save Matrix"
                    )}

                  </button>

                  <button
                    type="button"
                    className="btn btn-dark"
                    onClick={
                      handlePrint
                    }
                    disabled={
                      saving ||
                      generating ||
                      loadingMatrix
                    }
                  >
                    Print Matrix
                  </button>

                </div>

              </div>

            </div>

            <div className="card-body p-0">

              <div
                className="copo-matrix-wrapper"
                style={{
                  maxHeight: "70vh",
                }}
              >

                <table className="table table-bordered table-hover align-middle copo-matrix-table">

                  <thead className="table-light copo-header-row">

                    <tr>

                      <th className="copo-co-column">
                        <div className="fw-bold">
                          Course Outcomes
                        </div>

                        <small className="text-muted">
                          CO description
                        </small>
                      </th>

                      {programOutcomes.map(
                        (po) => (
                          <th
                            key={po.id}
                            className="text-center copo-po-header"
                          >

                            <div className="fw-bold fs-5">
                              {po.code}
                            </div>

                            <small className="text-muted">
                              Program Outcome
                            </small>

                          </th>
                        )
                      )}

                    </tr>

                  </thead>

                  <tbody>

                    {courseOutcomes.map(
                      (co) => (
                        <tr
                          key={co.id}
                        >

                          <td className="copo-co-column">

                            <div className="fw-bold fs-5">
                              {co.code}
                            </div>

                            <div
                              className="text-muted small mt-2"
                              style={{
                                lineHeight:
                                  "1.45",
                              }}
                            >
                              {co.description ||
                                "No description available."}
                            </div>

                          </td>

                          {programOutcomes.map(
                            (po) => {

                              const value =
                                matrix?.[
                                  co.id
                                ]?.[
                                  po.id
                                ] ?? "";

                              const suggestion =
                                getSuggestion(
                                  co.id,
                                  po.id
                                );

                              return (
                                <td
                                  key={
                                    po.id
                                  }
                                  className="copo-cell"
                                >

                                  <select
                                    className="form-select form-select-sm text-center copo-select"
                                    value={
                                      value
                                    }
                                    onChange={(
                                      event
                                    ) =>
                                      handleMappingChange(
                                        co.id,
                                        po.id,
                                        event
                                          .target
                                          .value
                                      )
                                    }
                                    disabled={
                                      saving ||
                                      generating
                                    }
                                  >

                                    <option value="">
                                      -
                                    </option>

                                    <option value="1">
                                      1
                                    </option>

                                    <option value="2">
                                      2
                                    </option>

                                    <option value="3">
                                      3
                                    </option>

                                  </select>

                                  {!value && (
                                    <div className="copo-no-mapping mt-1">
                                      -
                                    </div>
                                  )}

                                  {suggestion && (
                                    <div className="mt-2">

                                      <small className="text-primary d-block fw-semibold">
                                        AI:{" "}
                                        {
                                          suggestion.mappingLevel
                                        }{" "}
                                        -{" "}
                                        {getLevelLabel(
                                          suggestion.mappingLevel
                                        )}
                                      </small>

                                    </div>
                                  )}

                                </td>
                              );
                            }
                          )}

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </div>
        )}

        {/* ==========================================================
            NO CO / PO
        ========================================================== */}

        {!loadingMatrix &&
          selectedCourseId &&
          !generating &&
          (
            courseOutcomes.length ===
              0 ||
            programOutcomes.length ===
              0
          ) && (

          <div className="alert alert-warning">

            {!courseOutcomes.length &&
            !programOutcomes.length
              ? "No Course Outcomes or Program Outcomes are available for this course."
              : !courseOutcomes.length
              ? "No Course Outcomes are available for this course."
              : "No Program Outcomes are available for this program."}

          </div>
        )}

        {/* ==========================================================
            AI SUGGESTIONS
        ========================================================== */}

        {aiSuggestions.length >
          0 && (

          <div className="card shadow-sm border-0 mb-4">

            <div className="card-header bg-white py-3 px-4">

              <h5 className="fw-bold mb-1">
                Automated CO–PO Suggestions
              </h5>

              <small className="text-muted">
                Gemini-generated suggestions. Review them before saving.
              </small>

            </div>

            <div className="card-body p-4">

              <div className="alert alert-info">

                <strong>
                  Faculty Review Required:
                </strong>{" "}
                These mappings were generated automatically.
                They have not been saved to the database.
                You can modify the mapping levels in the matrix above.

              </div>

              <div className="table-responsive">

                <table className="table table-bordered table-hover align-middle">

                  <thead className="table-light">

                    <tr>
                      <th>CO</th>
                      <th>PO</th>
                      <th>Level</th>
                      <th>Correlation</th>
                      <th>Academic Reason</th>
                    </tr>

                  </thead>

                  <tbody>

                    {aiSuggestions
                      .slice()
                      .sort(
                        (a, b) => {

                          const coA =
                            parseInt(
                              String(
                                a.courseOutcomeCode ||
                                  ""
                              ).replace(
                                /\D/g,
                                ""
                              ),
                              10
                            ) || 0;

                          const coB =
                            parseInt(
                              String(
                                b.courseOutcomeCode ||
                                  ""
                              ).replace(
                                /\D/g,
                                ""
                              ),
                              10
                            ) || 0;

                          if (
                            coA !== coB
                          ) {
                            return (
                              coA - coB
                            );
                          }

                          const poA =
                            parseInt(
                              String(
                                a.programOutcomeCode ||
                                  ""
                              ).replace(
                                /\D/g,
                                ""
                              ),
                              10
                            ) || 0;

                          const poB =
                            parseInt(
                              String(
                                b.programOutcomeCode ||
                                  ""
                              ).replace(
                                /\D/g,
                                ""
                              ),
                              10
                            ) || 0;

                          return (
                            poA - poB
                          );
                        }
                      )
                      .map(
                        (
                          suggestion,
                          index
                        ) => (
                          <tr
                            key={`${suggestion.courseOutcomeId}-${suggestion.programOutcomeId}-${index}`}
                          >

                            <td className="fw-semibold">
                              {
                                suggestion.courseOutcomeCode
                              }
                            </td>

                            <td className="fw-semibold">
                              {
                                suggestion.programOutcomeCode
                              }
                            </td>

                            <td className="text-center">

                              <span className="badge bg-primary">
                                {
                                  suggestion.mappingLevel
                                }
                              </span>

                            </td>

                            <td>
                              {
                                getLevelLabel(
                                  suggestion.mappingLevel
                                )
                              }
                            </td>

                            <td>
                              {
                                suggestion.reason ||
                                  "No reason provided."
                              }
                            </td>

                          </tr>
                        )
                      )}

                  </tbody>

                </table>

              </div>

            </div>

          </div>
        )}

        {/* ==========================================================
            NO COURSE
        ========================================================== */}

        {!selectedCourseId &&
          !loadingCourses && (

          <div className="card shadow-sm border-0">

            <div className="card-body text-center py-5">

              <h5 className="fw-bold">
                Select a Course
              </h5>

              <p className="text-muted mb-0">
                Select a course above to view and manage its CO–PO mapping matrix.
              </p>

            </div>

          </div>
        )}

      </div>

      {/* ============================================================
          PRINT DOCUMENT
      ============================================================ */}

      <div className="print-document">

        {/* ==========================================================
            PRINT PAGE 1
        ========================================================== */}

        <section className="print-page">

          <div className="print-header">

            <div className="print-title">
              COURSE OUTCOME – PROGRAM OUTCOME MAPPING
            </div>

            <div className="print-subtitle">
              Automated CO–PO–PSO Attainment Analysis System
            </div>

          </div>

          {/* COURSE INFORMATION */}

          <div className="print-course-info">

            <div className="print-info-item">

              <span className="print-info-label">
                Course Code
              </span>

              <span className="print-info-value">
                {course?.code || "-"}
              </span>

            </div>

            <div className="print-info-item">

              <span className="print-info-label">
                Course Name
              </span>

              <span className="print-info-value">
                {course?.name || "-"}
              </span>

            </div>

            <div className="print-info-item">

              <span className="print-info-label">
                Program
              </span>

              <span className="print-info-value">
                {course?.program?.name ||
                  course?.program?.code ||
                  "-"}
              </span>

            </div>

            <div className="print-info-item">

              <span className="print-info-label">
                Semester
              </span>

              <span className="print-info-value">
                {course?.semester || "-"}
              </span>

            </div>

          </div>

          <div className="print-matrix-title">
            CO–PO Correlation Matrix
          </div>

          {/* PRINT MATRIX */}

          <table className="print-matrix">

            <thead>

              <tr>

                <th className="print-co-column">
                  Course Outcomes
                </th>

                {programOutcomes.map(
                  (po) => (
                    <th
                      key={po.id}
                    >
                      {po.code}
                    </th>
                  )
                )}

              </tr>

            </thead>

            <tbody>

              {courseOutcomes.map(
                (co) => (
                  <tr
                    key={co.id}
                  >

                    <td className="print-co-column">

                      <div className="print-co-code">
                        {co.code}
                      </div>

                      <div className="print-co-description">
                        {co.description ||
                          "No description available."}
                      </div>

                    </td>

                    {programOutcomes.map(
                      (po) => {

                        const value =
                          matrix?.[
                            co.id
                          ]?.[
                            po.id
                          ];

                        return (
                          <td
                            key={
                              po.id
                            }
                          >

                            {[
                              1,
                              2,
                              3,
                            ].includes(
                              Number(
                                value
                              )
                            ) ? (
                              <span className="print-mapping-value">
                                {
                                  value
                                }
                              </span>
                            ) : (
                              <span className="print-no-mapping">
                                -
                              </span>
                            )}

                          </td>
                        );
                      }
                    )}

                  </tr>
                )
              )}

            </tbody>

          </table>

          {/* SCALE */}

          <div className="print-scale">

            <span>
              <strong>1</strong> = Low
            </span>

            <span>
              <strong>2</strong> = Medium
            </span>

            <span>
              <strong>3</strong> = High
            </span>

            <span>
              <strong>-</strong> = No Mapping
            </span>

          </div>

          <div className="print-footer">

            <span>
              Generated by Automated CO–PO–PSO Attainment Analysis System
            </span>

            <span>
              Date: {printDate}
            </span>

          </div>

        </section>

        {/* ==========================================================
            PRINT PAGE 2 - AI SUGGESTIONS
        ========================================================== */}

        {aiSuggestions.length > 0 && (

          <section className="print-page">

            <div className="print-header">

              <div className="print-title">
                AUTOMATED CO–PO MAPPING SUGGESTIONS
              </div>

              <div className="print-subtitle">
                {course?.code || "-"} -{" "}
                {course?.name || "-"}
              </div>

            </div>

            <div className="print-ai-note">

              <strong>
                Faculty Review Required:
              </strong>{" "}
              These mappings were generated using the
              automated CO–PO mapping feature and should
              be reviewed by the faculty before final approval.

            </div>

            <table className="print-suggestion-table">

              <thead>

                <tr>
                  <th>CO</th>
                  <th>PO</th>
                  <th>Level</th>
                  <th>Correlation</th>
                  <th>Academic Reason</th>
                </tr>

              </thead>

              <tbody>

                {aiSuggestions
                  .slice()
                  .sort(
                    (a, b) => {

                      const coA =
                        parseInt(
                          String(
                            a.courseOutcomeCode ||
                              ""
                          ).replace(
                            /\D/g,
                            ""
                          ),
                          10
                        ) || 0;

                      const coB =
                        parseInt(
                          String(
                            b.courseOutcomeCode ||
                              ""
                          ).replace(
                            /\D/g,
                            ""
                          ),
                          10
                        ) || 0;

                      if (
                        coA !== coB
                      ) {
                        return (
                          coA - coB
                        );
                      }

                      const poA =
                        parseInt(
                          String(
                            a.programOutcomeCode ||
                              ""
                          ).replace(
                            /\D/g,
                            ""
                          ),
                          10
                        ) || 0;

                      const poB =
                        parseInt(
                          String(
                            b.programOutcomeCode ||
                              ""
                          ).replace(
                            /\D/g,
                            ""
                          ),
                          10
                        ) || 0;

                      return (
                        poA - poB
                      );
                    }
                  )
                  .map(
                    (
                      suggestion,
                      index
                    ) => (
                      <tr
                        key={`${suggestion.courseOutcomeId}-${suggestion.programOutcomeId}-${index}`}
                      >

                        <td>
                          {
                            suggestion.courseOutcomeCode
                          }
                        </td>

                        <td>
                          {
                            suggestion.programOutcomeCode
                          }
                        </td>

                        <td>
                          {
                            suggestion.mappingLevel
                          }
                        </td>

                        <td>
                          {getLevelLabel(
                            suggestion.mappingLevel
                          )}
                        </td>

                        <td>
                          {
                            suggestion.reason ||
                              "No reason provided."
                          }
                        </td>

                      </tr>
                    )
                  )}

              </tbody>

            </table>

            <div className="print-footer">

              <span>
                Automated CO–PO Mapping
              </span>

              <span>
                Date: {printDate}
              </span>

            </div>

          </section>
        )}

      </div>
    </>
  );
}

export default COPOMatrix;