import { useEffect, useState } from "react";

import {
  CheckCircle,
  ArrowRepeat,
} from "react-bootstrap-icons";

import api from "../../api/axios";

import {
  getCourseOfferings,
  updateCourseOffering,
} from "../../services/courseOfferingService";

function FacultyAssignment() {
  const [courseOfferings, setCourseOfferings] =
    useState([]);

  const [faculties, setFaculties] =
    useState([]);

  const [assignments, setAssignments] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const [savingId, setSavingId] =
    useState(null);

  const [error, setError] =
    useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        offeringsResponse,
        facultiesResponse,
      ] = await Promise.all([
        getCourseOfferings(),
        api.get("/faculties"),
      ]);

      const offerings =
        offeringsResponse?.data || [];

      const facultyList =
        facultiesResponse?.data?.data || [];

      setCourseOfferings(offerings);
      setFaculties(facultyList);

      const initialAssignments = {};

      offerings.forEach((offering) => {
        initialAssignments[offering.id] =
          offering.facultyId ||
          offering.faculty?.id ||
          "";
      });

      setAssignments(initialAssignments);
    } catch (err) {
      console.error(
        "Failed to load faculty assignments:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to load faculty assignments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFacultyChange = (
    offeringId,
    facultyId
  ) => {
    setAssignments((previous) => ({
      ...previous,
      [offeringId]: facultyId,
    }));
  };

  const handleSave = async (offering) => {
    const facultyId =
      assignments[offering.id];

    if (!facultyId) {
      window.alert(
        "Please select a faculty member."
      );
      return;
    }

    try {
      setSavingId(offering.id);
      setError("");

      await updateCourseOffering(
        offering.id,
        {
          facultyId,
        }
      );

      await loadData();

      window.alert(
        "Faculty assigned successfully."
      );
    } catch (err) {
      console.error(
        "Failed to assign faculty:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to assign faculty."
      );
    } finally {
      setSavingId(null);
    }
  };

  const getFacultyName = (faculty) => {
    if (!faculty) {
      return "Not Assigned";
    }

    return `${faculty.firstName || ""} ${
      faculty.lastName || ""
    }`.trim();
  };

  return (
    <div className="container-fluid py-4">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h3 className="fw-bold mb-1">
            Faculty Assignment
          </h3>

          <p className="text-muted mb-0">
            Assign or reassign faculty members to
            course offerings.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={loadData}
          disabled={loading}
        >
          <ArrowRepeat className="me-2" />
          Refresh
        </button>

      </div>


      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}


      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="card border-0 shadow-sm">

        <div className="card-body p-0">

          {loading ? (
            <div className="text-center py-5">

              <div
                className="spinner-border text-primary"
                role="status"
              />

              <p className="text-muted mt-3">
                Loading faculty assignments...
              </p>

            </div>
          ) : courseOfferings.length === 0 ? (
            <div className="text-center py-5">

              <h5 className="fw-semibold">
                No Course Offerings Found
              </h5>

              <p className="text-muted mb-0">
                Create course offerings before assigning
                faculty.
              </p>

            </div>
          ) : (
            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">

                  <tr>
                    <th>#</th>
                    <th>Course</th>
                    <th>Batch</th>
                    <th>Semester</th>
                    <th>Section</th>
                    <th>Current Faculty</th>
                    <th style={{ minWidth: "260px" }}>
                      Assign Faculty
                    </th>
                    <th className="text-center">
                      Action
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {courseOfferings.map(
                    (offering, index) => (
                      <tr key={offering.id}>

                        <td>
                          {index + 1}
                        </td>

                        <td>
                          <div className="fw-semibold">
                            {offering.course?.code ||
                              "-"}
                          </div>

                          <small className="text-muted">
                            {offering.course?.name ||
                              "Course"}
                          </small>
                        </td>

                        <td>
                          {offering.batch?.name ||
                            "-"}
                        </td>

                        <td>
                          {offering.semester
                            ?.semesterNumber
                            ? `Semester ${offering.semester.semesterNumber}`
                            : "-"}
                        </td>

                        <td>
                          {offering.section || "-"}
                        </td>

                        <td>
                          <span className="fw-semibold">
                            {getFacultyName(
                              offering.faculty
                            )}
                          </span>
                        </td>

                        <td>

                          <select
                            className="form-select"
                            value={
                              assignments[
                                offering.id
                              ] || ""
                            }
                            onChange={(event) =>
                              handleFacultyChange(
                                offering.id,
                                event.target.value
                              )
                            }
                          >

                            <option value="">
                              Select Faculty
                            </option>

                            {faculties
                              .filter(
                                (faculty) =>
                                  faculty.status !==
                                  false
                              )
                              .map(
                                (faculty) => (
                                  <option
                                    key={
                                      faculty.id
                                    }
                                    value={
                                      faculty.id
                                    }
                                  >
                                    {
                                      faculty.employeeId
                                    }{" "}
                                    -{" "}
                                    {
                                      faculty.firstName
                                    }{" "}
                                    {
                                      faculty.lastName
                                    }
                                  </option>
                                )
                              )}

                          </select>

                        </td>

                        <td>

                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            disabled={
                              savingId ===
                              offering.id
                            }
                            onClick={() =>
                              handleSave(
                                offering
                              )
                            }
                          >

                            {savingId ===
                            offering.id ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-2"
                                  role="status"
                                />
                                Saving
                              </>
                            ) : (
                              <>
                                <CheckCircle className="me-2" />
                                Assign
                              </>
                            )}

                          </button>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default FacultyAssignment;