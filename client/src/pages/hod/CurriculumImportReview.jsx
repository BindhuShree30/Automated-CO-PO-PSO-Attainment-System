import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import {
  PencilSquare,
  ArrowClockwise,
  CheckCircle,
  ExclamationTriangle,
} from "react-bootstrap-icons";

import api from "../../api/axios";

function CurriculumImportReview() {
  const { importId } = useParams();

  const [importData, setImportData] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  const [formData, setFormData] = useState({
    semesterNumber: "",
    courseCode: "",
    courseName: "",
    credits: "",
    courseType: "",
    electiveGroup: "",
    isCompulsory: true,
    sequenceNo: "",
  });

  // =========================================================
  // LOAD IMPORT
  // =========================================================

  const loadImport = async () => {
    try {
      setLoading(true);

      const [importResponse, rowsResponse] = await Promise.all([
        api.get(
          `/curriculum/curriculum-imports/${importId}`
        ),
        api.get(
          `/curriculum/curriculum-imports/${importId}/rows`
        ),
      ]);

      setImportData(importResponse?.data?.data || null);
      setRows(rowsResponse?.data?.data || []);
    } catch (error) {
      console.error("Failed to load curriculum import:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to load curriculum import."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    if (importId) {
      loadImport();
    }
  }, [importId]);

  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================

  const handleEditRow = (row) => {
    setEditingRow(row);

    setFormData({
      semesterNumber: row.semesterNumber ?? "",
      courseCode: row.courseCode ?? "",
      courseName: row.courseName ?? "",
      credits: row.credits ?? "",
      courseType: row.courseType ?? "",
      electiveGroup: row.electiveGroup ?? "",
      isCompulsory: row.isCompulsory ?? true,
      sequenceNo: row.sequenceNo ?? "",
    });

    setShowEditModal(true);
  };

  // =========================================================
  // CLOSE EDIT MODAL
  // =========================================================

  const handleCloseModal = () => {
    if (saving) {
      return;
    }

    setShowEditModal(false);
    setEditingRow(null);

    setFormData({
      semesterNumber: "",
      courseCode: "",
      courseName: "",
      credits: "",
      courseType: "",
      electiveGroup: "",
      isCompulsory: true,
      sequenceNo: "",
    });
  };

  // =========================================================
  // INPUT CHANGE
  // =========================================================

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =========================================================
  // SAVE EDIT
  // =========================================================

  const handleSaveEdit = async (event) => {
    event.preventDefault();

    if (!editingRow) {
      return;
    }

    if (!formData.courseName.trim()) {
      toast.error("Course name is required.");
      return;
    }

    if (!formData.semesterNumber) {
      toast.error("Semester number is required.");
      return;
    }

    if (
      Number(formData.semesterNumber) < 1 ||
      Number(formData.semesterNumber) > 8
    ) {
      toast.error("Semester number must be between 1 and 8.");
      return;
    }

    if (
      formData.credits !== "" &&
      Number(formData.credits) < 0
    ) {
      toast.error("Credits cannot be negative.");
      return;
    }

    if (!formData.sequenceNo) {
      toast.error("Sequence number is required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        semesterNumber: Number(formData.semesterNumber),

        courseCode: formData.courseCode.trim()
          ? formData.courseCode.trim().toUpperCase()
          : null,

        courseName: formData.courseName.trim(),

        credits:
          formData.credits === ""
            ? null
            : Number(formData.credits),

        courseType: formData.courseType.trim()
          ? formData.courseType.trim()
          : null,

        electiveGroup: formData.electiveGroup.trim()
          ? formData.electiveGroup.trim()
          : null,

        isCompulsory: Boolean(formData.isCompulsory),

        sequenceNo: Number(formData.sequenceNo),
      };

      const response = await api.patch(
        `/curriculum/curriculum-imports/${importId}/rows/${editingRow.id}`,
        payload
      );

      const updatedRow = response?.data?.data;

      // Update the row immediately in the table
      setRows((previousRows) =>
        previousRows.map((row) =>
          row.id === editingRow.id ? updatedRow : row
        )
      );

      toast.success("Curriculum row updated successfully.");

      handleCloseModal();
    } catch (error) {
      console.error(
        "Failed to update curriculum row:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to update curriculum row."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // STATUS BADGE
  // =========================================================

  const renderRowStatus = (rowStatus) => {
    if (rowStatus === "MATCHED") {
      return (
        <span className="badge bg-success">
          <CheckCircle size={13} className="me-1" />
          MATCHED
        </span>
      );
    }

    if (rowStatus === "CODE_NAME_MISMATCH") {
      return (
        <span className="badge bg-warning text-dark">
          <ExclamationTriangle
            size={13}
            className="me-1"
          />
          CODE / NAME MISMATCH
        </span>
      );
    }

    if (rowStatus === "NAME_MATCH_REVIEW") {
      return (
        <span className="badge bg-info text-dark">
          NAME MATCH REVIEW
        </span>
      );
    }

    if (rowStatus === "INVALID") {
      return (
        <span className="badge bg-danger">
          INVALID
        </span>
      );
    }

    if (rowStatus === "NEW_COURSE") {
      return (
        <span className="badge bg-secondary">
          NEW COURSE
        </span>
      );
    }

    return (
      <span className="badge bg-secondary">
        PENDING
      </span>
    );
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <div
            className="spinner-border text-primary"
            role="status"
          >
            <span className="visually-hidden">
              Loading...
            </span>
          </div>

          <p className="text-muted mt-3 mb-0">
            Loading curriculum import...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <>
      <div
        className="container-fluid py-4"
        style={{
          width: "100%",
          maxWidth: "100%",
          paddingLeft: "24px",
          paddingRight: "24px",
        }}
      >
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h2 className="fw-bold mb-1">
              Curriculum Import Review
            </h2>

            <p className="text-muted mb-0">
              Review and correct imported curriculum
              subjects before confirmation.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={loadImport}
            disabled={loading}
          >
            <ArrowClockwise
              size={17}
              className="me-2"
            />
            Refresh
          </button>
        </div>

        {/* =====================================================
            IMPORT INFORMATION
        ===================================================== */}

        {importData && (
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="text-muted small">
                    Import File
                  </div>

                  <div className="fw-semibold">
                    {importData.fileName || "-"}
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="text-muted small">
                    Import Status
                  </div>

                  <div>
                    <span className="badge bg-warning text-dark">
                      {importData.extractionStatus || "-"}
                    </span>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="text-muted small">
                    Total Rows
                  </div>

                  <div className="fw-semibold">
                    {rows.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            ROWS TABLE
        ===================================================== */}

        <div className="card shadow-sm">
          <div className="card-header bg-white py-3">
            <h5 className="mb-0 fw-bold">
              Curriculum Rows
            </h5>
          </div>

          <div className="card-body p-0">
            {rows.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted mb-0">
                  No curriculum rows found.
                </p>
              </div>
            ) : (
              <div
                className="table-responsive"
                style={{
                  maxHeight: "70vh",
                  overflowY: "auto",
                }}
              >
                <table className="table table-bordered table-hover align-middle mb-0">
                  <thead className="table-light sticky-top">
                    <tr>
                      <th
                        className="text-center"
                        style={{ minWidth: "70px" }}
                      >
                        #
                      </th>

                      <th style={{ minWidth: "100px" }}>
                        Semester
                      </th>

                      <th style={{ minWidth: "120px" }}>
                        Course Code
                      </th>

                      <th style={{ minWidth: "280px" }}>
                        Course Name
                      </th>

                      <th style={{ minWidth: "90px" }}>
                        Credits
                      </th>

                      <th style={{ minWidth: "130px" }}>
                        Course Type
                      </th>

                      <th style={{ minWidth: "170px" }}>
                        Match Status
                      </th>

                      <th style={{ minWidth: "300px" }}>
                        Validation
                      </th>

                      <th
                        className="text-center"
                        style={{ minWidth: "100px" }}
                      >
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {rows.map((row, index) => (
                      <tr key={row.id}>
                        <td className="text-center">
                          {index + 1}
                        </td>

                        <td>
                          {row.semesterNumber ?? "-"}
                        </td>

                        <td>
                          <span className="fw-semibold">
                            {row.courseCode || "-"}
                          </span>
                        </td>

                        <td>
                          {row.courseName || "-"}
                        </td>

                        <td>
                          {row.credits ?? "-"}
                        </td>

                        <td>
                          {row.courseType || "-"}
                        </td>

                        <td>
                          {renderRowStatus(row.rowStatus)}
                        </td>

                        <td>
                          <span
                            className="text-muted small"
                            style={{ lineHeight: "1.4" }}
                          >
                            {row.validationMessage ||
                              "No validation message."}
                          </span>
                        </td>

                        <td className="text-center">
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={() =>
                              handleEditRow(row)
                            }
                            disabled={
                              importData?.extractionStatus !==
                              "REVIEW"
                            }
                          >
                            <PencilSquare
                              size={14}
                              className="me-1"
                            />
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =======================================================
          EDIT MODAL
      ======================================================= */}

      {showEditModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0,0,0,0.55)",
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              {/* =================================================
                  MODAL HEADER
              ================================================= */}

              <div className="modal-header">
                <div>
                  <h5 className="modal-title fw-bold">
                    Edit Curriculum Row
                  </h5>

                  <small className="text-muted">
                    Source Row{" "}
                    {editingRow?.sourceRowNumber || "-"}
                  </small>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                  disabled={saving}
                />
              </div>

              {/* =================================================
                  MODAL BODY
              ================================================= */}

              <form onSubmit={handleSaveEdit}>
                <div className="modal-body">
                  <div className="row g-3">
                    {/* SEMESTER */}

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">
                        Semester
                      </label>

                      <input
                        type="number"
                        min="1"
                        max="8"
                        name="semesterNumber"
                        className="form-control"
                        value={formData.semesterNumber}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* SEQUENCE */}

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">
                        Sequence No
                      </label>

                      <input
                        type="number"
                        min="1"
                        name="sequenceNo"
                        className="form-control"
                        value={formData.sequenceNo}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* CREDITS */}

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">
                        Credits
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        name="credits"
                        className="form-control"
                        value={formData.credits}
                        onChange={handleChange}
                      />
                    </div>

                    {/* COURSE CODE */}

                    <div className="col-md-5">
                      <label className="form-label fw-semibold">
                        Course Code
                      </label>

                      <input
                        type="text"
                        name="courseCode"
                        className="form-control"
                        value={formData.courseCode}
                        onChange={handleChange}
                        maxLength="20"
                        placeholder="Example: BCS304"
                      />
                    </div>

                    {/* COURSE NAME */}

                    <div className="col-md-7">
                      <label className="form-label fw-semibold">
                        Course Name
                      </label>

                      <input
                        type="text"
                        name="courseName"
                        className="form-control"
                        value={formData.courseName}
                        onChange={handleChange}
                        maxLength="150"
                        required
                      />
                    </div>

                    {/* COURSE TYPE */}

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Course Type
                      </label>

                      <input
                        type="text"
                        name="courseType"
                        className="form-control"
                        value={formData.courseType}
                        onChange={handleChange}
                        maxLength="30"
                        placeholder="Example: PCC / IPCC / OEC"
                      />
                    </div>

                    {/* ELECTIVE GROUP */}

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Elective Group
                      </label>

                      <input
                        type="text"
                        name="electiveGroup"
                        className="form-control"
                        value={formData.electiveGroup}
                        onChange={handleChange}
                        maxLength="50"
                        placeholder="Optional"
                      />
                    </div>

                    {/* COMPULSORY */}

                    <div className="col-12">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="isCompulsory"
                          name="isCompulsory"
                          checked={formData.isCompulsory}
                          onChange={handleChange}
                        />

                        <label
                          className="form-check-label fw-semibold"
                          htmlFor="isCompulsory"
                        >
                          Compulsory Course
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* CURRENT MATCH INFORMATION */}

                  {editingRow && (
                    <div className="alert alert-light border mt-4 mb-0">
                      <div className="fw-semibold mb-2">
                        Current Match Information
                      </div>

                      <div className="row g-2">
                        <div className="col-md-4">
                          <small className="text-muted d-block">
                            Match Status
                          </small>

                          {renderRowStatus(
                            editingRow.rowStatus
                          )}
                        </div>

                        <div className="col-md-8">
                          <small className="text-muted d-block">
                            Validation
                          </small>

                          <small>
                            {editingRow.validationMessage ||
                              "No validation message."}
                          </small>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* =================================================
                    MODAL FOOTER
                ================================================= */}

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseModal}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
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
                      <>
                        <CheckCircle
                          size={16}
                          className="me-2"
                        />

                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CurriculumImportReview;