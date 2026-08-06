import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import {
  useDepartments,
  useDeleteDepartment,
} from "../../hooks/useDepartments";

function DepartmentList() {
  const {
    data: departments = [],
    isLoading,
  } = useDepartments();

  const deleteDepartment = useDeleteDepartment();

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this department?")) {
      return;
    }

    try {
      await deleteDepartment.mutateAsync(id);

      toast.success(
        "Department deleted successfully."
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to delete department."
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
            Departments
          </h4>

          <Link
            to="/admin/departments/add"
            className="btn btn-primary"
          >
            <i className="bi bi-plus-lg me-2"></i>
            Add Department
          </Link>

        </div>

        <div className="card-body">

          <div className="table-responsive">

            <table className="table table-bordered table-hover align-middle">

              <thead className="table-dark">

                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th width="170">
                    Action
                  </th>
                </tr>

              </thead>

              <tbody>

                {departments.length === 0 ? (

                  <tr>

                    <td
                      colSpan="4"
                      className="text-center"
                    >
                      No Departments Found.
                    </td>

                  </tr>

                ) : (

                  departments.map((department) => (

                    <tr key={department.id}>

                      <td>{department.code}</td>

                      <td>{department.name}</td>

                      <td>

                        {department.status ? (

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
                          to={`/admin/departments/edit/${department.id}`}
                          className="btn btn-warning btn-sm me-2"
                        >
                          <i className="bi bi-pencil-square"></i>
                        </Link>

                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() =>
                            handleDelete(department.id)
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

export default DepartmentList;