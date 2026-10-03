import { useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Printer, ArrowLeft } from "react-bootstrap-icons";
import { Link } from "react-router-dom";

import { useMyCourseOfferings } from "../../hooks/useCourseOfferings";
import { useRegistrationsByCourseOffering } from "../../hooks/useCourseRegistrations";
import { useAssessmentQuestions } from "../../hooks/useStudentQuestionMarks";
import {
  getAssessmentsByCourseOffering,
  getMarksByAssessment,
} from "../../services/studentQuestionMarkService";

function MarksLedger() {
  const [selectedCourseOfferingId, setSelectedCourseOfferingId] = useState("");
  const [selectedAssessmentId, setSelectedAssessmentId] = useState("");
  const printRef = useRef(null);

  // 1. Course Offerings
  const { data: courseOfferings = [] } = useMyCourseOfferings();

  useEffectInit: {
    if (courseOfferings.length > 0 && !selectedCourseOfferingId) {
      setSelectedCourseOfferingId(courseOfferings[0].id);
    }
  }

  // 2. Assessments for Offering
  const { data: assessments = [] } = useQuery({
    queryKey: ["assessments", "courseOffering", selectedCourseOfferingId],
    enabled: Boolean(selectedCourseOfferingId),
    queryFn: async () => {
      const res = await getAssessmentsByCourseOffering(selectedCourseOfferingId);
      return res?.data?.data || res?.data || [];
    },
  });

  useEffectAssessment: {
    if (assessments.length > 0 && !selectedAssessmentId) {
      setSelectedAssessmentId(assessments[0].id);
    }
  }

  // 3. Students (sorted in natural USN order)
  const { data: registrations = [] } =
    useRegistrationsByCourseOffering(selectedCourseOfferingId);

  const sortedStudents = useMemo(() => {
    return [...registrations]
      .map((r) => r.student || {})
      .filter((s) => Boolean(s.id))
      .sort((a, b) => {
        const usnA = (a.usn || a.USN || "").trim();
        const usnB = (b.usn || b.USN || "").trim();
        return usnA.localeCompare(usnB, undefined, {
          numeric: true,
          sensitivity: "base",
        });
      });
  }, [registrations]);

  // 4. Questions Configured for Assessment
  const { data: questions = [] } =
    useAssessmentQuestions(selectedAssessmentId);

  const activeQuestions = useMemo(() => {
    return questions
      .filter((q) => q.status !== false)
      .sort((a, b) =>
        (a.questionNumber || "").localeCompare(b.questionNumber || "", undefined, {
          numeric: true,
        })
      );
  }, [questions]);

  // 5. All Recorded Marks for this Assessment
  const { data: rawMarks = [], isLoading: marksLoading } = useQuery({
    queryKey: ["allAssessmentMarks", selectedAssessmentId],
    enabled: Boolean(selectedAssessmentId),
    queryFn: async () => {
      const res = await getMarksByAssessment(selectedAssessmentId);
      return res?.data?.data || res?.data || [];
    },
  });

  // Fast map: studentId_questionId -> Mark record
  const marksLookup = useMemo(() => {
    const map = new Map();
    rawMarks.forEach((m) => {
      map.set(`${m.studentId}_${m.assessmentQuestionId}`, m);
    });
    return map;
  }, [rawMarks]);

  const currentOffering = courseOfferings.find(
    (c) => c.id === selectedCourseOfferingId
  );
  const currentAssessment = assessments.find(
    (a) => a.id === selectedAssessmentId
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container-fluid p-4">
      {/* SCREEN-ONLY CONTROLS */}
      <div className="d-print-none mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h2 className="fw-bold mb-1">Assessment Marks Ledger</h2>
            <p className="text-muted mb-0">
              Consolidated view of all student marks for verification and reporting.
            </p>
          </div>
          <div className="d-flex gap-2">
            <Link
              to="/faculty/marks-entry"
              className="btn btn-outline-secondary d-inline-flex align-items-center gap-2"
            >
              <ArrowLeft /> Back to Entry
            </Link>
            <button
              onClick={handlePrint}
              className="btn btn-primary d-inline-flex align-items-center gap-2"
              disabled={sortedStudents.length === 0}
            >
              <Printer /> Print Ledger
            </button>
          </div>
        </div>

        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Course Offering</label>
                <select
                  className="form-select"
                  value={selectedCourseOfferingId}
                  onChange={(e) => {
                    setSelectedCourseOfferingId(e.target.value);
                    setSelectedAssessmentId("");
                  }}
                >
                  {courseOfferings.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.course?.code} - {c.course?.name} ({c.section || "A"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Assessment</label>
                <select
                  className="form-select"
                  value={selectedAssessmentId}
                  onChange={(e) => setSelectedAssessmentId(e.target.value)}
                  disabled={!selectedCourseOfferingId || assessments.length === 0}
                >
                  {assessments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} (Max: {a.maxMarks})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PRINTABLE REPORT CONTAINER */}
      <div className="card border-0 shadow-sm printable-area" ref={printRef}>
        <div className="card-body p-4">
          {/* PRINT-ONLY HEADER */}
          <div className="d-none d-print-block text-center border-bottom pb-3 mb-4">
            <h3 className="fw-bold mb-1">DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING</h3>
            <h5 className="fw-semibold text-secondary mb-2">
              Continuous Internal Evaluation (CIE) Marks Statement
            </h5>
            <div className="row small mt-3">
              <div className="col-4 text-start">
                <strong>Course:</strong> {currentOffering?.course?.code} - {currentOffering?.course?.name}
              </div>
              <div className="col-4 text-center">
                <strong>Assessment:</strong> {currentAssessment?.name} (Max: {currentAssessment?.maxMarks})
              </div>
              <div className="col-4 text-end">
                <strong>Section:</strong> {currentOffering?.section || "A"}
              </div>
            </div>
          </div>

          {/* MARKS MATRIX TABLE */}
          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle mb-0 text-center">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "50px" }} rowSpan="3">#</th>
                  <th style={{ width: "130px" }} rowSpan="3" className="text-start">USN</th>
                  <th rowSpan="3" className="text-start">Student Name</th>
                  <th colSpan={activeQuestions.length}>Questions & Associated COs</th>
                  <th rowSpan="3" style={{ width: "80px" }}>Total</th>
                </tr>
                <tr>
                  {activeQuestions.map((q) => (
                    <th key={q.id} className="small py-1">
                      {q.courseOutcome?.code || "CO"}
                    </th>
                  ))}
                </tr>
                <tr>
                  {activeQuestions.map((q) => (
                    <th key={q.id} className="small text-muted py-1">
                      {q.questionNumber} <br />
                      <span className="badge bg-secondary-subtle text-dark border">
                        [{q.maxMarks}m]
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={activeQuestions.length + 4} className="py-4 text-muted">
                      No students registered for this course.
                    </td>
                  </tr>
                ) : (
                  sortedStudents.map((student, idx) => {
                    let totalObtained = 0;
                    let hasAttemptedAny = false;

                    return (
                      <tr key={student.id}>
                        <td>{idx + 1}</td>
                        <td className="fw-semibold text-start text-nowrap">
                          {student.usn}
                        </td>
                        <td className="text-start text-nowrap">
                          {student.firstName} {student.lastName}
                        </td>

                        {activeQuestions.map((q) => {
                          const mark = marksLookup.get(`${student.id}_${q.id}`);

                          if (!mark) {
                            return (
                              <td key={q.id} className="text-muted small">
                                —
                              </td>
                            );
                          }

                          if (mark.isAbsent) {
                            return (
                              <td key={q.id} className="text-danger fw-bold small">
                                AB
                              </td>
                            );
                          }

                          hasAttemptedAny = true;
                          totalObtained += Number(mark.marksObtained || 0);

                          return (
                            <td key={q.id} className="fw-semibold">
                              {mark.marksObtained}
                            </td>
                          );
                        })}

                        <td className="fw-bold bg-light">
                          {hasAttemptedAny ? totalObtained : "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* PRINT-ONLY SIGNATURE SECTION */}
          <div className="d-none d-print-flex justify-content-between mt-5 pt-5 px-3">
            <div className="text-center">
              <div className="border-top border-dark pt-1" style={{ width: "200px" }}>
                Course Instructor
              </div>
            </div>
            <div className="text-center">
              <div className="border-top border-dark pt-1" style={{ width: "200px" }}>
                Module Coordinator
              </div>
            </div>
            <div className="text-center">
              <div className="border-top border-dark pt-1" style={{ width: "200px" }}>
                Head of Department (HOD)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PRINT CSS STYLING */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
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
            padding: 4px 6px !important;
            border-color: #666 !important;
          }
        }
      `}</style>
    </div>
  );
}

export default MarksLedger;