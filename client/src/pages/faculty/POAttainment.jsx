import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axios";
import { getCourseAttainmentMatrix } from "../../services/poAttainmentService";
import { Printer } from "react-bootstrap-icons";

const POAttainment = () => {
  const [courses, setCourses] = useState([]);
  const [selectedOffering, setSelectedOffering] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axiosInstance.get("/course-offerings/my-courses");
        if (response.data?.success) {
          setCourses(response.data.data || []);
        }
      } catch (err) {
        console.error("Failed to load courses:", err);
      }
    };
    fetchCourses();
  }, []);

  const handleCourseChange = async (e) => {
    const offeringId = e.target.value;
    setSelectedOffering(offeringId);
    setData(null);
    setError(null);

    if (!offeringId) return;

    try {
      setLoading(true);
      const res = await getCourseAttainmentMatrix(offeringId);
      if (res?.success) {
        setData(res.data);
      } else {
        setError("Unable to compute matrix for this course.");
      }
    } catch (err) {
      console.error("Error loading matrix:", err);
      setError("Failed to fetch matrix data. Please verify mappings and attainment records.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const poNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const psoNumbers = [1, 2, 3];
  const selectedCourseObj = courses.find((c) => c.id === selectedOffering);

  return (
    <div className="py-4 px-3 px-lg-4 report-page-container" style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* PRINT-SPECIFIC CSS RULES */}
      <style>
        {`
          @page {
            size: landscape;
            margin: 8mm 10mm;
          }
          @media print {
            html, body, #root, .app, .dashboard-layout, main, .content {
              height: auto !important;
              min-height: auto !important;
              overflow: visible !important;
              position: static !important;
              background: #fff !important;
            }
            aside, header, nav, .d-print-none, .sidebar {
              display: none !important;
            }
            .report-page-container {
              padding: 0 !important;
              margin: 0 !important;
              background: #fff !important;
              min-height: auto !important;
            }
            .print-table-row {
              display: flex !important;
              flex-direction: row !important;
              gap: 15px !important;
              page-break-inside: avoid !important;
            }
            .print-left-table {
              flex: 0 0 78% !important;
              max-width: 78% !important;
            }
            .print-right-table {
              flex: 0 0 20% !important;
              max-width: 20% !important;
            }
            .table {
              page-break-inside: avoid !important;
              font-size: 0.85rem !important;
            }
            .table th, .table td {
              padding: 4px 6px !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .card {
              border: 1px solid #94a3b8 !important;
              box-shadow: none !important;
              page-break-inside: avoid !important;
            }
            .card-header, .badge {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}
      </style>

      {/* Main Container */}
      <div className="mx-auto" style={{ maxWidth: "1550px" }}>
        
        {/* HEADER & CONTROLS (Hidden during printing) */}
        <div className="card shadow-sm border mb-4 d-print-none" style={{ borderRadius: "10px", borderColor: "#e2e8f0" }}>
          <div className="card-body p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <h4 className="fw-bold text-dark mb-1 text-uppercase" style={{ letterSpacing: "0.5px" }}>
                CO–PO & PSO Direct Attainment Matrix
              </h4>
              <p className="text-muted small mb-0">
                Autonomous VTU / NBA Criterion 3 Articulation & Assessment Analysis
              </p>
            </div>

            <div className="d-flex align-items-center gap-3 flex-wrap">
              <div style={{ minWidth: "320px" }}>
                <select
                  value={selectedOffering}
                  onChange={handleCourseChange}
                  className="form-select form-select-md fw-semibold shadow-none"
                  style={{ borderColor: "#cbd5e1", cursor: "pointer" }}
                >
                  <option value="">-- Select Course Offering --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.course?.code ? `${c.course.code} - ` : ""}
                      {c.course?.name || c.name || "Course Offering"}
                    </option>
                  ))}
                </select>
              </div>

              {data && (
                <button
                  onClick={handlePrint}
                  className="btn btn-primary d-flex align-items-center gap-2 fw-semibold px-4 shadow-sm"
                  style={{ borderRadius: "8px", backgroundColor: "#2563eb", borderColor: "#2563eb" }}
                >
                  <Printer size={18} />
                  <span>Print Sheet</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger shadow-sm border-0 mb-4 fw-semibold d-print-none">
            {error}
          </div>
        )}

        {loading && (
          <div className="card shadow-sm border p-5 text-center text-muted fw-bold mb-4" style={{ borderRadius: "10px", borderColor: "#e2e8f0" }}>
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <div>Computing CO-PO-PSO Attainment Matrices...</div>
          </div>
        )}

        {data && !loading && (
          <div className="d-flex flex-column gap-4">
            
            {/* Print Header */}
            <div className="text-center pb-2 mb-2 border-bottom border-2 border-dark d-none d-print-block">
              <h4 className="fw-bold mb-1 text-uppercase">Department of Computer Science and Engineering</h4>
              <h5 className="fw-bold mb-1 text-uppercase text-secondary">
                {selectedCourseObj?.course?.name || "Machine Learning"} ({selectedCourseObj?.course?.code || "BCS602"})
              </h5>
              <p className="small mb-0 text-muted">NBA Criterion 3: CO-PO & PSO Attainment Sheet</p>
            </div>

            {/* TOP ROW: TABLE 1 (MAPPING) & TABLE 2 (OVERALL CO) */}
            <div className="row g-4 justify-content-center align-items-stretch print-table-row">
              
              {/* TABLE 1: MAPPING MATRIX */}
              <div className="col-12 col-xl-9 print-left-table">
                <div className="card shadow-sm border h-100" style={{ borderRadius: "10px", borderColor: "#e2e8f0", overflow: "hidden" }}>
                  <div className="card-header bg-white py-2 px-3 border-bottom d-flex justify-content-between align-items-center">
                    <span className="fw-bold text-dark text-uppercase small" style={{ letterSpacing: "0.5px" }}>
                      1. Mapping of COs with POs and PSOs
                    </span>
                    <span className="badge bg-light text-secondary border px-2 py-1 fw-semibold">
                      Scale: 1 to 3
                    </span>
                  </div>

                  <div className="card-body p-2 table-responsive">
                    <table className="table table-bordered align-middle text-center mb-0 w-100" style={{ borderColor: "#cbd5e1" }}>
                      <thead>
                        <tr style={{ backgroundColor: "#f8fafc" }}>
                          <th rowSpan="2" className="fw-bold text-dark align-middle py-2" style={{ width: "65px", backgroundColor: "#f1f5f9" }}>
                            CO
                          </th>
                          <th colSpan="12" className="fw-bold text-dark py-1" style={{ backgroundColor: "#f1f5f9" }}>
                            Program Outcomes (POs)
                          </th>
                          <th colSpan="3" className="fw-bold text-dark py-1" style={{ backgroundColor: "#fef3c7" }}>
                            PSOs
                          </th>
                        </tr>
                        <tr style={{ backgroundColor: "#f8fafc" }}>
                          {poNumbers.map((n) => (
                            <th key={`mh-po-${n}`} className="fw-semibold text-secondary py-1" style={{ width: "45px" }}>
                              {n}
                            </th>
                          ))}
                          {psoNumbers.map((n) => (
                            <th key={`mh-pso-${n}`} className="fw-semibold py-1" style={{ width: "45px", backgroundColor: "#fffbeb", color: "#92400e" }}>
                              {n}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.courseOutcomes?.map((co) => (
                          <tr key={`map-co-${co.id}`}>
                            <td className="fw-bold text-primary py-1.5" style={{ backgroundColor: "#f8fafc" }}>
                              {co.code}
                            </td>
                            {poNumbers.map((n) => {
                              const val = data.mappingMatrix?.po?.[`PO${n}`]?.[co.id];
                              return (
                                <td key={`map-po-${n}-${co.id}`} className="fw-semibold text-dark py-1.5">
                                  {val ?? ""}
                                </td>
                              );
                            })}
                            {psoNumbers.map((n) => {
                              const val = data.mappingMatrix?.pso?.[`PSO${n}`]?.[co.id];
                              return (
                                <td key={`map-pso-${n}-${co.id}`} className="fw-semibold py-1.5" style={{ backgroundColor: "#fffbeb", color: "#92400e" }}>
                                  {val ?? ""}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                        {/* AVERAGE ROW */}
                        <tr style={{ backgroundColor: "#f1f5f9" }}>
                          <td className="fw-bold text-dark py-1.5">Average</td>
                          {poNumbers.map((n) => (
                            <td key={`map-avg-po-${n}`} className="fw-bold text-dark py-1.5">
                              {data.mappingMatrix?.poAvg?.[`PO${n}`] ?? "--"}
                            </td>
                          ))}
                          {psoNumbers.map((n) => (
                            <td key={`map-avg-pso-${n}`} className="fw-bold py-1.5" style={{ backgroundColor: "#fef3c7", color: "#92400e" }}>
                              {data.mappingMatrix?.psoAvg?.[`PSO${n}`] ?? "--"}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* TABLE 2: OVERALL CO TABLE */}
              <div className="col-12 col-xl-3 print-right-table">
                <div className="card shadow-sm border h-100" style={{ borderRadius: "10px", borderColor: "#e2e8f0", overflow: "hidden" }}>
                  <div className="card-header bg-white py-2 px-3 border-bottom d-flex justify-content-between align-items-center">
                    <span className="fw-bold text-dark text-uppercase small" style={{ letterSpacing: "0.5px" }}>
                      Overall CO
                    </span>
                    <span className="badge rounded-pill bg-dark text-white px-2 py-0.5 small">
                      Max: 3.0
                    </span>
                  </div>

                  <div className="card-body p-2 d-flex flex-column justify-content-between">
                    <table className="table table-bordered align-middle text-center mb-0 w-100" style={{ borderColor: "#cbd5e1" }}>
                      <thead>
                        <tr style={{ backgroundColor: "#f1f5f9" }}>
                          <th className="fw-bold text-dark py-1" style={{ width: "40%" }}>
                            CO
                          </th>
                          <th className="fw-bold text-primary py-1" style={{ backgroundColor: "#eff6ff" }}>
                            Overall Score
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.courseOutcomes?.map((co) => (
                          <tr key={`overall-${co.id}`}>
                            <td className="fw-bold text-primary py-1.5" style={{ backgroundColor: "#f8fafc" }}>
                              {co.code}
                            </td>
                            <td className="fw-bold text-dark py-1.5" style={{ backgroundColor: "#f0f9ff" }}>
                              {co.score}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="mt-2 p-2 rounded d-flex justify-content-between align-items-center d-print-none" style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe" }}>
                      <span className="small fw-bold text-secondary text-uppercase" style={{ fontSize: "0.75rem" }}>Average:</span>
                      <span className="fw-bold text-primary small">
                        {(
                          data.courseOutcomes?.reduce((acc, c) => acc + (Number(c.score) || 0), 0) /
                          (data.courseOutcomes?.length || 1)
                        ).toFixed(2)} / 3.0
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* TABLE 3: FINAL CO / PO ATTAINMENT MATRIX (FULL-WIDTH) */}
            <div className="card shadow-sm border" style={{ borderRadius: "10px", borderColor: "#e2e8f0", overflow: "hidden" }}>
              <div className="card-header bg-white py-2 px-3 border-bottom d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
                <span className="fw-bold text-dark text-uppercase small" style={{ letterSpacing: "0.5px" }}>
                  2. CO / PO & PSO ATTAINMENT MATRIX
                </span>
                <span className="badge rounded-pill bg-light text-secondary border px-2.5 py-1 fw-semibold">
                  Formula: (CO Attainment × Correlation Mapping) / 3
                </span>
              </div>

              <div className="card-body p-2 table-responsive">
                <table className="table table-bordered align-middle text-center mb-0 w-100" style={{ borderColor: "#cbd5e1" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8fafc" }}>
                      <th rowSpan="2" className="fw-bold text-dark align-middle py-2" style={{ width: "65px", backgroundColor: "#f1f5f9" }}>
                        CO
                      </th>
                      <th colSpan="12" className="fw-bold text-dark py-1" style={{ backgroundColor: "#f1f5f9" }}>
                        Program Outcomes (POs)
                      </th>
                      <th colSpan="3" className="fw-bold text-dark py-1" style={{ backgroundColor: "#fef3c7" }}>
                        PSOs
                      </th>
                    </tr>
                    <tr style={{ backgroundColor: "#f8fafc" }}>
                      {poNumbers.map((n) => (
                        <th key={`ath-po-${n}`} className="fw-semibold text-secondary py-1" style={{ width: "45px" }}>
                          {n}
                        </th>
                      ))}
                      {psoNumbers.map((n) => (
                        <th key={`ath-pso-${n}`} className="fw-semibold py-1" style={{ width: "45px", backgroundColor: "#fffbeb", color: "#92400e" }}>
                          {n}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.courseOutcomes?.map((co) => (
                      <tr key={`att-co-${co.id}`}>
                        <td className="fw-bold text-primary py-1.5" style={{ backgroundColor: "#f8fafc" }}>
                          {co.code}
                        </td>
                        {poNumbers.map((n) => {
                          const val = data.attainmentMatrix?.po?.[`PO${n}`]?.[co.id];
                          return (
                            <td key={`att-po-${n}-${co.id}`} className="fw-semibold text-dark py-1.5">
                              {val !== null && val !== undefined ? val : "--"}
                            </td>
                          );
                        })}
                        {psoNumbers.map((n) => {
                          const val = data.attainmentMatrix?.pso?.[`PSO${n}`]?.[co.id];
                          return (
                            <td key={`att-pso-${n}-${co.id}`} className="fw-semibold py-1.5" style={{ backgroundColor: "#fffbeb", color: "#92400e" }}>
                              {val !== null && val !== undefined ? val : "--"}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    {/* BOTTOM AVERAGE ROW */}
                    <tr style={{ backgroundColor: "#f1f5f9" }}>
                      <td className="fw-bold text-dark py-2">Average</td>
                      {poNumbers.map((n) => (
                        <td key={`att-avg-po-${n}`} className="fw-bold py-2 text-primary">
                          {data.attainmentMatrix?.poAvg?.[`PO${n}`] ?? "--"}
                        </td>
                      ))}
                      {psoNumbers.map((n) => (
                        <td key={`att-avg-pso-${n}`} className="fw-bold py-2" style={{ backgroundColor: "#fef3c7", color: "#92400e" }}>
                          {data.attainmentMatrix?.psoAvg?.[`PSO${n}`] ?? "--"}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="card-footer bg-white py-2 px-3 text-muted small text-center border-top">
                PO/PSO attainment = (CO attainment × CO/PO/PSO Mapping) / Max correlation strength (3.0)
              </div>
            </div>

            {/* SIGNATURE SECTION (Shown on Print) */}
            <div className="d-none d-print-flex justify-content-between pt-4 mt-3">
              <div className="text-center" style={{ width: "240px" }}>
                <div className="border-bottom border-dark pb-1 fw-bold">Course Faculty</div>
                <div className="small text-muted mt-1">Signature & Date</div>
              </div>
              <div className="text-center" style={{ width: "240px" }}>
                <div className="border-bottom border-dark pb-1 fw-bold">Head of Department (HOD)</div>
                <div className="small text-muted mt-1">Signature & Date</div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default POAttainment;