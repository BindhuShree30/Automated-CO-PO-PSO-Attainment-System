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
  } = useStudents();

  const deleteMutation = useDeleteStudent();

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student?")) {
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

  if (isLoading) {
    return (
      <div className="container-fluid mt-4">
        <h5>Loading...</h5>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <div className="card shadow-sm">

        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">
            Students
          </h4>

          <Link
            to="/admin/students/add"
            className="btn btn-primary"
          >
            <i className="bi bi-plus-lg me-2"></i>
            Add Student
          </Link>
        </div>

        <div className="card-body">

          <div className="table-responsive">

            <table className="table table-bordered table-hover align-middle">

              <thead className="table-dark">
                <tr>
                  <th>USN</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Program</th>
                  <th>Status</th>
                  <th width="170">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>

                {students.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center"
                    >
                      No Students Found.
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id}>

                      <td>{student.usn}</td>

                      <td>
                        {student.firstName}{" "}
                        {student.lastName}
                      </td>

                      <td>{student.email}</td>

                      <td>
                        {student.phone || "-"}
                      </td>

                      <td>
                        {student.program?.name}
                      </td>

                      <td>
                        {student.status ? (
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
                          to={`/admin/students/edit/${student.id}`}
                          className="btn btn-warning btn-sm me-2"
                        >
                          <i className="bi bi-pencil-square"></i>
                        </Link>

                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() =>
                            handleDelete(student.id)
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

        </div>

      </div>
    </div>
  );
}

export default StudentList;