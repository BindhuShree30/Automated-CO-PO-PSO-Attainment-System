import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import {
  FileEarmarkExcel,
  Upload,
  ArrowClockwise,
  Eye,
  PencilSquare,
  Trash,
} from "react-bootstrap-icons";

import api from "../../api/axios";

function CurriculumImport() {
  const { curriculumId } = useParams();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const [imports, setImports] = useState([]);

  // =========================================================
  // LOAD IMPORT HISTORY
  // =========================================================

  const loadImports = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `/curriculum/curriculums/${curriculumId}/imports`
      );

      setImports(response?.data?.data || []);
    } catch (error) {
      console.error(
        "Failed to load curriculum imports:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to load curriculum imports."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    if (curriculumId) {
      loadImports();
    }
  }, [curriculumId]);

  // =========================================================
  // FILE SELECT
  // =========================================================

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const extension = file.name
      .split(".")
      .pop()
      ?.toLowerCase();

    if (extension !== "xlsx" && extension !== "xls") {
      toast.error(
        "Please select a valid Excel file (.xlsx or .xls)."
      );

      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        "File size must be 5 MB or less."
      );

      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  // =========================================================
  // UPLOAD CURRICULUM
  // =========================================================

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select an Excel file.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await api.post(
        `/curriculum/curriculums/${curriculumId}/import`,
        formData
      );

      const createdImport =
        response?.data?.data;

      toast.success(
        "Curriculum uploaded successfully."
      );

      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await loadImports();

      // Open the newly created import
      if (createdImport?.id) {
        navigate(
          `/hod/curriculum-import-review/${createdImport.id}`
        );
      }
    } catch (error) {
      console.error(
        "Failed to upload curriculum:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to upload curriculum."
      );
    } finally {
      setUploading(false);
    }
  };

  // =========================================================
  // EDIT / REVIEW IMPORT
  // =========================================================

  const handleEdit = (importId) => {
    navigate(
      `/hod/curriculum-import-review/${importId}`
    );
  };

  // =========================================================
  // DELETE IMPORT
  // =========================================================

  const handleDelete = async (importItem) => {
    const fileName =
      importItem?.fileName ||
      "this curriculum import";

    const confirmed = window.confirm(
      `Are you sure you want to delete "${fileName}"?\n\nThis action will remove the import and its imported rows.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(importItem.id);

      await api.delete(
        `/curriculum/curriculum-imports/${importItem.id}`
      );

      toast.success(
        "Curriculum import deleted successfully."
      );

      setImports((previousImports) =>
        previousImports.filter(
          (item) => item.id !== importItem.id
        )
      );
    } catch (error) {
      console.error(
        "Failed to delete curriculum import:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to delete curriculum import."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =========================================================
  // STATUS BADGE
  // =========================================================

  const renderStatusBadge = (status) => {
    switch (status) {
      case "UPLOADED":
        return (
          <span className="badge bg-secondary">
            UPLOADED
          </span>
        );

      case "PROCESSING":
        return (
          <span className="badge bg-primary">
            PROCESSING
          </span>
        );

      case "EXTRACTED":
        return (
          <span className="badge bg-info text-dark">
            EXTRACTED
          </span>
        );

      case "REVIEW":
        return (
          <span className="badge bg-warning text-dark">
            REVIEW
          </span>
        );

      case "CONFIRMED":
        return (
          <span className="badge bg-success">
            CONFIRMED
          </span>
        );

      case "FAILED":
        return (
          <span className="badge bg-danger">
            FAILED
          </span>
        );

      default:
        return (
          <span className="badge bg-secondary">
            {status || "-"}
          </span>
        );
    }
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
            Loading curriculum imports...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
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
            Curriculum Import
          </h2>

          <p className="text-muted mb-0">
            Upload the curriculum Excel file and review
            imported subjects before confirmation.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={loadImports}
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
          UPLOAD CARD
      ===================================================== */}

      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-bold">
            Upload Curriculum
          </h5>
        </div>

        <div className="card-body">
          <div className="row align-items-end g-3">
            <div className="col-md-9">
              <label className="form-label fw-semibold">
                Curriculum Excel File
              </label>

              <input
                ref={fileInputRef}
                type="file"
                className="form-control"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                disabled={uploading}
              />

              <small className="text-muted">
                Accepted formats: .xlsx, .xls
                &nbsp; | &nbsp; Maximum size: 5 MB
              </small>

              {selectedFile && (
                <div className="mt-3 d-flex align-items-center gap-2">
                  <FileEarmarkExcel
                    size={20}
                    className="text-success"
                  />

                  <span className="fw-semibold">
                    {selectedFile.name}
                  </span>

                  <span className="text-muted">
                    (
                    {(
                      selectedFile.size /
                      1024 /
                      1024
                    ).toFixed(2)}{" "}
                    MB)
                  </span>
                </div>
              )}
            </div>

            <div className="col-md-3">
              <button
                type="button"
                className="btn btn-primary w-100"
                onClick={handleUpload}
                disabled={
                  uploading || !selectedFile
                }
              >
                {uploading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload
                      size={17}
                      className="me-2"
                    />
                    Upload Curriculum
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          IMPORT HISTORY
      ===================================================== */}

      <div className="card shadow-sm">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-bold">
            Import History
          </h5>
        </div>

        <div className="card-body p-0">
          {imports.length === 0 ? (
            <div className="text-center py-5">
              <FileEarmarkExcel
                size={42}
                className="text-muted mb-3"
              />

              <p className="text-muted mb-0">
                No curriculum imports found.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th
                      className="text-center"
                      style={{ minWidth: "70px" }}
                    >
                      #
                    </th>

                    <th style={{ minWidth: "260px" }}>
                      File Name
                    </th>

                    <th style={{ minWidth: "140px" }}>
                      Status
                    </th>

                    <th
                      className="text-center"
                      style={{ minWidth: "100px" }}
                    >
                      Rows
                    </th>

                    <th style={{ minWidth: "190px" }}>
                      Uploaded At
                    </th>

                    <th
                      className="text-center"
                      style={{ minWidth: "280px" }}
                    >
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {imports.map((item, index) => {
                    const status =
                      item.extractionStatus ||
                      item.status;

                    const isDeleting =
                      deletingId === item.id;

                    return (
                      <tr key={item.id}>
                        <td className="text-center">
                          {index + 1}
                        </td>

                        <td>
                          <div className="d-flex align-items-center">
                            <FileEarmarkExcel
                              size={18}
                              className="text-success me-2"
                            />

                            <span className="fw-semibold">
                              {item.fileName || "-"}
                            </span>
                          </div>
                        </td>

                        <td>
                          {renderStatusBadge(status)}
                        </td>

                        <td className="text-center">
                          {item.totalRows ??
                            item.rowCount ??
                            item.rowsCount ??
                            "-"}
                        </td>

                        <td>
                          {item.createdAt
                            ? new Date(
                                item.createdAt
                              ).toLocaleString()
                            : "-"}
                        </td>

                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-2">
                            {/* EDIT */}

                            <button
                              type="button"
                              className="btn btn-sm btn-primary"
                              onClick={() =>
                                handleEdit(item.id)
                              }
                              disabled={isDeleting}
                              title="Edit / Review"
                            >
                              <PencilSquare
                                size={14}
                                className="me-1"
                              />
                              Edit
                            </button>

                            {/* VIEW */}

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() =>
                                handleEdit(item.id)
                              }
                              disabled={isDeleting}
                              title="View import"
                            >
                              <Eye
                                size={14}
                                className="me-1"
                              />
                              View
                            </button>

                            {/* DELETE */}

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                handleDelete(item)
                              }
                              disabled={isDeleting}
                              title="Delete import"
                            >
                              {isDeleting ? (
                                <>
                                  <span
                                    className="spinner-border spinner-border-sm me-1"
                                    role="status"
                                  />
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <Trash
                                    size={14}
                                    className="me-1"
                                  />
                                  Delete
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CurriculumImport;