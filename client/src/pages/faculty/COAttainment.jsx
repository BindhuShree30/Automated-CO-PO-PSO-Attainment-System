import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import {
  Calculator,
  Printer,
  ExclamationTriangle,
  ArrowRepeat,
} from "react-bootstrap-icons";

import { useMyCourseOfferings } from "../../hooks/useCourseOfferings";
import {
  useCourseOfferingAttainments,
  useCalculateCOAttainment,
} from "../../hooks/useCOAttainment";

function COAttainment() {
  const [selectedCourseOfferingId, setSelectedCourseOfferingId] = useState("");

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

  // 3. Calculation Mutation
  const calculateMutation = useCalculateCOAttainment();

  const currentOffering = useMemo(() => {
    return courseOfferings.find((c) => c.id === selectedCourseOfferingId);
  }, [courseOfferings, selectedCourseOfferingId]);

  // Handle Calculate All Trigger
  const handleCalculateAll = async () => {
    if (!selectedCourseOfferingId) {
      toast.error("Please select a course offering.");
      return;
    }

    try {
      await calculateMutation.mutateAsync({
        courseOfferingId: selectedCourseOfferingId,
      });
      toast.success("CO Attainment calculated successfully!");
      refetchAttainments();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Failed to calculate CO attainment. Check if student marks are entered.";
      toast.error(msg);
    }
  };

  // Threshold badge styling
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

  // Indirect Feedback Level computation: >=70% -> 3, >=60% -> 2, >=50% -> 1, else 0
  const indirectFeedbackLevel = useMemo(() => {
    const pct = Number(studentFeedbackPct || 0);
    if (pct >= 70) return 3;
    if (pct >= 60) return 2;
    if (pct >= 50) return 1;
    return 0;
  }, [studentFeedbackPct]);

  // Consolidated table calculations matching 'CO Attai' sheet
  const consolidatedRows = useMemo(() => {
    return attainments.map((att) => {
      const coCode = att.courseOutcome?.code || "CO";
      const iaLevel = Number(att.attainmentLevel || 0);

      // CIE Attainment = (25/50)*IA + (25/50)*AQSM = 0.5 * IA + 0.5 * AQSM
      const cieAttainment = Number((0.5 * iaLevel + 0.5 * aqsmLevel).toFixed(2));

      // Direct Attainment = 0.5 * SEE + 0.5 * CIE
      const directAttainment = Number((0.5 * seeLevel + 0.5 * cieAttainment).toFixed(2));

      // Overall CO Course Attainment = 0.8 * Direct + 0.2 * Indirect
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
  }, [attainments, aqsmLevel, seeLevel, indirectFeedbackLevel]);

  // Average Overall CO Attainment
  const averageOverallAttainment = useMemo(() => {
    if (consolidatedRows.length === 0) return 0;
    const sum = consolidatedRows.reduce((acc, r) => acc + r.overallAttainment, 0);
    return Number((sum / consolidatedRows.length).toFixed(2));
  }, [consolidatedRows]);

  return (
    <div className="container-fluid p-4">
      {/* HEADER CONTROLS */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 d-print-none gap-2">
        <div>
          <h2 className="fw-bold mb-1">Course Outcome (CO) Attainment</h2>
          <p className="text-muted mb-0">
            Calculate, analyze, and review Direct, Indirect, and Overall CO Attainments.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-outline-dark d-inline-flex align-items-center gap-2 shadow-sm"
            onClick={() => window.print()}
            disabled={attainments.length === 0}
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
                Calculating...
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
        <div className="d-none d-print-block text-center border-bottom pb-3 mb-4">
          <h3 className="fw-bold mb-1">
            DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING
          </h3>
          <h5 className="fw-semibold text-secondary mb-2">
            Course Outcome Attainment Analysis Statement
          </h5>
          <div className="row small mt-3">
            <div className="col-4 text-start">
              <strong>Course:</strong> {currentOffering?.course?.code} -{" "}
              {currentOffering?.course?.name}
            </div>
            <div className="col-4 text-center">
              <strong>Section:</strong> {currentOffering?.section || "A"}
            </div>
            <div className="col-4 text-end">
              <strong>Scale:</strong> Level 3 (&ge;70%), Level 2 (&ge;60%), Level 1 (&ge;50%)
            </div>
          </div>
        </div>

        {attainmentsLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-2" role="status"></div>
            <p className="text-muted">Loading attainment records...</p>
          </div>
        ) : attainments.length === 0 ? (
          <div className="card border-0 shadow-sm text-center p-5">
            <div className="mb-3 text-muted">
              <ExclamationTriangle size={40} className="text-warning mb-2" />
              <h5>No Attainment Data Found</h5>
              <p className="text-muted">
                Marks may not have been evaluated yet. Click <strong>"Calculate Attainment"</strong> above to compute CO attainments.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* 1. INTERNAL TEST ATTAINMENT CARD */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white py-3">
                <h5 className="fw-bold mb-0">
                  1. Internal Assessment (IA) Test Attainment
                </h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0 text-center">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "90px" }}>CO Code</th>
                        <th className="text-start">Description</th>
                        <th>Total Obtained</th>
                        <th>Effective Max</th>
                        <th>Attainment %</th>
                        <th>Attainment Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attainments.map((att) => (
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

            {/* 2. CONSOLIDATED OVERALL CO ATTAINMENT MATRIX */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h5 className="fw-bold mb-0">
                  2. Overall Course Outcome Attainment Matrix
                </h5>
                <span className="badge bg-dark fs-6">
                  Average Overall Attainment: {averageOverallAttainment} / 3.0
                </span>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-bordered table-hover align-middle mb-0 text-center">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "90px" }}>CO</th>
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
              <div className="card-footer bg-white small text-muted py-3 d-print-none">
                <strong>Formulas Applied:</strong>
                <ul className="mb-0 mt-1 ps-3">
                  <li>
                    CIE Attainment = 0.5 * IA Test Level + 0.5 * AQSM Level
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
            <div className="d-none d-print-flex justify-content-between mt-5 pt-5 px-3">
              <div className="text-center">
                <div
                  className="border-top border-dark pt-1"
                  style={{ width: "200px" }}
                >
                  Course Instructor
                </div>
              </div>
              <div className="text-center">
                <div
                  className="border-top border-dark pt-1"
                  style={{ width: "200px" }}
                >
                  Module Coordinator
                </div>
              </div>
              <div className="text-center">
                <div
                  className="border-top border-dark pt-1"
                  style={{ width: "200px" }}
                >
                  Head of Department (HOD)
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* PRINT CSS */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm;
          }
          body {
            background: white !important;
            color: black !important;
          }
          aside, nav, .d-print-none {
            display: none !important;
          }
          main {
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            width: 100% !important;
          }
          .printable-area {
            box-shadow: none !important;
            border: none !important;
          }
          .table {
            font-size: 11px;
            border-color: #333 !important;
          }
          .table th, .table td {
            padding: 5px 8px !important;
            border-color: #666 !important;
          }
        }
      `}</style>
    </div>
  );
}

export default COAttainment;