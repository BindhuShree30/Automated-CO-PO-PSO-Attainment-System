/**
 * ------------------------------------------------------------------
 * Course Offering List
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * HOD can:
 * - View course offerings
 * - Add offering
 * - Edit offering
 * - Delete offering
 * ------------------------------------------------------------------
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash, Plus } from "react-bootstrap-icons";
import { toast } from "react-toastify";

import {
  useCourseOfferings,
  useDeleteCourseOffering,
} from "../../hooks/useCourseOfferings";

function CourseOfferingList() {
  const {
    data: courseOfferings = [],
    isLoading,
    isError,
    error,
  } = useCourseOfferings();

  const deleteMutation =
    useDeleteCourseOffering();

  const [deletingId, setDeletingId] =
    useState(null);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this course offering?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);

      await deleteMutation.mutateAsync(id);

      toast.success(
        "Course offering deleted successfully."
      );
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Unable to delete course offering."
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="container-fluid p-4">
        <div className="text-center py-5">
          Loading course offerings...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-danger">
          {error?.response?.data?.message ||
            "Unable to load course offerings."}
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            Course Offerings
          </h2>

          <p className="text-muted mb-0">
            Manage course offerings and faculty assignments.
          </p>
        </div>

        <Link
          to="/hod/course-offerings/add"
          className="btn btn-primary d-flex align-items-center gap-2"
        >
          <Plus />
          Add Course Offering
        </Link>

      </div>

      {/* Summary */}
      <div className="row mb-4">

        <div className="col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <small className="text-muted">
                Total Offerings
              </small>

              <h3 className="fw-bold mt-2 mb-0">
                {courseOfferings.length}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <small className="text-muted">
                Active Offerings
              </small>

              <h3 className="fw-bold mt-2 mb-0">
                {
                  courseOfferings.filter(
                    (item) => item.status === true
                  ).length
                }
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <small className="text-muted">
                Inactive Offerings
              </small>

              <h3 className="fw-bold mt-2 mb-0">
                {
                  courseOfferings.filter(
                    (item) => item.status === false
                  ).length
                }
              </h3>
            </div>
          </div>
        </div>

      </div>

      {/* Table */}
      <div className="card shadow-sm border-0">

        <div className="card-body">

          <div className="table-responsive">

            <table className="table table-hover align-middle">

              <thead>
                <tr>
                  <th>#</th>
                  <th>Course</th>
                  <th>Batch</th>
                  <th>Semester</th>
                  <th>Section</th>
                  <th>Faculty</th>
                  <th>Status</th>
                  <th className="text-end">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>

                {courseOfferings.length === 0 ? (

                  <tr>
                    <td
                      colSpan="8"
                      className="text-center py-5 text-muted"
                    >
                      No course offerings found.
                    </td>
                  </tr>

                ) : (

                  courseOfferings.map(
                    (offering, index) => {

                      const course =
                        offering.course;

                      const batch =
                        offering.batch;

                      const semester =
                        offering.semester;

                      const faculty =
                        offering.faculty;

                      return (
                        <tr key={offering.id}>

                          <td>
                            {index + 1}
                          </td>

                          <td>
                            <div className="fw-semibold">
                              {course?.code ||
                                offering.courseId}
                            </div>

                            <small className="text-muted">
                              {course?.name || "—"}
                            </small>
                          </td>

                          <td>
                            {batch?.name ||
                              `${batch?.startYear || ""} - ${
                                batch?.endYear || ""
                              }` ||
                              offering.batchId}
                          </td>

                          <td>
                            {semester?.semesterNumber
                              ? `Semester ${semester.semesterNumber}`
                              : offering.semesterId}
                          </td>

                          <td>
                            {offering.section || "—"}
                          </td>

                          <td>
                            {faculty ? (
                              <>
                                <div className="fw-semibold">
                                  {faculty.firstName}{" "}
                                  {faculty.lastName}
                                </div>

                                <small className="text-muted">
                                  {faculty.employeeId ||
                                    faculty.email ||
                                    ""}
                                </small>
                              </>
                            ) : (
                              <span className="text-muted">
                                Not Assigned
                              </span>
                            )}
                          </td>

                          <td>
                            {offering.status ? (
                              <span className="badge bg-success">
                                Active
                              </span>
                            ) : (
                              <span className="badge bg-secondary">
                                Inactive
                              </span>
                            )}
                          </td>

                          <td className="text-end">

                            <div className="d-flex justify-content-end gap-2">

                              <Link
                                to={`/hod/course-offerings/edit/${offering.id}`}
                                className="btn btn-sm btn-outline-primary"
                                title="Edit"
                              >
                                <Pencil />
                              </Link>

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                title="Delete"
                                disabled={
                                  deletingId ===
                                  offering.id
                                }
                                onClick={() =>
                                  handleDelete(
                                    offering.id
                                  )
                                }
                              >
                                <Trash />
                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}

export default CourseOfferingList;