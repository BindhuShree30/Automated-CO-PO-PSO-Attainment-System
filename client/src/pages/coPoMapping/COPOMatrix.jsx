import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  useCourses,
  useCourse,
  useCOs,
  usePOs,
  useMatrix,
  useSaveMatrix,
} from "../../hooks/useCOPOMatrix";

function COPOMatrix() {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [matrix, setMatrix] = useState({});
  const printRef = useRef(null);

  /**
   * ---------------------------------------------------------
   * Queries
   * ---------------------------------------------------------
   */

  const {
    data: courses = [],
    isLoading: coursesLoading,
  } = useCourses();

  const { data: course } = useCourse(selectedCourse);

  const programId = course?.programId;

  const {
    data: courseOutcomes = [],
  } = useCOs(selectedCourse);

  const {
    data: programOutcomes = [],
  } = usePOs(programId);

  // Sort Program Outcomes (PO1 → PO12)
  const sortedProgramOutcomes = useMemo(() => {
    return [...programOutcomes].sort((a, b) => {
      const aNum = Number(a.code.replace("PO", ""));
      const bNum = Number(b.code.replace("PO", ""));
      return aNum - bNum;
    });
  }, [programOutcomes]);

  const {
    data: existingMatrix = [],
  } = useMatrix(selectedCourse);

  const saveMutation = useSaveMatrix();

  /**
   * ---------------------------------------------------------
   * Build Matrix
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (
      courseOutcomes.length === 0 ||
      sortedProgramOutcomes.length === 0
    ) {
      setMatrix({});
      return;
    }

    const temp = {};

    courseOutcomes.forEach((co) => {
      temp[co.id] = {};

      sortedProgramOutcomes.forEach((po) => {
        temp[co.id][po.id] = 0;
      });
    });

    existingMatrix.forEach((item) => {
      if (temp[item.courseOutcomeId]) {
        temp[item.courseOutcomeId][item.programOutcomeId] =
          Number(item.mappingLevel);
      }
    });

    setMatrix((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(temp)) {
        return prev;
      }

      return temp;
    });
  }, [
    courseOutcomes,
    sortedProgramOutcomes,
    existingMatrix,
  ]);

  /**
   * ---------------------------------------------------------
   * Update Cell
   * ---------------------------------------------------------
   */

  const updateCell = (coId, poId, value) => {
    setMatrix((prev) => ({
      ...prev,
      [coId]: {
        ...prev[coId],
        [poId]: Number(value),
      },
    }));
  };

  /**
   * ---------------------------------------------------------
   * Save Payload
   * ---------------------------------------------------------
   */

  const payload = useMemo(() => {
    const rows = [];

    Object.keys(matrix).forEach((coId) => {
      Object.keys(matrix[coId]).forEach((poId) => {
        const level = Number(matrix[coId][poId]);

        if (level > 0) {
          rows.push({
            courseOutcomeId: coId,
            programOutcomeId: poId,
            mappingLevel: level,
          });
        }
      });
    });

    return rows;
  }, [matrix]);

  /**
   * ---------------------------------------------------------
   * Save Matrix
   * ---------------------------------------------------------
   */

  const handleSave = async () => {
    if (payload.length === 0) {
      toast.error("Please select at least one CO-PO mapping.");
      return;
    }

    try {
      await saveMutation.mutateAsync(payload);
      toast.success("Matrix saved successfully.");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to save matrix."
      );
    }
  };
  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
  
    const printWindow = window.open("", "", "width=1200,height=800");
  
    printWindow.document.write(`
      <html>
        <head>
          <title>CO-PO Matrix</title>
  
          <style>
            body{
              font-family: Arial,sans-serif;
              padding:30px;
            }
  
            h2,h3,h4{
              text-align:center;
              margin:4px;
            }
  
            table{
              width:100%;
              border-collapse:collapse;
              margin-top:20px;
            }
  
            table,
            th,
            td{
              border:1px solid black;
            }
  
            th,
            td{
              padding:8px;
              text-align:center;
            }
  
          </style>
  
        </head>
  
        <body>
  
          ${printContents}
  
        </body>
  
      </html>
    `);
  
    printWindow.document.close();
  
    printWindow.focus();
  
    printWindow.print();
  
    printWindow.close();
  };
  
  
  const handleExportPDF = async () => {
    const element = printRef.current;
  
    if (!element) return;
  
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
    });
  
    const imgData = canvas.toDataURL("image/png");
  
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });
  
    const pageWidth = pdf.internal.pageSize.getWidth();
  
    const pageHeight =
      (canvas.height * pageWidth) / canvas.width;
  
    pdf.addImage(
      imgData,
      "PNG",
      0,
      5,
      pageWidth,
      pageHeight
    );
  
    pdf.save("CO_PO_Matrix.pdf");
  };

  if (coursesLoading) {
    return (
      <div className="container-fluid mt-4">
        <h5>Loading...</h5>
      </div>
    );
  }
  console.log("Courses Response:", courses);
  return (
    <div className="container-fluid mt-4">
  
      <div className="card shadow-sm">
  
        <div className="card-header d-flex justify-content-between align-items-center">
  
          <h4 className="mb-0">
            CO – PO Mapping Matrix
          </h4>
  
          <div>
  
            <button
              className="btn btn-success me-2"
              onClick={handlePrint}
              disabled={!selectedCourse}
            >
              🖨 Print
            </button>
  
            <button
              className="btn btn-danger"
              onClick={handleExportPDF}
              disabled={!selectedCourse}
            >
              📄 Export PDF
            </button>
  
          </div>
  
        </div>
  
        <div className="card-body">
  
          <div className="row mb-4">
  
            <div className="col-md-5">
  
              <label className="form-label">
                Select Course
              </label>
  
              <select
                className="form-select"
                value={selectedCourse}
                onChange={(e) =>
                  setSelectedCourse(e.target.value)
                }
              >
  
                <option value="">
                  Select Course
                </option>
  
                {courses.map((course) => (
  
                  <option
                    key={course.id}
                    value={course.id}
                  >
                    {course.code} - {course.name}
                  </option>
  
                ))}
  
              </select>
  
            </div>
  
          </div>
  
          {selectedCourse &&
            courseOutcomes.length > 0 &&
            sortedProgramOutcomes.length > 0 && (
  
              <>
  
                <div className="table-responsive">
  
                  <table className="table table-bordered table-hover align-middle">
  
                    <thead className="table-dark">
  
                      <tr>
  
                        <th style={{ width: 220 }}>
                          Course Outcomes
                        </th>
  
                        {sortedProgramOutcomes.map((po) => (
  
                          <th
                            key={po.id}
                            className="text-center"
                          >
                            {po.code}
                          </th>
  
                        ))}
  
                      </tr>
  
                    </thead>
  
                    <tbody>
  
                      {courseOutcomes.map((co) => (
  
                        <tr key={co.id}>
  
                          <td>
  
                            <strong>
                              {co.code}
                            </strong>
  
                            <br />
  
                            <small className="text-muted">
                              {co.description}
                            </small>
  
                          </td>
  
                          {sortedProgramOutcomes.map((po) => (
  
                            <td
                              key={po.id}
                              className="text-center"
                            >
  
                              <select
                                value={String(
                                  matrix[co.id]?.[po.id] ?? 0
                                )}
                                onChange={(e) =>
                                  updateCell(
                                    co.id,
                                    po.id,
                                    e.target.value
                                  )
                                }
                              >
  
                                <option value="0">0</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
  
                              </select>
  
                            </td>
  
                          ))}
  
                        </tr>
  
                      ))}
  
                    </tbody>
  
                  </table>
  
                </div>
  
                <div className="mt-4 text-end">
  
                  <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={saveMutation.isPending}
                  >
  
                    {saveMutation.isPending
                      ? "Saving..."
                      : "Save Matrix"}
  
                  </button>
  
                </div>
  
              </>
  
            )}
  
          {selectedCourse &&
            !courseOutcomes.length && (
  
              <div className="alert alert-warning">
  
                No Course Outcomes found for this course.
  
              </div>
  
            )}
  
          {selectedCourse &&
            courseOutcomes.length > 0 &&
            !sortedProgramOutcomes.length && (
  
              <div className="alert alert-warning">
  
                No Program Outcomes found.
  
              </div>
  
            )}
            {/* ===========================
    Hidden Printable Report
=========================== */}

            <div
              ref={printRef}
              style={{
                position: "absolute",
                left: "-9999px",
                top: 0,
                width: "1200px",
                background: "#ffffff",
                padding: "30px",
              }}
            >

              <div style={{ textAlign: "center" }}>

                <h2>GCEM</h2>

                <h4>
                  Department of Computer Science &
                  Engineering
                </h4>

                <h3>
                  CO – PO Mapping Matrix
                </h3>

              </div>

              <hr />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                }}
              >

                <div>

                  <strong>Course :</strong>{" "}
                  {course?.code} - {course?.name}

                </div>

                <div>

                  <strong>Semester :</strong>{" "}
                  {course?.semester}

                </div>

              </div>

              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >

                <thead>

                  <tr>

                    <th
                      style={{
                        border: "1px solid black",
                        padding: "8px",
                      }}
                    >
                      CO
                    </th>

                    {sortedProgramOutcomes.map((po) => (

                      <th
                        key={po.id}
                        style={{
                          border: "1px solid black",
                          padding: "8px",
                        }}
                      >
                        {po.code}
                      </th>

                    ))}

                  </tr>

                </thead>

                <tbody>

                  {courseOutcomes.map((co) => (

                    <tr key={co.id}>

                      <td
                        style={{
                          border: "1px solid black",
                          padding: "8px",
                        }}
                      >
                        {co.code}
                      </td>

                      {sortedProgramOutcomes.map((po) => (

                        <td
                          key={po.id}
                          style={{
                            border: "1px solid black",
                            padding: "8px",
                            textAlign: "center",
                          }}
                        >
                          {matrix[co.id]?.[po.id] || "-"}
                        </td>

                      ))}

                    </tr>

                  ))}

                </tbody>

              </table>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "70px",
                }}
              >

                <div>

                  _______________________

                  <br />

                  Course Coordinator

                </div>

                <div>

                  _______________________

                  <br />

                  Head of Department

                </div>

              </div>

            </div>
              
  
        </div>
  
      </div>
  
    </div>
  );
  
  }
  
  export default COPOMatrix;