/**
 * ------------------------------------------------------------------
 * CO–PSO Mapping
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * Module  : Faculty
 * ------------------------------------------------------------------
 *
 * Features:
 * - Faculty course selection
 * - CO × PSO mapping matrix
 * - AI-assisted CO–PSO mapping
 * - Faculty review and modification
 * - 1 = Low
 * - 2 = Medium
 * - 3 = High
 * - "-" = No Mapping
 * - Save Matrix
 * - Reset Matrix
 * - Print Matrix
 * - Natural CO / PSO ordering
 * ------------------------------------------------------------------
 */

import {
    useEffect,
    useMemo,
    useState,
  } from "react";
  
  import toast from "react-hot-toast";
  
  import {
    useCourses,
  } from "../../hooks/useCourses";
  
  import {
    useCoPsoMatrix,
    useAutomateCoPsoMapping,
    useSaveCoPsoMatrix,
  } from "../../hooks/useCoPsoMapping";
  
  import "./CoPsoMapping.css";
  
  /* ================================================================
     NATURAL SORT
  ================================================================ */
  
  const naturalSort = (a, b) => {
    const codeA = String(
      a?.code || ""
    ).trim();
  
    const codeB = String(
      b?.code || ""
    ).trim();
  
    const numberA = parseInt(
      codeA.match(/\d+/)?.[0] || "0",
      10
    );
  
    const numberB = parseInt(
      codeB.match(/\d+/)?.[0] || "0",
      10
    );
  
    if (numberA !== numberB) {
      return numberA - numberB;
    }
  
    return codeA.localeCompare(
      codeB,
      undefined,
      {
        numeric: true,
        sensitivity: "base",
      }
    );
  };
  
  /* ================================================================
     COMPONENT
  ================================================================ */
  
  function CoPsoMapping() {
    /* ================================================================
       COURSES
    ================================================================ */
  
    const {
      data: courses = [],
      isLoading: coursesLoading,
    } = useCourses();
  
    /* ================================================================
       SELECTED COURSE
    ================================================================ */
  
    const [
      selectedCourseId,
      setSelectedCourseId,
    ] = useState("");
  
    /* ================================================================
       MATRIX QUERY
    ================================================================ */
  
    const {
      data: matrixData,
      isLoading: matrixLoading,
      error: matrixError,
    } = useCoPsoMatrix(
      selectedCourseId
    );
  
    /* ================================================================
       AI AUTOMATION
    ================================================================ */
  
    const automateMapping =
      useAutomateCoPsoMapping();
  
    /* ================================================================
       SAVE MUTATION
    ================================================================ */
  
    const saveMatrix =
      useSaveCoPsoMatrix();
  
    /* ================================================================
       LOCAL MATRIX
    ================================================================ */
  
    const [
      matrix,
      setMatrix,
    ] = useState({});
  
    /* ================================================================
       AI GENERATED STATE
    ================================================================ */
  
    const [
      aiGenerated,
      setAiGenerated,
    ] = useState(false);
  
    /* ================================================================
       SET FIRST COURSE
    ================================================================ */
  
    useEffect(() => {
      if (
        !selectedCourseId &&
        courses.length > 0
      ) {
        setSelectedCourseId(
          courses[0].id
        );
      }
    }, [
      courses,
      selectedCourseId,
    ]);
  
    /* ================================================================
       SORT COURSE OUTCOMES
    ================================================================ */
  
    const courseOutcomes = useMemo(() => {
      return [
        ...(matrixData?.courseOutcomes || []),
      ].sort(
        (a, b) =>
          Number(a.coNumber) -
          Number(b.coNumber)
      );
    }, [
      matrixData?.courseOutcomes,
    ]);
  
    /* ================================================================
       SORT PSOs
    ================================================================ */
  
    const programSpecificOutcomes =
      useMemo(() => {
        return [
          ...(
            matrixData?.programSpecificOutcomes ||
            []
          ),
        ].sort(
          naturalSort
        );
      }, [
        matrixData?.programSpecificOutcomes,
      ]);
  
    /* ================================================================
       INITIALIZE MATRIX
    ================================================================ */
  
    useEffect(() => {
      if (!matrixData) {
        setMatrix({});
        setAiGenerated(false);
        return;
      }
  
      const initialMatrix = {};
  
      courseOutcomes.forEach(
        (courseOutcome) => {
          initialMatrix[
            courseOutcome.id
          ] = {};
  
          programSpecificOutcomes.forEach(
            (pso) => {
              initialMatrix[
                courseOutcome.id
              ][pso.id] = null;
            }
          );
        }
      );
  
      /* --------------------------------------------------------------
         APPLY EXISTING MAPPINGS
      -------------------------------------------------------------- */
  
      (
        matrixData.mappings || []
      ).forEach((mapping) => {
        if (
          initialMatrix[
            mapping.courseOutcomeId
          ] &&
          Object.prototype.hasOwnProperty.call(
            initialMatrix[
              mapping.courseOutcomeId
            ],
            mapping.programSpecificOutcomeId
          )
        ) {
          initialMatrix[
            mapping.courseOutcomeId
          ][
            mapping.programSpecificOutcomeId
          ] = Number(
            mapping.mappingLevel
          );
        }
      });
  
      setMatrix(
        initialMatrix
      );
  
      setAiGenerated(false);
    }, [
      matrixData,
      courseOutcomes,
      programSpecificOutcomes,
    ]);
  
    /* ================================================================
       CHANGE MAPPING
    ================================================================ */
  
    const handleMappingChange = (
      courseOutcomeId,
      programSpecificOutcomeId
    ) => {
      setAiGenerated(false);
  
      setMatrix(
        (previous) => {
          const currentValue =
            previous[
              courseOutcomeId
            ]?.[
              programSpecificOutcomeId
            ] ?? null;
  
          let nextValue;
  
          if (
            currentValue === null
          ) {
            nextValue = 1;
          } else if (
            currentValue === 1
          ) {
            nextValue = 2;
          } else if (
            currentValue === 2
          ) {
            nextValue = 3;
          } else {
            nextValue = null;
          }
  
          return {
            ...previous,
  
            [courseOutcomeId]: {
              ...previous[
                courseOutcomeId
              ],
  
              [programSpecificOutcomeId]:
                nextValue,
            },
          };
        }
      );
    };
  
    /* ================================================================
       CLEAR MAPPING
       Right click
    ================================================================ */
  
    const handleClearMapping = (
      event,
      courseOutcomeId,
      programSpecificOutcomeId
    ) => {
      event.preventDefault();
  
      setAiGenerated(false);
  
      setMatrix(
        (previous) => ({
          ...previous,
  
          [courseOutcomeId]: {
            ...previous[
              courseOutcomeId
            ],
  
            [programSpecificOutcomeId]:
              null,
          },
        })
      );
    };
  
    /* ================================================================
       AUTOMATE CO–PSO MAPPING
    ================================================================ */
  
    const handleAutomateMapping =
      async () => {
        if (!selectedCourseId) {
          toast.error(
            "Please select a course."
          );
  
          return;
        }
  
        try {
          const result =
            await automateMapping.mutateAsync(
              selectedCourseId
            );
  
          const generatedMappings =
            result?.mappings || [];
  
          const generatedMatrix = {};
  
          /* ------------------------------------------------------------
             Initialize all cells
          ------------------------------------------------------------ */
  
          courseOutcomes.forEach(
            (courseOutcome) => {
              generatedMatrix[
                courseOutcome.id
              ] = {};
  
              programSpecificOutcomes.forEach(
                (pso) => {
                  generatedMatrix[
                    courseOutcome.id
                  ][pso.id] = null;
                }
              );
            }
          );
  
          /* ------------------------------------------------------------
             Apply AI suggestions
          ------------------------------------------------------------ */
  
          generatedMappings.forEach(
            (mapping) => {
              if (
                generatedMatrix[
                  mapping.courseOutcomeId
                ] &&
                Object.prototype.hasOwnProperty.call(
                  generatedMatrix[
                    mapping.courseOutcomeId
                  ],
                  mapping.programSpecificOutcomeId
                )
              ) {
                generatedMatrix[
                  mapping.courseOutcomeId
                ][
                  mapping.programSpecificOutcomeId
                ] =
                  mapping.mappingLevel ===
                    null
                    ? null
                    : Number(
                        mapping.mappingLevel
                      );
              }
            }
          );
  
          setMatrix(
            generatedMatrix
          );
  
          setAiGenerated(true);
  
          toast.success(
            "AI CO–PSO mapping generated. Please review before saving."
          );
        } catch (error) {
          toast.error(
            error?.response?.data
              ?.message ||
              error?.message ||
              "Unable to generate AI CO–PSO mapping."
          );
        }
      };
  
    /* ================================================================
       SAVE
    ================================================================ */
  
    const handleSave = async () => {
      if (!selectedCourseId) {
        toast.error(
          "Please select a course."
        );
  
        return;
      }
  
      const payload = [];
  
      Object.entries(
        matrix
      ).forEach(
        ([
          courseOutcomeId,
          psoValues,
        ]) => {
          Object.entries(
            psoValues
          ).forEach(
            ([
              programSpecificOutcomeId,
              mappingLevel,
            ]) => {
              /*
               * "-" / null values are NOT
               * sent to backend.
               */
  
              if (
                mappingLevel !== null &&
                mappingLevel !== undefined
              ) {
                payload.push({
                  courseOutcomeId,
  
                  programSpecificOutcomeId,
  
                  mappingLevel:
                    Number(
                      mappingLevel
                    ),
                });
              }
            }
          );
        }
      );
  
      try {
        await saveMatrix.mutateAsync({
          courseId:
            selectedCourseId,
  
          matrix: payload,
        });
  
        setAiGenerated(false);
  
        toast.success(
          "CO–PSO Matrix saved successfully."
        );
      } catch (error) {
        toast.error(
          error?.response?.data
            ?.message ||
            "Unable to save CO–PSO Matrix."
        );
      }
    };
  
    /* ================================================================
       RESET
    ================================================================ */
  
    const handleReset = () => {
      if (!matrixData) {
        return;
      }
  
      const resetMatrix = {};
  
      courseOutcomes.forEach(
        (courseOutcome) => {
          resetMatrix[
            courseOutcome.id
          ] = {};
  
          programSpecificOutcomes.forEach(
            (pso) => {
              resetMatrix[
                courseOutcome.id
              ][pso.id] = null;
            }
          );
        }
      );
  
      (
        matrixData.mappings || []
      ).forEach((mapping) => {
        if (
          resetMatrix[
            mapping.courseOutcomeId
          ] &&
          Object.prototype.hasOwnProperty.call(
            resetMatrix[
              mapping.courseOutcomeId
            ],
            mapping.programSpecificOutcomeId
          )
        ) {
          resetMatrix[
            mapping.courseOutcomeId
          ][
            mapping.programSpecificOutcomeId
          ] = Number(
            mapping.mappingLevel
          );
        }
      });
  
      setMatrix(
        resetMatrix
      );
  
      setAiGenerated(false);
  
      toast.success(
        "Matrix reset."
      );
    };
  
    /* ================================================================
       PRINT
    ================================================================ */
  
    const handlePrint = () => {
      if (
        !selectedCourseId ||
        !matrixData
      ) {
        toast.error(
          "Please select a course first."
        );
  
        return;
      }
  
      window.print();
    };
  
    /* ================================================================
       SELECTED COURSE
    ================================================================ */
  
    const selectedCourse =
      courses.find(
        (course) =>
          course.id ===
          selectedCourseId
      );
  
    /* ================================================================
       LOADING COURSES
    ================================================================ */
  
    if (coursesLoading) {
      return (
        <div className="copsomap-page">
          <div className="copsomap-loading">
            Loading courses...
          </div>
        </div>
      );
    }
  
    /* ================================================================
       PAGE
    ================================================================ */
  
    return (
      <div className="copsomap-page">
  
        {/* ==========================================================
            HEADER
        ========================================================== */}
  
        <div className="copsomap-header">
  
          <div>
            <div className="copsomap-eyebrow">
              OUTCOME BASED EDUCATION
            </div>
  
            <h2 className="copsomap-title">
              CO–PSO Mapping
            </h2>
  
            <p className="copsomap-subtitle">
              Map Course Outcomes with
              Program Specific Outcomes
            </p>
          </div>
  
          <div className="copsomap-header-actions">
  
            {/* ======================================================
                AI AUTOMATION BUTTON
            ====================================================== */}
  
            <button
              type="button"
              className="btn btn-primary"
              onClick={
                handleAutomateMapping
              }
              disabled={
                !selectedCourseId ||
                matrixLoading ||
                automateMapping.isPending
              }
            >
              {automateMapping.isPending ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
  
                  Generating...
                </>
              ) : (
                <>
                  <i className="bi bi-stars me-2"></i>
  
                  Auto Generate
                </>
              )}
            </button>
  
            {/* ======================================================
                PRINT
            ====================================================== */}
  
            <button
              type="button"
              className="btn btn-outline-dark"
              onClick={
                handlePrint
              }
              disabled={
                !matrixData ||
                matrixLoading
              }
            >
              <i className="bi bi-printer me-2"></i>
  
              Print
            </button>
  
          </div>
  
        </div>
  
        {/* ==========================================================
            AI REVIEW NOTICE
        ========================================================== */}
  
        {aiGenerated && (
          <div className="alert alert-info mt-3">
            <i className="bi bi-stars me-2"></i>
  
            <strong>
              AI-generated mapping suggestions
            </strong>
  
            <div className="mt-1">
              Review and modify the suggested
              CO–PSO mappings before clicking
              <strong> Save Matrix</strong>.
            </div>
          </div>
        )}
  
        {/* ==========================================================
            COURSE SELECTOR
        ========================================================== */}
  
        <div className="copsomap-course-card">
  
          <div className="copsomap-course-label">
            Select Course
          </div>
  
          <select
            className="form-select copsomap-course-select"
            value={
              selectedCourseId
            }
            onChange={(event) => {
              setSelectedCourseId(
                event.target.value
              );
  
              setAiGenerated(false);
            }}
          >
  
            <option value="">
              Select Course
            </option>
  
            {courses.map(
              (course) => (
                <option
                  key={course.id}
                  value={course.id}
                >
                  {course.code} —{" "}
                  {course.name}
                </option>
              )
            )}
  
          </select>
  
        </div>
  
        {/* ==========================================================
            COURSE INFORMATION
        ========================================================== */}
  
        {selectedCourse && (
          <div className="copsomap-info-grid">
  
            <div className="copsomap-info-card">
              <span>
                Course Code
              </span>
  
              <strong>
                {
                  selectedCourse.code
                }
              </strong>
            </div>
  
            <div className="copsomap-info-card">
              <span>
                Course Name
              </span>
  
              <strong>
                {
                  selectedCourse.name
                }
              </strong>
            </div>
  
            <div className="copsomap-info-card">
              <span>
                Semester
              </span>
  
              <strong>
                Semester{" "}
                {
                  selectedCourse.semester
                }
              </strong>
            </div>
  
            <div className="copsomap-info-card">
              <span>
                Program
              </span>
  
              <strong>
                {
                  matrixData?.course
                    ?.program
                    ?.code ||
                  selectedCourse
                    ?.program
                    ?.code ||
                  "—"
                }
              </strong>
            </div>
  
          </div>
        )}
  
        {/* ==========================================================
            ERROR
        ========================================================== */}
  
        {matrixError && (
          <div className="alert alert-danger mt-4">
            {
              matrixError?.response
                ?.data?.message ||
              "Unable to load CO–PSO Matrix."
            }
          </div>
        )}
  
        {/* ==========================================================
            MATRIX LOADING
        ========================================================== */}
  
        {selectedCourseId &&
          matrixLoading && (
            <div className="copsomap-loading-card">
  
              <div
                className="spinner-border"
                role="status"
              ></div>
  
              <span>
                Loading CO–PSO Matrix...
              </span>
  
            </div>
          )}
  
        {/* ==========================================================
            MATRIX
        ========================================================== */}
  
        {!matrixLoading &&
          matrixData &&
          courseOutcomes.length > 0 &&
          programSpecificOutcomes.length >
            0 && (
  
            <div className="copsomap-matrix-card">
  
              {/* ====================================================
                  MATRIX HEADER
              ==================================================== */}
  
              <div className="copsomap-matrix-header">
  
                <div>
  
                  <h4>
                    CO × PSO Mapping Matrix
                  </h4>
  
                  <p>
                    Click a cell to cycle
                    through mapping levels.
                  </p>
  
                </div>
  
                {/* ==================================================
                    LEGEND
                ================================================== */}
  
                <div className="copsomap-legend">
  
                  <span className="legend-item">
  
                    <span className="legend-box level-1">
                      1
                    </span>
  
                    Low
  
                  </span>
  
                  <span className="legend-item">
  
                    <span className="legend-box level-2">
                      2
                    </span>
  
                    Medium
  
                  </span>
  
                  <span className="legend-item">
  
                    <span className="legend-box level-3">
                      3
                    </span>
  
                    High
  
                  </span>
  
                  <span className="legend-item">
  
                    <span className="legend-box level-none">
                      -
                    </span>
  
                    No Mapping
  
                  </span>
  
                </div>
  
              </div>
  
              {/* ====================================================
                  MATRIX TABLE
              ==================================================== */}
  
              <div className="copsomap-table-wrapper">
  
                <table className="copsomap-table">
  
                  <thead>
  
                    <tr>
  
                      <th className="co-column">
                        Course Outcomes
                      </th>
  
                      {programSpecificOutcomes.map(
                        (pso) => (
                          <th
                            key={pso.id}
                            className="pso-column"
                            title={
                              pso.description
                            }
                          >
                            {pso.code}
                          </th>
                        )
                      )}
  
                    </tr>
  
                  </thead>
  
                  <tbody>
  
                    {courseOutcomes.map(
                      (courseOutcome) => (
  
                        <tr
                          key={
                            courseOutcome.id
                          }
                        >
  
                          {/* =========================================
                              CO
                          ========================================= */}
  
                          <td className="co-cell">
  
                            <strong>
                              {
                                courseOutcome.code
                              }
                            </strong>
  
                            <span>
                              {
                                courseOutcome.description
                              }
                            </span>
  
                          </td>
  
                          {/* =========================================
                              PSO CELLS
                          ========================================= */}
  
                          {programSpecificOutcomes.map(
                            (pso) => {
  
                              const value =
                                matrix[
                                  courseOutcome.id
                                ]?.[
                                  pso.id
                                ] ?? null;
  
                              return (
  
                                <td
                                  key={
                                    pso.id
                                  }
                                  className="mapping-cell"
                                >
  
                                  <button
                                    type="button"
                                    className={`mapping-button ${
                                      value === 1
                                        ? "mapping-low"
                                        : value === 2
                                        ? "mapping-medium"
                                        : value === 3
                                        ? "mapping-high"
                                        : "mapping-none"
                                    }`}
                                    onClick={() =>
                                      handleMappingChange(
                                        courseOutcome.id,
                                        pso.id
                                      )
                                    }
                                    onContextMenu={(
                                      event
                                    ) =>
                                      handleClearMapping(
                                        event,
                                        courseOutcome.id,
                                        pso.id
                                      )
                                    }
                                    title={
                                      value
                                        ? `Mapping Level ${value}. Click to change.`
                                        : "No Mapping. Click to set Level 1."
                                    }
                                  >
                                    {value ??
                                      "-"}
                                  </button>
  
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
  
              {/* ====================================================
                  FOOTER
              ==================================================== */}
  
              <div className="copsomap-matrix-footer">
  
                <div className="copsomap-footer-note">
  
                  <i className="bi bi-info-circle me-2"></i>
  
                  Click a cell to cycle:
  
                  <strong>
                    {" "}
                    - → 1 → 2 → 3 → -
                  </strong>
  
                </div>
  
                <div className="copsomap-actions">
  
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={
                      handleReset
                    }
                    disabled={
                      saveMatrix.isPending ||
                      automateMapping.isPending
                    }
                  >
                    <i className="bi bi-arrow-counterclockwise me-2"></i>
  
                    Reset
  
                  </button>
  
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={
                      handleSave
                    }
                    disabled={
                      saveMatrix.isPending ||
                      automateMapping.isPending
                    }
                  >
  
                    {saveMatrix.isPending ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
  
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check2-circle me-2"></i>
  
                        Save Matrix
                      </>
                    )}
  
                  </button>
  
                </div>
  
              </div>
  
            </div>
          )}
  
        {/* ==========================================================
            NO COURSE
        ========================================================== */}
  
        {!selectedCourseId &&
          !coursesLoading && (
  
            <div className="copsomap-empty">
  
              <i className="bi bi-diagram-3"></i>
  
              <h4>
                Select a Course
              </h4>
  
              <p>
                Select a course above to
                view and edit its
                CO–PSO mapping matrix.
              </p>
  
            </div>
  
          )}
  
        {/* ==========================================================
            NO CO / PSO DATA
        ========================================================== */}
  
        {!matrixLoading &&
          matrixData &&
          (
            courseOutcomes.length === 0 ||
            programSpecificOutcomes.length === 0
          ) && (
  
            <div className="alert alert-warning mt-4">
  
              <strong>
                CO–PSO Mapping unavailable.
              </strong>
  
              <div className="mt-1">
                Make sure the selected course
                has Course Outcomes and its
                program has Program Specific
                Outcomes.
              </div>
  
            </div>
  
          )}
  
      </div>
    );
  }
  
  export default CoPsoMapping;