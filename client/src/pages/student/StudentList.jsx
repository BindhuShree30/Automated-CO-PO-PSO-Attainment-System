import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import {
  useStudents,
  useDeleteStudent,
} from "../../hooks/useStudents";

function StudentList() {
  const {
    data: students = [],
    isLoading,
    isError,
    error,
  } = useStudents();

  const deleteMutation = useDeleteStudent();

  /**
   * ---------------------------------------------------------
   * Temporary Debugging
   * ---------------------------------------------------------
   * This helps verify the exact Department and Semester
   * data returned by the backend.
   *
   * Remove this block after the Department issue is confirmed.
   * ---------------------------------------------------------
   */
  if (students.length > 0) {
    console.log("========== STUDENT DEBUG ==========");
    console.log("FIRST STUDENT:", students[0]);
    console.log(
      "DEPARTMENT:",
      students[0]?.department
    );
    console.log(
      "DEPARTMENT ID:",
      students[0]?.departmentId
    );
    console.log(
      "SEMESTER:",
      students[0]?.semester
    );
    console.log(
      "SEMESTER ID:",
      students[0]?.semesterId
    );
    console.log("===================================");
  }

  /**
   * ---------------------------------------------------------
   * Delete Student
   * ---------------------------------------------------------
   */
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);

      toast.success("Student deleted successfully.");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to delete student."
      );
    }
  };

  /**
   * ---------------------------------------------------------
   * Get Student Name
   * ---------------------------------------------------------
   */
  const getStudentName = (student) => {
    const firstName = student.firstName || "";
    const lastName = student.lastName || "";

    return `${firstName} ${lastName}`.trim() || "-";
  };

  /**
   * ---------------------------------------------------------
   * Get Department Name
   * ---------------------------------------------------------
   *
   * Backend association:
   * Student.belongsTo(Department, {
   *   foreignKey: "departmentId",
   *   as: "department"
   * });
   *
   * Therefore department.name is the preferred value.
   * ---------------------------------------------------------
   */
  const getDepartmentName = (student) => {
    return (
      student.department?.name ||
      student.departmentName ||
      student.department_name ||
      "-"
    );
  };

  /**
   * ---------------------------------------------------------
   * Get Semester
   * ---------------------------------------------------------
   */
  const getSemester = (student) => {
    return (
      student.semester?.name ||
      student.semester?.semesterNumber ||
      student.semester?.number ||
      student.semesterNumber ||
      student.semesterName ||
      student.semester_name ||
      "-"
    );
  };

  /**
   * ---------------------------------------------------------
   * Loading State
   * ---------------------------------------------------------
   */
  if (isLoading) {
    return (
      <div className="container-fluid mt-4">
        <div className="card shadow-sm">
          <div className="card-body text-center py-5">
            <div
              className="spinner-border text-primary"
              role="status"
            >
              <span className="visually-hidden">
                Loading...
              </span>
            </div>

            <p className="mt-3 mb-0">
              Loading students...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * ---------------------------------------------------------
   * Error State
   * ---------------------------------------------------------
   */
  if (isError) {
    return (
      <div className="container-fluid mt-4">
        <div className="alert alert-danger">
          {error?.response?.data?.message ||
            "Unable to load students."}
        </div>
      </div>
    );
  }

  /**
   * ---------------------------------------------------------
   * Student List
   * ---------------------------------------------------------
   */
  return (
    <div className="container-fluid mt-4">
      <div className="card shadow-sm">

        {/* ================= HEADER ================= */}
        <div className="card-header d-flex justify-content-between align-items-center">
          <div>
            <h4 className="mb-1">
              Students
            </h4>

            <small className="text-muted">
              Manage students and enrollment records
            </small>
          </div>

          <div className="d-flex gap-2">

            {/* Bulk Upload */}
            <Link
              to="/hod/students/upload"
              className="btn btn-success"
            >
              <i className="bi bi-upload me-2"></i>
              Bulk Upload
            </Link>

            {/* Add Student */}
            <Link
              to="/hod/students/add"
              className="btn btn-primary"
            >
              <i className="bi bi-plus-lg me-2"></i>
              Add Student
            </Link>

          </div>
        </div>

        {/* ================= BODY ================= */}
        <div className="card-body">

          {/* Student Count */}
          <div className="mb-3">
            <span className="badge bg-primary">
              Total Students: {students.length}
            </span>
          </div>

          <div className="table-responsive">

            <table className="table table-bordered table-hover align-middle">

              <thead className="table-dark">
                <tr>
                  <th>USN</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Department</th>
                  <th>Semester</th>
                  <th
                    style={{
                      width: "150px",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>

                {students.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center py-4 text-muted"
                    >
                      No students found.
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id}>

                      {/* ================= USN ================= */}
                      <td>
                        <strong>
                          {student.usn || "-"}
                        </strong>
                      </td>

                      {/* ================= NAME ================= */}
                      <td>
                        {getStudentName(student)}
                      </td>

                      {/* ================= EMAIL ================= */}
                      <td>
                        {student.email || "-"}
                      </td>

                      {/* ================= PHONE ================= */}
                      <td>
                        {student.phone || "-"}
                      </td>

                      {/* ================= DEPARTMENT ================= */}
                      <td>
                        {getDepartmentName(student)}
                      </td>

                      {/* ================= SEMESTER ================= */}
                      <td>
                        {getSemester(student)}
                      </td>

                      {/* ================= ACTIONS ================= */}
                      <td>

                        {/* Edit */}
                        <Link
                          to={`/hod/students/edit/${student.id}`}
                          className="btn btn-warning btn-sm me-2"
                          title="Edit Student"
                        >
                          <i className="bi bi-pencil-square"></i>
                        </Link>

                        {/* Delete */}
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          title="Delete Student"
                          disabled={
                            deleteMutation.isPending
                          }
                          onClick={() =>
                            handleDelete(student.id)
                          }
                        >
                          {deleteMutation.isPending ? (
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                              aria-hidden="true"
                            ></span>
                          ) : (
                            <i className="bi bi-trash"></i>
                          )}
                        </button>

                      </td>

                    </tr>
                  ))
                )}

              </tbody>

            </table>

          </div>

        </div>
      </div>
    </div>
  );
}

export default StudentList;