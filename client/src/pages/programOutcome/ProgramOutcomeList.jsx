import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import {
  useProgramOutcomes,
  useDeleteProgramOutcome,
} from "../../hooks/useProgramOutcomes";

function ProgramOutcomeList() {
  const {
    data: programOutcomes = [],
    isLoading,
  } = useProgramOutcomes();

  const deleteProgramOutcome =
    useDeleteProgramOutcome();

  // Sort PO1, PO2, ..., PO12 correctly
  const sortedProgramOutcomes = [...programOutcomes].sort((a, b) => {
    const aNum = parseInt(a.code.replace(/\D/g, ""), 10);
    const bNum = parseInt(b.code.replace(/\D/g, ""), 10);
    return aNum - bNum;
  });

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this Program Outcome?")) {
      return;
    }

    try {
      await deleteProgramOutcome.mutateAsync(id);

      toast.success(
        "Program Outcome deleted successfully."
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to delete Program Outcome."
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
            Program Outcomes
          </h4>

          <Link
            to="/admin/program-outcomes/add"
            className="btn btn-primary"
          >
            <i className="bi bi-plus-lg me-2"></i>
            Add Program Outcome
          </Link>

        </div>

        <div className="card-body">

          <div className="table-responsive">

            <table className="table table-bordered table-hover align-middle">

              <thead className="table-dark">

                <tr>
                  <th>Code</th>
                  <th>Description</th>
                  <th>Program</th>
                  <th>Status</th>
                  <th width="170">
                    Action
                  </th>
                </tr>

              </thead>

              <tbody>

                {sortedProgramOutcomes.length === 0 ? (

                  <tr>
                    <td
                      colSpan="5"
                      className="text-center"
                    >
                      No Program Outcomes Found.
                    </td>
                  </tr>

                ) : (

                  sortedProgramOutcomes.map((po) => (

                    <tr key={po.id}>

                      <td>{po.code}</td>

                      <td>{po.description}</td>

                      <td>
                        {po.program?.name}
                      </td>

                      <td>

                        {po.status ? (

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
                          to={`/admin/program-outcomes/edit/${po.id}`}
                          className="btn btn-warning btn-sm me-2"
                        >
                          <i className="bi bi-pencil-square"></i>
                        </Link>

                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() =>
                            handleDelete(po.id)
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

export default ProgramOutcomeList;