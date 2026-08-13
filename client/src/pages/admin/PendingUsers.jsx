import toast from "react-hot-toast";

import {
  usePendingUsers,
  useApproveUser,
  useRejectUser,
} from "../../hooks/useAdmin";

function PendingUsers() {
  const {
    data: users = [],
    isLoading,
  } = usePendingUsers();

  const approveUser = useApproveUser();
  const rejectUser = useRejectUser();

  const handleApprove = async (id) => {
    try {
      await approveUser.mutateAsync(id);

      toast.success(
        "User approved successfully."
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to approve user."
      );
    }
  };

  const handleReject = async (id) => {
    if (
      !window.confirm(
        "Reject this registration?"
      )
    ) {
      return;
    }

    try {
      await rejectUser.mutateAsync(id);

      toast.success(
        "User rejected successfully."
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to reject user."
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

        <div className="card-header">
          <h4 className="mb-0">
            Pending User Approvals
          </h4>
        </div>

        <div className="card-body">

          <div className="table-responsive">

            <table className="table table-bordered table-hover align-middle">

              <thead className="table-dark">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th width="220">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>

                {users.length === 0 ? (

                  <tr>
                    <td
                      colSpan="5"
                      className="text-center"
                    >
                      No Pending Users Found.
                    </td>
                  </tr>

                ) : (

                  users.map((user) => (

                    <tr key={user.id}>

                      <td>
                        {user.firstName}{" "}
                        {user.lastName}
                      </td>

                      <td>{user.email}</td>

                      <td>
                        <span className="badge bg-info">
                          {user.role}
                        </span>
                      </td>

                      <td>
                        <span className="badge bg-warning text-dark">
                          Pending
                        </span>
                      </td>

                      <td>

                        <button
                          className="btn btn-success btn-sm me-2"
                          onClick={() =>
                            handleApprove(user.id)
                          }
                        >
                          Approve
                        </button>

                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() =>
                            handleReject(user.id)
                          }
                        >
                          Reject
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

export default PendingUsers;