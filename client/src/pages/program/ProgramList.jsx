import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import {
  usePrograms,
  useDeleteProgram,
} from "../../hooks/usePrograms";

function ProgramList() {
  const {
    data: programs = [],
    isLoading,
  } = usePrograms();

  const deleteProgram = useDeleteProgram();

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this program?")) {
      return;
    }

    try {
      await deleteProgram.mutateAsync(id);

      toast.success("Program deleted successfully.");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to delete program."
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

          <h4 className="mb-0">Programs</h4>

          <Link
            to="/admin/programs/add"
            className="btn btn-primary"
          >
            <i className="bi bi-plus-lg me-2"></i>
            Add Program
          </Link>

        </div>

        <div className="card-body">

          <div className="table-responsive">

            <table className="table table-bordered table-hover align-middle">

              <thead className="table-dark">

                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th width="170">Action</th>
                </tr>

              </thead>

              <tbody>

                {programs.length === 0 ? (

                  <tr>
                    <td colSpan="6" className="text-center">
                      No Programs Found.
                    </td>
                  </tr>

                ) : (

                  programs.map((program) => (

                    <tr key={program.id}>

                      <td>{program.code}</td>

                      <td>{program.name}</td>

                      <td>
                        {program.department?.name}
                      </td>

                      <td>{program.duration} Years</td>

                      <td>

                        {program.status ? (
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
                          to={`/admin/programs/edit/${program.id}`}
                          className="btn btn-warning btn-sm me-2"
                        >
                          <i className="bi bi-pencil-square"></i>
                        </Link>

                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() =>
                            handleDelete(program.id)
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

export default ProgramList;