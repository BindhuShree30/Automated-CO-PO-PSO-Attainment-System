import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import {
  Calculator,
  Printer,
  ExclamationTriangle,
  ArrowRepeat,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "react-bootstrap-icons";
import { useQuery } from "@tanstack/react-query";

import { useMyCourseOfferings } from "../../hooks/useCourseOfferings";
import {
  useCourseOfferingAttainments,
  useCalculateCOAttainment,
} from "../../hooks/useCOAttainment";
import { useRegistrationsByCourseOffering } from "../../hooks/useCourseRegistrations";
import {
  getAssessmentsByCourseOffering,
  getMarksByAssessment,
} from "../../services/studentQuestionMarkService";

function COAttainment() {
  const [selectedCourseOfferingId, setSelectedCourseOfferingId] = useState("");
  const [showBest2Table, setShowBest2Table] = useState(false);

  // Default configuration derived from institutional template (sheet 'CO Attai')
  const [aqsmLevel, setAqsmLevel] = useState(3);
  const [seeLevel, setSeeLevel] = useState(3);
  const [studentFeedbackPct, setStudentFeedbackPct] = useState(90);

  // 1. Fetch Course Offerings assigned to logged-in faculty
  const { data: courseOfferings = [] } = useMyCourseOfferings();

  useEffect(() => {
    if (courseOfferings.length > 0 && !selectedCourseOfferingId) {
      setSelectedCourseOfferingId(courseOfferings[0].id);
    }
  }, [courseOfferings.length, selectedCourseOfferingId]);

  // 2. Fetch Calculated Attainments for selected Course Offering
  const {
    data: attainments = [],
    isLoading: attainmentsLoading,
    refetch: refetchAttainments,
  } = useCourseOfferingAttainments(selectedCourseOfferingId);

  // Natural alphanumeric sort: Ensures strict sequence CO1 -> CO2 -> CO3 -> CO4 -> CO5
  const sortedAttainments = useMemo(() => {
    if (!attainments || attainments.length === 0) return [];
    return [...attainments].sort((a, b) => {
      const codeA = String(a.courseOutcome?.code || "").trim();
      const codeB = String(b.courseOutcome?.code || "").trim();
      return codeA.localeCompare(codeB, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });
  }, [attainments]);

  // 3. Fetch Registered Students
  const { data: registrations = [] } =
    useRegistrationsByCourseOffering(selectedCourseOfferingId);

  // 4. Fetch Assessments to identify IA-1, IA-2, IA-3
  const { data: assessments = [] } = useQuery({
    queryKey: ["assessments", "courseOffering", selectedCourseOfferingId],
    enabled: Boolean(selectedCourseOfferingId),
    queryFn: async () => {
      const res = await getAssessmentsByCourseOffering(selectedCourseOfferingId);
      return res?.data?.data || res?.data || [];
    },
  });

  const iaAssessments = useMemo(() => {
    return assessments.filter((a) => {
      const t = String(a.type || "").toUpperCase();
      return (
        ["CIE", "IA", "INTERNAL"].includes(t) ||
        a.calculationMethod === "BEST_OF_2"
      );
    });
  }, [assessments]);

  // 5. Fetch Marks for all IAs to build the Best 2 of 3 student table
  const { data: iaMarksMap = {}, refetch: refetchIAMarks } = useQuery({
    queryKey: ["iaMarksPerAssessment", iaAssessments.map((a) => a.id).join(",")],
    enabled: iaAssessments.length > 0,
    queryFn: async () => {
      const map = {};
      await Promise.all(
        iaAssessments.map(async (ia) => {
          try {
            const res = await getMarksByAssessment(ia.id);
            const marksList = res?.data?.data || res?.data || res || [];
            map[ia.id] = Array.isArray(marksList) ? marksList : [];
          } catch {
            map[ia.id] = [];
          }
        })
      );
      return map;
    },
  });

  // Calculate Student-Wise Best 2 of 3 IA Scores
  const studentIABreakdown = useMemo(() => {
    if (registrations.length === 0 || iaAssessments.length === 0) return [];

    return registrations.map((r, idx) => {
      const s = r.student || {};
      const sId = String(s.id || r.studentId || r.student_id || r.id || "").trim();
      const studentUsn = String(s.usn || s.USN || "").trim().toUpperCase();

      const iaScores = iaAssessments.map((ia) => {
        const marksList = iaMarksMap[ia.id] || [];

        const studentMarks = marksList.filter((m) => {
          const mStudentId = String(
            m.studentId || m.student_id || m.student?.id || ""
          ).trim();
          const mUsn = String(
            m.student?.usn || m.student?.USN || m.usn || ""
          ).trim().toUpperCase();

          return (sId && mStudentId === sId) || (studentUsn && mUsn === studentUsn);
        });

        if (studentMarks.length === 0) {
          return { iaId: ia.id, name: ia.name, score: 0, isAbsent: true };
        }

        const isAbs = studentMarks.every((m) => Boolean(m.isAbsent ?? m.is_absent));
        const total = studentMarks.reduce((acc, m) => {
          const markAbsent = Boolean(m.isAbsent ?? m.is_absent);
          const rawMark = markAbsent
            ? 0
            : Number((m.marksObtained ?? m.marks_obtained) || 0);
          return acc + rawMark;
        }, 0);

        return {
          iaId: ia.id,
          name: ia.name,
          score: total,
          isAbsent: isAbs,
        };
      });

      const sorted = [...iaScores].sort((a, b) => b.score - a.score);
      const top1 = sorted[0]?.score || 0;
      const top2 = sorted[1]?.score || 0;
      const best2Average = Number(((top1 + top2) / 2).toFixed(2));
      const droppedIA = iaScores.length >= 3 ? sorted[sorted.length - 1]?.name : null;

      return {
        slNo: idx + 1,
        studentId: sId || idx,
        usn: studentUsn || "-",
        name: `${s.firstName || ""} ${s.lastName || ""}`.trim() || s.name || "-",
        iaScores,
        best2Average,
        droppedIA,
      };
    });
  }, [registrations, iaAssessments, iaMarksMap]);

  // 6. Calculation Mutation
  const calculateMutation = useCalculateCOAttainment();

  const currentOffering = useMemo(() => {
    return courseOfferings.find((c) => c.id === selectedCourseOfferingId);
  }, [courseOfferings, selectedCourseOfferingId]);

  const handleCalculateAll = async () => {
    if (!selectedCourseOfferingId) {
      toast.error("Please select a course offering.");
      return;
    }

    try {
      await calculateMutation.mutateAsync({
        courseOfferingId: selectedCourseOfferingId,
      });
      toast.success("CO Attainment calculated successfully with Best 2 of 3!");
      await refetchAttainments();
      await refetchIAMarks();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Failed to calculate CO attainment. Check if student marks are entered.";
      toast.error(msg);
    }
  };

  const getLevelBadge = (level) => {
    switch (Number(level)) {
      case 3:
        return <span className="badge bg-success fs-6">{"Level 3 (>=70%)"}</span>;
      case 2:
        return <span className="badge bg-primary fs-6">{"Level 2 (>=60%)"}</span>;
      case 1:
        return <span className="badge bg-warning text-dark fs-6">{"Level 1 (>=50%)"}</span>;
      default:
        return <span className="badge bg-danger fs-6">{"Level 0 (<50%)"}</span>;
    }
  };

  const indirectFeedbackLevel = useMemo(() => {
    const pct = Number(studentFeedbackPct || 0);
    if (pct >= 70) return 3;
    if (pct >= 60) return 2;
    if (pct >= 50) return 1;
    return 0;
  }, [studentFeedbackPct]);

  // Built directly from sortedAttainments so Matrix 2 inherits CO1 -> CO2 -> CO3 -> CO4 -> CO5 order
  const consolidatedRows = useMemo(() => {
    return sortedAttainments.map((att) => {
      const coCode = att.courseOutcome?.code || "CO";
      const iaLevel = Number(att.attainmentLevel || 0);

      const cieAttainment = Number((0.5 * iaLevel + 0.5 * aqsmLevel).toFixed(2));
      const directAttainment = Number((0.5 * seeLevel + 0.5 * cieAttainment).toFixed(2));
      const overallAttainment = Number(
        (0.8 * directAttainment + 0.2 * indirectFeedbackLevel).toFixed(2)
      );

      return {
        id: att.id,
        coCode,
        description: att.courseOutcome?.description || "-",
        attainmentPercentage: att.attainmentPercentage,
        iaLevel,
        aqsmLevel,
        cieAttainment,
        seeLevel,
        directAttainment,
        indirectFeedbackLevel,
        overallAttainment,
      };
    });
  }, [sortedAttainments, aqsmLevel, seeLevel, indirectFeedbackLevel]);

  const averageOverallAttainment = useMemo(() => {
    if (consolidatedRows.length === 0) return 0;
    const sum = consolidatedRows.reduce((acc, r) => acc + r.overallAttainment, 0);
    return Number((sum / consolidatedRows.length).toFixed(2));
  }, [consolidatedRows]);

  return (
    <div className="container-fluid p-4 co-attainment-container">
      {/* HEADER CONTROLS */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 d-print-none gap-2">
        <div>
          <h2 className="fw-bold mb-1">Course Outcome (CO) Attainment</h2>
          <p className="text-muted mb-0">
            Automated Direct, Indirect, and Best 2 of 3 IA Evaluation Analysis.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-outline-dark d-inline-flex align-items-center gap-2 shadow-sm"
            onClick={() => window.print()}
            disabled={sortedAttainments.length === 0}
          >
            <Printer /> Print Statement
          </button>

          <button
            type="button"
            className="btn btn-primary d-inline-flex align-items-center gap-2 shadow-sm px-3"
            onClick={handleCalculateAll}
            disabled={calculateMutation.isPending || !selectedCourseOfferingId}
          >
            {calculateMutation.isPending ? (
              <>
                <ArrowRepeat className="spinner-border spinner-border-sm" />
                Calculating Best 2 of 3...
              </>
            ) : (
              <>
                <Calculator /> Calculate Attainment
              </>
            )}
          </button>
        </div>
      </div>

      {/* FILTER & CONFIGURATION CARD */}
      <div className="card border-0 shadow-sm mb-4 d-print-none">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-5">
              <label className="form-label fw-semibold">Course Offering</label>
              <select
                className="form-select"
                value={selectedCourseOfferingId}
                onChange={(e) => setSelectedCourseOfferingId(e.target.value)}
              >
                {courseOfferings.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.course?.code} - {c.course?.name} ({c.section || "A"})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label fw-semibold">AQSM Attainment</label>
              <select
                className="form-select"
                value={aqsmLevel}
                onChange={(e) => setAqsmLevel(Number(e.target.value))}
              >
                <option value={3}>Level 3 (Default)</option>
                <option value={2}>Level 2</option>
                <option value={1}>Level 1</option>
                <option value={0}>Level 0</option>
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label fw-semibold">SEE Attainment</label>
              <select
                className="form-select"
                value={seeLevel}
                onChange={(e) => setSeeLevel(Number(e.target.value))}
              >
                <option value={3}>Level 3 (Default)</option>
                <option value={2}>Level 2</option>
                <option value={1}>Level 1</option>
                <option value={0}>Level 0</option>
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">
                Student Feedback % (Indirect)
              </label>
              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  max="100"
                  value={studentFeedbackPct}
                  onChange={(e) => setStudentFeedbackPct(Number(e.target.value))}
                />
                <span className="input-group-text">
                  Level {indirectFeedbackLevel}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PRINTABLE CONTAINER */}
      <div className="printable-area">
        {/* PRINT-ONLY HEADER */}
        <div className="d-none d-print-block text-center border-bottom pb-2 mb-3">
          <h4 className="fw-bold mb-1">
            DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING
          </h4>
          <h6 className="fw-semibold text-secondary mb-2">
            Course Outcome Attainment Analysis Statement
          </h6>
          <div className="d-flex justify-content-between small px-2 mt-2">
            <div>
              <strong>Course:</strong> {currentOffering?.course?.code} -{" "}
              {currentOffering?.course?.name}
            </div>
            <div>
              <strong>Section:</strong> {currentOffering?.section || "A"}
            </div>
            <div>
              <strong>Rule:</strong> Best 2 of 3 IA Evaluation (VTU/NBA)
            </div>
          </div>
        </div>

        {attainmentsLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-2" role="status"></div>
            <p className="text-muted">Loading attainment records...</p>
          </div>
        ) : sortedAttainments.length === 0 ? (
          <div className="card border-0 shadow-sm text-center p-5">
            <div className="mb-3 text-muted">
              <ExclamationTriangle size={40} className="text-warning mb-2" />
              <h5>No Attainment Data Found</h5>
              <p className="text-muted">
                Click <strong>"Calculate Attainment"</strong> above to compute CO attainments using Best 2 of 3 IA logic.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* 1. INTERNAL TEST ATTAINMENT CARD */}
            <div className="card border-0 shadow-sm mb-4 attainment-card">
              <div className="card-header bg-white py-2 d-flex justify-content-between align-items-center">
                <h6 className="fw-bold mb-0">
                  1. Internal Assessment (IA) Test Attainment
                </h6>
                {iaAssessments.length >= 3 && (
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle d-print-none">
                    <CheckCircle className="me-1" /> Best 2 of 3 IA Active
                  </span>
                )}
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-bordered table-hover align-middle mb-0 text-center">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "80px" }}>CO Code</th>
                        <th className="text-start">Description</th>
                        <th style={{ width: "120px" }}>Total Obtained</th>
                        <th style={{ width: "120px" }}>Effective Max</th>
                        <th style={{ width: "120px" }}>Attainment %</th>
                        <th style={{ width: "140px" }}>Attainment Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedAttainments.map((att) => (
                        <tr key={att.id}>
                          <td className="fw-bold text-primary">
                            {att.courseOutcome?.code}
                          </td>
                          <td className="text-start small text-muted">
                            {att.courseOutcome?.description || "-"}
                          </td>
                          <td className="fw-semibold">
                            {att.totalMarksObtained}
                          </td>
                          <td className="fw-semibold text-muted">
                            {att.totalMaxMarks}
                          </td>
                          <td className="fw-bold fs-6">
                            {att.attainmentPercentage}%
                          </td>
                          <td>{getLevelBadge(att.attainmentLevel)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 2. COLLAPSIBLE: BEST 2 OF 3 IA STUDENT LEDGER */}
            {iaAssessments.length >= 3 && (
              <div className="card border-0 shadow-sm mb-4 d-print-none">
                <div
                  className="card-header bg-white py-3 d-flex justify-content-between align-items-center cursor-pointer"
                  onClick={() => setShowBest2Table(!showBest2Table)}
                >
                  <h6 className="fw-bold mb-0 text-secondary">
                    View Student-Wise Best 2 of 3 IA Calculation Ledger ({studentIABreakdown.length} Students)
                  </h6>
                  <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1">
                    {showBest2Table ? <ChevronUp /> : <ChevronDown />}
                    {showBest2Table ? "Hide Ledger" : "Show Ledger"}
                  </button>
                </div>
                {showBest2Table && (
                  <div className="card-body p-0">
                    <div className="table-responsive" style={{ maxHeight: "350px" }}>
                      <table className="table table-sm table-hover align-middle mb-0 text-center">
                        <thead className="table-light sticky-top">
                          <tr>
                            <th>#</th>
                            <th className="text-start">USN</th>
                            <th className="text-start">Name</th>
                            {iaAssessments.map((ia) => (
                              <th key={ia.id}>{ia.name}</th>
                            ))}
                            <th className="table-success">Best 2 Average</th>
                            <th className="text-muted small">Dropped Test</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentIABreakdown.map((row) => (
                            <tr key={row.studentId}>
                              <td>{row.slNo}</td>
                              <td className="text-start fw-semibold">{row.usn}</td>
                              <td className="text-start">{row.name}</td>
                              {row.iaScores.map((scoreObj) => (
                                <td key={scoreObj.iaId}>
                                  {scoreObj.isAbsent ? (
                                    <span className="text-danger small fw-bold">AB</span>
                                  ) : (
                                    scoreObj.score
                                  )}
                                </td>
                              ))}
                              <td className="fw-bold table-success text-success">
                                {row.best2Average}
                              </td>
                              <td className="text-muted small">
                                {row.droppedIA ? (
                                  <span className="badge bg-secondary-subtle text-dark border">
                                    {row.droppedIA}
                                  </span>
                                ) : (
                                  "-"
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. CONSOLIDATED OVERALL CO ATTAINMENT MATRIX */}
            <div className="card border-0 shadow-sm mb-4 attainment-card">
              <div className="card-header bg-white py-2 d-flex justify-content-between align-items-center">
                <h6 className="fw-bold mb-0">
                  2. Overall Course Outcome Attainment Matrix
                </h6>
                <span className="badge bg-dark fs-6 d-print-inline">
                  Average Overall Attainment: {averageOverallAttainment} / 3.0
                </span>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-bordered table-hover align-middle mb-0 text-center">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "80px" }}>CO</th>
                        <th>IA Test Attainment</th>
                        <th>AQSM Attainment</th>
                        <th>CIE Attainment (50%)</th>
                        <th>SEE Attainment (50%)</th>
                        <th>Direct CO Attainment</th>
                        <th>Indirect CO (Feedback)</th>
                        <th className="table-primary">Overall CO Attainment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consolidatedRows.map((row) => (
                        <tr key={row.id}>
                          <td className="fw-bold text-primary">{row.coCode}</td>
                          <td className="fw-semibold">{row.iaLevel}</td>
                          <td className="fw-semibold">{row.aqsmLevel}</td>
                          <td className="fw-semibold text-secondary">
                            {row.cieAttainment}
                          </td>
                          <td className="fw-semibold">{row.seeLevel}</td>
                          <td className="fw-semibold text-secondary">
                            {row.directAttainment}
                          </td>
                          <td className="fw-semibold">
                            {row.indirectFeedbackLevel}
                          </td>
                          <td className="fw-bold table-primary fs-6">
                            {row.overallAttainment}
                          </td>
                        </tr>
                      ))}
                      <tr className="table-light fw-bold">
                        <td colSpan="7" className="text-end">
                          Average Course Outcome Attainment:
                        </td>
                        <td className="table-primary fs-6 text-primary">
                          {averageOverallAttainment}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card-footer bg-white small text-muted py-2 d-print-none">
                <strong>Formulas Applied:</strong>
                <ul className="mb-0 mt-1 ps-3">
                  <li>
                    CIE Attainment = 0.5 * IA Test Level (Best 2 of 3) + 0.5 * AQSM Level
                  </li>
                  <li>
                    Direct CO Attainment = 0.5 * SEE Level + 0.5 * CIE Attainment
                  </li>
                  <li>
                    Overall CO Attainment = 0.8 * Direct CO + 0.2 * Indirect CO (Feedback)
                  </li>
                </ul>
              </div>
            </div>

            {/* PRINT-ONLY SIGNATURE SECTION */}
            <div className="d-none d-print-flex justify-content-between mt-4 pt-4 px-3 page-break-inside-avoid">
              <div className="text-center">
                <div
                  className="border-top border-dark pt-1"
                  style={{ width: "180px" }}
                >
                  Course Instructor
                </div>
              </div>
              <div className="text-center">
                <div
                  className="border-top border-dark pt-1"
                  style={{ width: "180px" }}
                >
                  Module Coordinator
                </div>
              </div>
              <div className="text-center">
                <div
                  className="border-top border-dark pt-1"
                  style={{ width: "180px" }}
                >
                  Head of Department (HOD)
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* FULL PRINT ISOLATION & CENTERING CSS */}
      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 10mm 12mm;
          }

          /* 1. Hide everything else in the body */
          body * {
            visibility: hidden;
          }

          /* 2. Show only printable area and pull it to center */
          .printable-area,
          .printable-area * {
            visibility: visible !important;
          }

          .printable-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 0 !important;
            display: block !important;
          }

          /* 3. Neutralize layout wrappers */
          html, body {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            color: #000 !important;
            overflow: visible !important;
          }

          /* 4. Table sizing and borders */
          .table-responsive {
            overflow: visible !important;
            width: 100% !important;
            display: block !important;
          }

          table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 11px !important;
            margin: 0 auto !important;
          }

          th, td {
            border: 1px solid #333 !important;
            padding: 5px 6px !important;
            text-align: center !important;
            color: #000 !important;
          }

          th {
            background-color: #f1f3f5 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .attainment-card {
            border: 1px solid #444 !important;
            margin-bottom: 14px !important;
            page-break-inside: avoid;
          }

          .badge {
            border: 1px solid #333 !important;
            color: #000 !important;
            background: transparent !important;
            font-size: 9px !important;
            padding: 2px 5px !important;
            white-space: nowrap !important;
          }

          .page-break-inside-avoid {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}

export default COAttainment;