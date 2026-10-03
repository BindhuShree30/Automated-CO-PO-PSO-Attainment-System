/**
 * ------------------------------------------------------------------
 * Edit Program Specific Outcome
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * Role    : HOD
 * ------------------------------------------------------------------
 */

import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Check2Circle,
} from "react-bootstrap-icons";

import {
  useProgramSpecificOutcome,
  useUpdateProgramSpecificOutcome,
} from "../../hooks/useProgramSpecificOutcomes";

import api from "../../api/axios";

function EditProgramSpecificOutcome() {
  const navigate = useNavigate();
  const { id } = useParams();

  /* ================================================================
     GET PSO
  ================================================================ */

  const {
    data: pso,
    isLoading: psoLoading,
    isError: psoError,
    error: psoErrorDetails,
  } = useProgramSpecificOutcome(id);

  /* ================================================================
     UPDATE
  ================================================================ */

  const updateMutation =
    useUpdateProgramSpecificOutcome();

  /* ================================================================
     PROGRAMS
  ================================================================ */

  const [programs, setPrograms] =
    useState([]);

  const [loadingPrograms, setLoadingPrograms] =
    useState(true);

  /* ================================================================
     FORM
  ================================================================ */

  const [formData, setFormData] = useState({
    programId: "",
    code: "",
    description: "",
    status: true,
  });

  const [errors, setErrors] =
    useState({});

  /* ================================================================
     LOAD PROGRAMS
  ================================================================ */

  useEffect(() => {
    const loadPrograms = async () => {
      try {
        setLoadingPrograms(true);

        const response = await api.get(
          "/programs"
        );

        setPrograms(
          response.data?.data || []
        );
      } catch (error) {
        console.error(
          "Failed to load programs:",
          error
        );

        setErrors({
          programId:
            error?.response?.data?.message ||
            "Unable to load programs.",
        });
      } finally {
        setLoadingPrograms(false);
      }
    };

    loadPrograms();
  }, []);

  /* ================================================================
     LOAD PSO INTO FORM
  ================================================================ */

  useEffect(() => {
    if (!pso) {
      return;
    }

    setFormData({
      programId:
        pso.programId || "",

      code:
        pso.code || "",

      description:
        pso.description || "",

      status:
        pso.status ?? true,
    });
  }, [pso]);

  /* ================================================================
     HANDLE CHANGE
  ================================================================ */

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
      submit: "",
    }));
  };

  /* ================================================================
     VALIDATION
  ================================================================ */

  const validate = () => {
    const validationErrors = {};

    if (!formData.programId) {
      validationErrors.programId =
        "Please select a program.";
    }

    if (!formData.code.trim()) {
      validationErrors.code =
        "PSO code is required.";
    } else if (
      !/^PSO\d+$/i.test(
        formData.code.trim()
      )
    ) {
      validationErrors.code =
        "PSO code must be in the format PSO1, PSO2, PSO3, etc.";
    }

    if (!formData.description.trim()) {
      validationErrors.description =
        "PSO description is required.";
    } else if (
      formData.description.trim()
        .length < 10
    ) {
      validationErrors.description =
        "PSO description should contain at least 10 characters.";
    }

    setErrors(
      validationErrors
    );

    return (
      Object.keys(
        validationErrors
      ).length === 0
    );
  };

  /* ================================================================
     SUBMIT
  ================================================================ */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id,

        data: {
          programId:
            formData.programId,

          code:
            formData.code
              .trim()
              .toUpperCase(),

          description:
            formData.description.trim(),

          status:
            formData.status,
        },
      });

      window.alert(
        "Program Specific Outcome updated successfully."
      );

      navigate(
        "/hod/program-specific-outcomes"
      );
    } catch (error) {
      console.error(
        "Failed to update PSO:",
        error
      );

      setErrors({
        submit:
          error?.response?.data
            ?.message ||
          "Failed to update Program Specific Outcome.",
      });
    }
  };

  /* ================================================================
     CANCEL
  ================================================================ */

  const handleCancel = () => {
    navigate(
      "/hod/program-specific-outcomes"
    );
  };

  /* ================================================================
     LOADING
  ================================================================ */

  if (
    psoLoading ||
    loadingPrograms
  ) {
    return (
      <div
        style={{
          width: "100%",
          minHeight:
            "calc(100vh - 70px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "#f7f9fc",
        }}
      >
        <div className="text-center">
          <div
            className="spinner-border text-primary"
            role="status"
          />

          <p className="text-muted mt-3 mb-0">
            Loading Program Specific Outcome...
          </p>
        </div>
      </div>
    );
  }

  /* ================================================================
     ERROR
  ================================================================ */

  if (
    psoError ||
    !pso
  ) {
    return (
      <div
        style={{
          width: "100%",
          padding:
            "30px 32px",
          background:
            "#f7f9fc",
          minHeight:
            "calc(100vh - 70px)",
        }}
      >
        <div className="alert alert-danger">
          <h5>
            Unable to load Program Specific Outcome
          </h5>

          <p className="mb-3">
            {psoErrorDetails?.response
              ?.data?.message ||
              psoErrorDetails?.message ||
              "The requested PSO could not be found."}
          </p>

          <button
            type="button"
            className="btn btn-outline-danger"
            onClick={
              handleCancel
            }
          >
            <ArrowLeft className="me-2" />
            Back to PSO List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        minHeight:
          "calc(100vh - 70px)",
        padding:
          "28px 32px 40px",
        background:
          "#f7f9fc",
        boxSizing:
          "border-box",
      }}
    >
      {/* ==========================================================
          HEADER
      ========================================================== */}

      <div className="mb-4">

        <button
          type="button"
          className="btn btn-link p-0 mb-3 text-decoration-none"
          onClick={
            handleCancel
          }
        >
          <ArrowLeft className="me-2" />
          Back to PSO List
        </button>

        <div>
          <div
            style={{
              color: "#6c757d",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing:
                "1px",
              textTransform:
                "uppercase",
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
            Edit Program Specific Outcome
          </h2>

          <p
            className="text-muted mb-0 mt-2"
            style={{
              fontSize: "14px",
            }}
          >
            Update the details of the
            selected Program Specific Outcome.
          </p>
        </div>
      </div>

      {/* ==========================================================
          FORM
      ========================================================== */}

      <div
        className="card border-0 shadow-sm"
        style={{
          maxWidth: "900px",
          borderRadius: "14px",
          overflow: "hidden",
        }}
      >

        {/* ========================================================
            CARD HEADER
        ======================================================== */}

        <div
          className="card-header bg-white border-bottom"
          style={{
            padding:
              "20px 24px",
          }}
        >
          <h5
            className="mb-1"
            style={{
              color: "#16213e",
              fontWeight: 700,
            }}
          >
            PSO Details
          </h5>

          <small className="text-muted">
            Modify the Program Specific Outcome
            information below.
          </small>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
        >

          <div
            className="card-body"
            style={{
              padding:
                "28px 24px",
            }}
          >

            {/* ====================================================
                SUBMIT ERROR
            ==================================================== */}

            {errors.submit && (
              <div className="alert alert-danger">
                {errors.submit}
              </div>
            )}

            {/* ====================================================
                PROGRAM
            ==================================================== */}

            <div className="mb-4">

              <label
                htmlFor="programId"
                className="form-label fw-semibold"
              >
                Program
                <span className="text-danger">
                  {" "}
                  *
                </span>
              </label>

              <select
                id="programId"
                name="programId"
                className={`form-select ${
                  errors.programId
                    ? "is-invalid"
                    : ""
                }`}
                value={
                  formData.programId
                }
                onChange={
                  handleChange
                }
                disabled={
                  updateMutation.isPending
                }
              >

                <option value="">
                  Select Program
                </option>

                {programs.map(
                  (program) => (
                    <option
                      key={
                        program.id
                      }
                      value={
                        program.id
                      }
                    >
                      {program.code
                        ? `${program.code} — ${program.name}`
                        : program.name}
                    </option>
                  )
                )}

              </select>

              {errors.programId && (
                <div className="invalid-feedback">
                  {
                    errors.programId
                  }
                </div>
              )}

            </div>

            {/* ====================================================
                PSO CODE
            ==================================================== */}

            <div className="mb-4">

              <label
                htmlFor="code"
                className="form-label fw-semibold"
              >
                PSO Code
                <span className="text-danger">
                  {" "}
                  *
                </span>
              </label>

              <input
                id="code"
                name="code"
                type="text"
                className={`form-control ${
                  errors.code
                    ? "is-invalid"
                    : ""
                }`}
                placeholder="PSO1"
                value={
                  formData.code
                }
                onChange={
                  handleChange
                }
                maxLength={20}
                disabled={
                  updateMutation.isPending
                }
              />

              {errors.code ? (
                <div className="invalid-feedback">
                  {errors.code}
                </div>
              ) : (
                <div className="form-text">
                  Use the format PSO1,
                  PSO2, PSO3, etc.
                </div>
              )}

            </div>

            {/* ====================================================
                DESCRIPTION
            ==================================================== */}

            <div className="mb-4">

              <label
                htmlFor="description"
                className="form-label fw-semibold"
              >
                Description
                <span className="text-danger">
                  {" "}
                  *
                </span>
              </label>

              <textarea
                id="description"
                name="description"
                className={`form-control ${
                  errors.description
                    ? "is-invalid"
                    : ""
                }`}
                rows={5}
                placeholder="Enter the Program Specific Outcome description..."
                value={
                  formData.description
                }
                onChange={
                  handleChange
                }
                disabled={
                  updateMutation.isPending
                }
              />

              {errors.description && (
                <div className="invalid-feedback">
                  {
                    errors.description
                  }
                </div>
              )}

            </div>

            {/* ====================================================
                STATUS
            ==================================================== */}

            <div className="mb-2">

              <div className="form-check form-switch">

                <input
                  id="status"
                  name="status"
                  type="checkbox"
                  className="form-check-input"
                  checked={
                    formData.status
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    updateMutation.isPending
                  }
                />

                <label
                  htmlFor="status"
                  className="form-check-label fw-semibold"
                >
                  Active
                </label>

              </div>

              <div
                className="form-text"
                style={{
                  marginLeft:
                    "34px",
                }}
              >
                Active PSOs will be
                available for Faculty CO–PSO
                mapping.
              </div>

            </div>

          </div>

          {/* ========================================================
              FOOTER
          ======================================================== */}

          <div
            className="card-footer bg-white border-top d-flex justify-content-end gap-2"
            style={{
              padding:
                "16px 24px",
            }}
          >

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={
                handleCancel
              }
              disabled={
                updateMutation.isPending
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={
                updateMutation.isPending
              }
            >

              {updateMutation.isPending ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  />

                  Updating...
                </>
              ) : (
                <>
                  <Check2Circle className="me-2" />
                  Update PSO
                </>
              )}

            </button>

          </div>

        </form>

      </div>
    </div>
  );
}

export default EditProgramSpecificOutcome;