import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import {
  useCourseOutcomesByCourse,
  useDeleteCourseOutcome,
} from "../../hooks/useCourseOutcomes";

import { useCourses } from "../../hooks/useCourses";

function CourseOutcomeList() {
  const [courseId, setCourseId] = useState("");

  const { data: courses = [] } = useCourses();

  const {
    data: courseOutcomes = [],
    isLoading,
  } = useCourseOutcomesByCourse(courseId);

  const deleteMutation = useDeleteCourseOutcome();

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this Course Outcome?")) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);

      toast.success(
        "Course Outcome deleted successfully."
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to delete Course Outcome."
      );
    }
  };

  return (
    <div className="container-fluid mt-4">

      <div className="card shadow-sm">

        <div className="card-header d-flex justify-content-between align-items-center">

          <h4 className="mb-0">
            Course Outcomes
          </h4>

          <Link
            to="/faculty/course-outcomes/add"
            className="btn btn-primary"
          >
            <i className="bi bi-plus-lg me-2"></i>
            Add Course Outcome
          </Link>

        </div>

        <div className="card-body">

          {/* Course Filter */}

          <div className="row mb-4">

            <div className="col-md-5">

              <label className="form-label">
                Select Course
              </label>

              <select
                className="form-select"
                value={courseId}
                onChange={(e) =>
                  setCourseId(e.target.value)
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

          {!courseId ? (

            <div className="alert alert-info">
              Please select a course to view Course Outcomes.
            </div>

          ) : isLoading ? (

            <h5>Loading...</h5>

          ) : (

            <div className="table-responsive">

              <table className="table table-bordered table-hover align-middle">

                <thead className="table-dark">

                  <tr>

                    <th>CO</th>

                    <th>Description</th>

                    <th>Bloom Level</th>

                    <th>Target</th>

                    <th>Status</th>

                    <th width="170">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {courseOutcomes.length === 0 ? (

                    <tr>

                      <td
                        colSpan="6"
                        className="text-center"
                      >
                        No Course Outcomes Found.
                      </td>

                    </tr>

                  ) : (

                    courseOutcomes.map((co) => (

                      <tr key={co.id}>

                        <td>{co.code}</td>

                        <td>{co.description}</td>

                        <td>{co.bloomLevel}</td>

                        <td>{parseFloat(co.targetAttainment)}%</td>
                        <td>

                          {co.status ? (

                            <span className="badge bg-success">
                              Active
                            </span>

                          ) : (

                            <span className="badge bg-danger">
                              Inactive
                            </span>

                          )}

                        </td>

                        <td>

                          <Link
                            to={`/faculty/course-outcomes/edit/${co.id}`}
                            className="btn btn-warning btn-sm me-2"
                          >
                            <i className="bi bi-pencil-square"></i>
                          </Link>

                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() =>
                              handleDelete(co.id)
                            }
                          >
                            <i className="bi bi-trash"></i>
                          </button>

                        </td>

                      </tr>

                    ))

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

export default CourseOutcomeList;