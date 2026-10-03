/**
 * ------------------------------------------------------------------
 * Program Specific Outcome List
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * Role    : HOD
 * ------------------------------------------------------------------
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  PencilSquare,
  Trash,
  ArrowClockwise,
  Printer,
} from "react-bootstrap-icons";

import {
  useProgramSpecificOutcomes,
  useDeleteProgramSpecificOutcome,
} from "../../hooks/useProgramSpecificOutcomes";

function ProgramSpecificOutcomeList() {
  const navigate = useNavigate();

  const [deleteId, setDeleteId] =
    useState(null);

  const {
    data: psos = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useProgramSpecificOutcomes();

  const deleteMutation =
    useDeleteProgramSpecificOutcome();

  /**
   * --------------------------------------------------------------
   * Delete PSO
   * --------------------------------------------------------------
   */
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this Program Specific Outcome?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteId(id);

      await deleteMutation.mutateAsync(id);

      window.alert(
        "Program Specific Outcome deleted successfully."
      );
    } catch (err) {
      console.error(
        "Failed to delete PSO:",
        err
      );

      window.alert(
        err?.response?.data?.message ||
          "Failed to delete Program Specific Outcome."
      );
    } finally {
      setDeleteId(null);
    }
  };

  /**
   * --------------------------------------------------------------
   * Print PSO List
   * --------------------------------------------------------------
   */
  const handlePrint = () => {
    window.print();
  };

  /**
   * --------------------------------------------------------------
   * Sort PSOs naturally
   *
   * PSO1, PSO2, PSO3...
   * instead of PSO1, PSO10, PSO2...
   * --------------------------------------------------------------
   */
  const sortedPsos = [...psos].sort(
    (a, b) => {
      const codeA = String(
        a.code || ""
      ).toUpperCase();

      const codeB = String(
        b.code || ""
      ).toUpperCase();

      const numberA =
        parseInt(
          codeA.replace(/\D/g, ""),
          10
        ) || 0;

      const numberB =
        parseInt(
          codeB.replace(/\D/g, ""),
          10
        ) || 0;

      return numberA - numberB;
    }
  );

  /**
   * --------------------------------------------------------------
   * Loading
   * --------------------------------------------------------------
   */
  if (isLoading) {
    return (
      <div
        style={{
          width: "100%",
          padding: "40px",
          textAlign: "center",
        }}
      >
        <div className="spinner-border text-primary" />
        <p className="mt-3 text-muted">
          Loading Program Specific Outcomes...
        </p>
      </div>
    );
  }

  /**
   * --------------------------------------------------------------
   * Error
   * --------------------------------------------------------------
   */
  if (isError) {
    return (
      <div
        style={{
          width: "100%",
          padding: "30px",
        }}
      >
        <div className="alert alert-danger">
          <strong>
            Failed to load Program Specific Outcomes.
          </strong>

          <div className="mt-2">
            {error?.response?.data?.message ||
              error?.message ||
              "Something went wrong."}
          </div>

          <button
            type="button"
            className="btn btn-outline-danger mt-3"
            onClick={() => refetch()}
          >
            <ArrowClockwise className="me-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="pso-page"
      style={{
        width: "100%",
        minHeight: "calc(100vh - 70px)",
        padding: "28px 32px 40px",
        background: "#f7f9fc",
        boxSizing: "border-box",
      }}
    >
      {/* ==========================================================
          HEADER
      ========================================================== */}

      <div
        className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4"
      >
        <div>
          <div
            style={{
              color: "#6c757d",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "1px",
              textTransform: "uppercase",
              marginBottom: "5px",
            }}
          >
            HOD • Program Management
          </div>

          <h2
            style={{
              margin: 0,
              color: "#16213e",
              fontWeight: 700,
            }}
          >
            Program Specific Outcomes
          </h2>

          <p
            className="text-muted mb-0 mt-2"
            style={{
              fontSize: "14px",
            }}
          >
            Define and manage the Program Specific
            Outcomes for the academic program.
          </p>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => refetch()}
          >
            <ArrowClockwise className="me-2" />
            Refresh
          </button>

          <button
            type="button"
            className="btn btn-outline-dark"
            onClick={handlePrint}
          >
            <Printer className="me-2" />
            Print
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              navigate(
                "/hod/program-specific-outcomes/add"
              )
            }
          >
            <Plus className="me-2" />
            Add PSO
          </button>
        </div>
      </div>

      {/* ==========================================================
          SUMMARY
      ========================================================== */}

      <div
        className="row g-3 mb-4"
      >
        <div className="col-12 col-md-4">
          <div
            className="bg-white rounded-3 border shadow-sm p-3"
          >
            <div
              className="text-muted"
              style={{
                fontSize: "13px",
              }}
            >
              Total PSOs
            </div>

            <div
              style={{
                color: "#16213e",
                fontSize: "28px",
                fontWeight: 700,
                marginTop: "4px",
              }}
            >
              {sortedPsos.length}
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================================
          TABLE
      ========================================================== */}

      <div
        className="card border-0 shadow-sm"
        style={{
          borderRadius: "14px",
          overflow: "hidden",
        }}
      >
        <div
          className="card-header bg-white border-bottom d-flex justify-content-between align-items-center"
          style={{
            padding: "18px 22px",
          }}
        >
          <div>
            <h5
              className="mb-1"
              style={{
                color: "#16213e",
                fontWeight: 700,
              }}
            >
              PSO List
            </h5>

            <small className="text-muted">
              Program Specific Outcomes defined for
              the program.
            </small>
          </div>
        </div>

        <div
          className="table-responsive"
        >
          <table
            className="table table-hover align-middle mb-0"
          >
            <thead
              style={{
                background: "#f8f9fa",
              }}
            >
              <tr>
                <th
                  style={{
                    width: "90px",
                    padding: "16px 20px",
                    color: "#495057",
                  }}
                >
                  #
                </th>

                <th
                  style={{
                    width: "140px",
                    padding: "16px 20px",
                    color: "#495057",
                  }}
                >
                  PSO Code
                </th>

                <th
                  style={{
                    padding: "16px 20px",
                    color: "#495057",
                  }}
                >
                  Description
                </th>

                <th
                  style={{
                    width: "220px",
                    padding: "16px 20px",
                    color: "#495057",
                  }}
                >
                  Program
                </th>

                <th
                  style={{
                    width: "130px",
                    padding: "16px 20px",
                    color: "#495057",
                    textAlign: "center",
                  }}
                >
                  Status
                </th>

                <th
                  style={{
                    width: "150px",
                    padding: "16px 20px",
                    color: "#495057",
                    textAlign: "center",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {sortedPsos.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center"
                    style={{
                      padding: "60px 20px",
                    }}
                  >
                    <div
                      style={{
                        color: "#6c757d",
                        fontSize: "15px",
                      }}
                    >
                      No Program Specific Outcomes
                      found.
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary mt-3"
                      onClick={() =>
                        navigate(
                          "/hod/program-specific-outcomes/add"
                        )
                      }
                    >
                      <Plus className="me-2" />
                      Add First PSO
                    </button>
                  </td>
                </tr>
              ) : (
                sortedPsos.map(
                  (pso, index) => (
                    <tr key={pso.id}>
                      <td
                        style={{
                          padding:
                            "17px 20px",
                          color: "#6c757d",
                          fontWeight: 600,
                        }}
                      >
                        {index + 1}
                      </td>

                      <td
                        style={{
                          padding:
                            "17px 20px",
                        }}
                      >
                        <span
                          style={{
                            display:
                              "inline-flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            minWidth: "64px",
                            padding:
                              "6px 12px",
                            borderRadius:
                              "7px",
                            background:
                              "#eef3ff",
                            color:
                              "#243f96",
                            fontWeight: 700,
                            fontSize:
                              "13px",
                          }}
                        >
                          {pso.code}
                        </span>
                      </td>

                      <td
                        style={{
                          padding:
                            "17px 20px",
                          color: "#212529",
                          lineHeight: 1.6,
                        }}
                      >
                        {pso.description}
                      </td>

                      <td
                        style={{
                          padding:
                            "17px 20px",
                          color: "#495057",
                        }}
                      >
                        {pso.program?.name ||
                          pso.program?.code ||
                          pso.programId ||
                          "-"}
                      </td>

                      <td
                        style={{
                          padding:
                            "17px 20px",
                          textAlign: "center",
                        }}
                      >
                        <span
                          className={`badge ${
                            pso.status
                              ? "text-bg-success"
                              : "text-bg-secondary"
                          }`}
                        >
                          {pso.status
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td
                        style={{
                          padding:
                            "17px 20px",
                          textAlign: "center",
                        }}
                      >
                        <div
                          className="d-flex justify-content-center gap-2"
                        >
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            title="Edit PSO"
                            onClick={() =>
                              navigate(
                                `/hod/program-specific-outcomes/edit/${pso.id}`
                              )
                            }
                          >
                            <PencilSquare />
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            title="Delete PSO"
                            disabled={
                              deleteId ===
                              pso.id
                            }
                            onClick={() =>
                              handleDelete(
                                pso.id
                              )
                            }
                          >
                            {deleteId ===
                            pso.id ? (
                              <span
                                className="spinner-border spinner-border-sm"
                              />
                            ) : (
                              <Trash />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==========================================================
          PRINT STYLES
      ========================================================== */}

      <style>
        {`
          @media print {
            body {
              background: #ffffff !important;
            }

            .pso-page {
              padding: 0 !important;
              background: #ffffff !important;
            }

            .pso-page button {
              display: none !important;
            }

            .pso-page .card {
              box-shadow: none !important;
              border: 1px solid #000 !important;
            }

            .pso-page .card-header {
              border-bottom: 1px solid #000 !important;
            }

            .pso-page table {
              font-size: 12px;
            }

            .pso-page th,
            .pso-page td {
              border: 1px solid #000 !important;
            }

            .pso-page .badge {
              border: none !important;
            }
          }
        `}
      </style>
    </div>
  );
}

export default ProgramSpecificOutcomeList;