import { useState } from "react";
import { toast } from "react-toastify";
import {
  Cpu,
  Printer,
  CheckCircle,
  ExclamationCircle,
  XCircle,
  Tools,
  JournalText,
  Lightbulb,
  Building,
} from "react-bootstrap-icons";

import { useMyCourseOfferings } from "../../hooks/useCourseOfferings";
import {
  uploadSyllabus,
  extractSyllabusText,
  analyzeSyllabusAI,
  analyzeCurriculumGaps,
} from "../../services/curriculumSyllabusService";

export default function CurriculumGaps() {
  const { data: offerings = [] } = useMyCourseOfferings();
  const [selectedOfferingId, setSelectedOfferingId] = useState("");

  // Syllabus PDF
  const [syllabusFile, setSyllabusFile] = useState(null);

  // Industry benchmark options
  const [industryFile, setIndustryFile] = useState(null);
  const [industryText, setIndustryText] = useState("");

  // Execution states
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepMessage, setStepMessage] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);

  const activeOfferingId = selectedOfferingId || offerings[0]?.id;
  const currentOffering = offerings.find((o) => o.id === activeOfferingId);

  const handleStartPipeline = async (e) => {
    e.preventDefault();

    if (!activeOfferingId) {
      toast.error("Please select a Course Offering.");
      return;
    }
    if (!syllabusFile) {
      toast.error("Please select a Syllabus PDF file.");
      return;
    }

    setIsProcessing(true);
    setAnalysisResult(null);

    try {
      // Step 1: Upload Syllabus PDF
      setCurrentStep(1);
      setStepMessage("Uploading syllabus PDF...");
      const uploadedData = await uploadSyllabus(activeOfferingId, syllabusFile);
      const syllabusId = uploadedData?.id || uploadedData?.syllabus?.id;

      if (!syllabusId) {
        throw new Error("Failed to receive syllabus ID from server.");
      }

      // Step 2: Extract text from PDF
      setCurrentStep(2);
      setStepMessage("Extracting text from uploaded PDF...");
      await extractSyllabusText(syllabusId);

      // Step 3: Analyze competencies using Gemini AI
      setCurrentStep(3);
      setStepMessage("Extracting course competencies via Gemini AI...");
      await analyzeSyllabusAI(syllabusId);

      // Step 4: Compare syllabus vs industry and generate gap report
      setCurrentStep(4);
      setStepMessage("Benchmarking against industry requirements & evaluating gaps...");
      const fullReport = await analyzeCurriculumGaps(syllabusId, industryFile, industryText);

      setAnalysisResult(fullReport);
      toast.success("Curriculum Gap Analysis generated successfully!");
    } catch (err) {
      console.error("Pipeline failure:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Pipeline failed. Check server logs.";
      toast.error(msg);
    } finally {
      setIsProcessing(false);
      setCurrentStep(0);
      setStepMessage("");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "FULLY_COVERED":
        return <span className="badge bg-success"><CheckCircle className="me-1" /> Fully Covered</span>;
      case "PARTIALLY_COVERED":
        return <span className="badge bg-warning text-dark"><ExclamationCircle className="me-1" /> Partially Covered</span>;
      case "NOT_COVERED":
        return <span className="badge bg-danger"><XCircle className="me-1" /> Not Covered</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case "HIGH":
        return <span className="badge bg-danger">HIGH</span>;
      case "MEDIUM":
        return <span className="badge bg-warning text-dark">MEDIUM</span>;
      case "LOW":
        return <span className="badge bg-info text-dark">LOW</span>;
      default:
        return <span className="badge bg-secondary">{sev}</span>;
    }
  };

  const gapData = analysisResult?.gapAnalysis || {};
  const summary = gapData.summary;
  const curriculumGaps = gapData.curriculumGaps || [];
  const solutions = gapData.solutions || [];
  const recommendations = gapData.curriculumRecommendations || [];
  const syllabusData = analysisResult?.syllabusAnalysis || {};

  return (
    <div className="container-fluid p-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4 d-print-none">
        <div>
          <h2 className="fw-bold mb-1">Curriculum Gap & Industry Benchmarking</h2>
          <p className="text-muted mb-0">
            Compare university syllabus directly with modern industry requirements (NBA Criterion 2).
          </p>
        </div>
        {analysisResult && (
          <button
            type="button"
            className="btn btn-outline-dark d-flex align-items-center gap-2 shadow-sm"
            onClick={() => window.print()}
          >
            <Printer /> Print Statement
          </button>
        )}
      </div>

      {/* INPUT FORM CARD */}
      <div className="card border-0 shadow-sm mb-4 d-print-none">
        <div className="card-body">
          <form onSubmit={handleStartPipeline}>
            {/* COURSE SELECTOR */}
            <div className="mb-4">
              <label className="form-label fw-semibold">Target Course Offering</label>
              <select
                className="form-select"
                value={activeOfferingId}
                onChange={(e) => setSelectedOfferingId(e.target.value)}
                disabled={isProcessing}
              >
                {offerings.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.course?.code} - {c.course?.name} ({c.section || "A"})
                  </option>
                ))}
              </select>
            </div>

            {/* TWO-COLUMN UPLOAD: SYLLABUS VS INDUSTRY */}
            <div className="row g-4">
              {/* LEFT: SYLLABUS PDF */}
              <div className="col-md-6">
                <div className="p-3 border rounded bg-light h-100">
                  <h6 className="fw-bold text-primary d-flex align-items-center gap-2 mb-3">
                    <JournalText /> 1. University Syllabus (Required)
                  </h6>
                  <label className="form-label small fw-semibold">Upload Syllabus PDF</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="application/pdf"
                    onChange={(e) => setSyllabusFile(e.target.files?.[0] || null)}
                    disabled={isProcessing}
                  />
                  <small className="text-muted d-block mt-2">
                    {syllabusFile ? `Selected: ${syllabusFile.name}` : "Upload official scheme/course syllabus document."}
                  </small>
                </div>
              </div>

              {/* RIGHT: INDUSTRY REQUIREMENTS */}
              <div className="col-md-6">
                <div className="p-3 border rounded bg-light h-100">
                  <h6 className="fw-bold text-success d-flex align-items-center gap-2 mb-3">
                    <Building /> 2. Industry Benchmark / Standards (Optional)
                  </h6>
                  <label className="form-label small fw-semibold">Upload Industry Standard PDF (Optional)</label>
                  <input
                    type="file"
                    className="form-control mb-2"
                    accept="application/pdf"
                    onChange={(e) => setIndustryFile(e.target.files?.[0] || null)}
                    disabled={isProcessing}
                  />
                  <div className="text-center small text-muted my-1">— OR —</div>
                  <label className="form-label small fw-semibold">Paste Required Industry Skills / Job Description</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="e.g., Docker, Kubernetes, CI/CD, MLOps, AWS SageMaker, Kafka..."
                    value={industryText}
                    onChange={(e) => setIndustryText(e.target.value)}
                    disabled={isProcessing}
                  />
                  <small className="text-muted d-block mt-1">
                    *If left blank, AI automatically discovers current industry standards for this domain.
                  </small>
                </div>
              </div>
            </div>

            {/* ACTION BUTTON & PROGRESS */}
            <div className="mt-4 text-end">
              <button
                type="submit"
                className="btn btn-primary px-4 py-2 d-inline-flex align-items-center gap-2 shadow-sm"
                disabled={isProcessing || !syllabusFile}
              >
                {isProcessing ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" />
                    Executing Pipeline...
                  </>
                ) : (
                  <>
                    <Cpu /> Run Gap Analysis
                  </>
                )}
              </button>
            </div>
          </form>

          {isProcessing && (
            <div className="mt-4 p-3 bg-white rounded border">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <strong className="text-primary small">
                  Step {currentStep} of 4: {stepMessage}
                </strong>
                <span className="small text-muted">{currentStep * 25}%</span>
              </div>
              <div className="progress" style={{ height: "6px" }}>
                <div
                  className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                  role="progressbar"
                  style={{ width: `${currentStep * 25}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RESULTS DISPLAY */}
      {analysisResult && (
        <div className="printable-area">
          <div className="d-none d-print-block text-center border-bottom pb-2 mb-3">
            <h4 className="fw-bold mb-1">DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING</h4>
            <h6 className="fw-semibold text-secondary mb-2">Curriculum Gap Analysis & Industry Mapping (Criterion 2.1)</h6>
            <div className="d-flex justify-content-between small px-2 mt-2">
              <div><strong>Course:</strong> {currentOffering?.course?.code} - {currentOffering?.course?.name}</div>
              <div><strong>Section:</strong> {currentOffering?.section || "A"}</div>
              <div><strong>Academic Year:</strong> 2025-26</div>
            </div>
          </div>

          {/* 1. METRICS CARDS */}
          {summary && (
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <div className="card border-0 shadow-sm bg-light text-center p-3">
                  <h6 className="text-muted mb-1">Skills Evaluated</h6>
                  <h3 className="fw-bold mb-0">{summary.totalIndustrySkillsEvaluated}</h3>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm bg-success-subtle text-center p-3">
                  <h6 className="text-success mb-1">Fully Covered</h6>
                  <h3 className="fw-bold text-success mb-0">{summary.fullyCovered}</h3>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm bg-warning-subtle text-center p-3">
                  <h6 className="text-dark mb-1">Partially Covered</h6>
                  <h3 className="fw-bold text-dark mb-0">{summary.partiallyCovered}</h3>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm bg-danger-subtle text-center p-3">
                  <h6 className="text-danger mb-1">Not Covered (Gaps)</h6>
                  <h3 className="fw-bold text-danger mb-0">{summary.notCovered}</h3>
                </div>
              </div>
            </div>
          )}

          {/* 2. EXTRACTED SYLLABUS MODULES */}
          {syllabusData.modules && syllabusData.modules.length > 0 && (
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h5 className="fw-bold mb-0 text-primary d-flex align-items-center gap-2">
                  <JournalText /> Extracted Syllabus Modules & Topics
                </h5>
                <span className="badge bg-primary-subtle text-primary border">
                  {syllabusData.modules.length} Modules Extracted
                </span>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {syllabusData.modules.map((m, idx) => (
                    <div key={idx} className="col-md-6">
                      <div className="border rounded p-3 h-100 bg-light">
                        <h6 className="fw-bold text-dark mb-2">{m.module || `Module ${idx + 1}`}</h6>
                        <ul className="mb-0 small ps-3">
                          {m.topics?.map((topic, tIdx) => (
                            <li key={tIdx} className="text-muted">{topic}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. IDENTIFIED GAPS TABLE */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white py-3">
              <h5 className="fw-bold mb-0">1. Identified Curriculum Gaps & Industry Coverage</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle mb-0">
                  <thead className="table-light text-center">
                    <tr>
                      <th style={{ width: "40px" }}>#</th>
                      <th style={{ width: "160px" }}>Industry Skill</th>
                      <th style={{ width: "130px" }}>Status</th>
                      <th style={{ width: "90px" }}>Severity</th>
                      <th>Industry Expectation</th>
                      <th>Gap Description</th>
                      <th>Syllabus Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {curriculumGaps.map((gap, idx) => (
                      <tr key={idx}>
                        <td className="text-center">{idx + 1}</td>
                        <td className="fw-semibold">{gap.industrySkill}</td>
                        <td className="text-center">{getStatusBadge(gap.status)}</td>
                        <td className="text-center">{getSeverityBadge(gap.severity)}</td>
                        <td className="small">{gap.industryExpectation}</td>
                        <td className="small text-danger">{gap.gapDescription}</td>
                        <td className="small text-muted">
                          {Array.isArray(gap.syllabusCoverage) && gap.syllabusCoverage.length > 0
                            ? gap.syllabusCoverage.join(", ")
                            : "None"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 4. ACTION PLANS & PROPOSED SOLUTIONS */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white py-3">
              <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <Tools /> 2. Action Plans & Remedial Solutions (NBA Criterion 2.1)
              </h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle mb-0">
                  <thead className="table-light text-center">
                    <tr>
                      <th style={{ width: "40px" }}>#</th>
                      <th style={{ width: "160px" }}>Skill</th>
                      <th>Recommended Solution</th>
                      <th>Suggested Technologies / Tools</th>
                      <th>Practical Activities / Projects</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solutions.map((sol, idx) => (
                      <tr key={idx}>
                        <td className="text-center">{idx + 1}</td>
                        <td className="fw-semibold">
                          {sol.industrySkill}
                          <div className="mt-1">{getSeverityBadge(sol.severity)}</div>
                        </td>
                        <td className="small">{sol.solution}</td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {sol.suggestedTechnologies?.map((tech, tIdx) => (
                              <span key={tIdx} className="badge bg-secondary-subtle text-dark border">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="small">
                          {sol.suggestedPracticalActivities?.length > 0 && (
                            <div>
                              <strong>Activities:</strong> {sol.suggestedPracticalActivities.join("; ")}
                            </div>
                          )}
                          {sol.suggestedProjects?.length > 0 && (
                            <div className="mt-1 text-primary">
                              <strong>Projects:</strong> {sol.suggestedProjects.join("; ")}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 5. RECOMMENDATIONS */}
          {recommendations.length > 0 && (
            <div className="card border-0 shadow-sm mb-4 border-start border-primary border-4">
              <div className="card-body">
                <h5 className="fw-bold text-dark d-flex align-items-center gap-2 mb-3">
                  <Lightbulb className="text-warning" /> Overall Curriculum Recommendations
                </h5>
                <ul className="mb-0">
                  {recommendations.map((rec, idx) => (
                    <li key={idx} className="mb-2 text-secondary">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* PRINT SIGNATURE FOOTER */}
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
      )}

      {/* PRINT STYLES */}
      <style>{`
        @media print {
          @page { size: landscape; margin: 10mm; }
          body * { visibility: hidden; }
          .printable-area, .printable-area * { visibility: visible !important; }
          .printable-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0 auto; }
          table { font-size: 11px !important; }
        }
      `}</style>
    </div>
  );
}