import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios";

function Faculty() {
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    const loadFaculty = useCallback(async () => {
        try {
            setLoading(true);

            const response = await api.get("/hod/faculty");

            console.log("FACULTY API RESPONSE:", response);
            console.log("FACULTY API DATA:", response.data);
            console.log(
                "FACULTY LIST:",
                response.data?.data
            );

            const facultyList = response.data?.data;

            if (Array.isArray(facultyList)) {
                setFaculty(facultyList);
            } else {
                setFaculty([]);
                console.error(
                    "Faculty API did not return an array:",
                    facultyList
                );
            }
        } catch (error) {
            console.error(
                "FACULTY LOAD ERROR:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                    "Failed to load faculty."
            );

            setFaculty([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadFaculty();
    }, [loadFaculty]);

    const updateStatus = async (id, action) => {
        try {
            setProcessingId(id);

            await api.patch(
                `/hod/faculty/${id}/${action}`
            );

            toast.success(
                action === "approve"
                    ? "Faculty approved successfully."
                    : "Faculty rejected successfully."
            );

            await loadFaculty();
        } catch (error) {
            console.error(
                "STATUS UPDATE ERROR:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                    "Failed to update faculty status."
            );
        } finally {
            setProcessingId(null);
        }
    };

    const changeStatus = async (id, status) => {
        try {
            setProcessingId(id);

            await api.patch(
                `/hod/faculty/${id}/status`,
                { status }
            );

            toast.success(
                "Faculty status updated successfully."
            );

            await loadFaculty();
        } catch (error) {
            console.error(
                "CHANGE STATUS ERROR:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                    "Failed to change faculty status."
            );
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="container-fluid py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h3 className="fw-bold mb-1">
                            Faculty Management
                        </h3>

                        <p className="text-muted mb-0">
                            Approve, reject, and manage faculty
                            accounts.
                        </p>
                    </div>
                </div>

                <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                        <div
                            className="spinner-border text-primary mb-3"
                            role="status"
                        />

                        <div>
                            Loading faculty...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold mb-1">
                        Faculty Management
                    </h3>

                    <p className="text-muted mb-0">
                        Approve, reject, and manage faculty
                        accounts.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={loadFaculty}
                    disabled={loading}
                >
                    Refresh
                </button>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                    {faculty.length === 0 ? (
                        <div className="text-center py-5">
                            <h5>
                                No faculty found
                            </h5>

                            <p className="text-muted mb-0">
                                There are currently no faculty
                                accounts to display.
                            </p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="px-4">
                                            Name
                                        </th>

                                        <th>
                                            Email
                                        </th>

                                        <th>
                                            Role
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th className="text-end px-4">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {faculty.map(
                                        (member) => (
                                            <tr
                                                key={
                                                    member.id
                                                }
                                            >
                                                <td className="px-4">
                                                    <strong>
                                                        {
                                                            member.firstName
                                                        }{" "}
                                                        {
                                                            member.lastName
                                                        }
                                                    </strong>
                                                </td>

                                                <td>
                                                    {
                                                        member.email
                                                    }
                                                </td>

                                                <td>
                                                    <span className="badge bg-secondary">
                                                        {
                                                            member.role
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    {member.status ===
                                                        "PENDING" && (
                                                        <span className="badge bg-warning text-dark">
                                                            PENDING
                                                        </span>
                                                    )}

                                                    {member.status ===
                                                        "APPROVED" && (
                                                        <span className="badge bg-success">
                                                            APPROVED
                                                        </span>
                                                    )}

                                                    {member.status ===
                                                        "REJECTED" && (
                                                        <span className="badge bg-danger">
                                                            REJECTED
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="text-end px-4">
                                                                        <div className="d-flex justify-content-end gap-2">

                                                                            {member.status === "PENDING" && (
                                                                                <>
                                                                                    <button
                                                                                        type="button"
                                                                                        className="btn btn-sm btn-success"
                                                                                        disabled={processingId === member.id}
                                                                                        onClick={() =>
                                                                                            updateStatus(
                                                                                                member.id,
                                                                                                "approve"
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        {processingId === member.id
                                                                                            ? "Processing..."
                                                                                            : "Approve"}
                                                                                    </button>

                                                                                    <button
                                                                                        type="button"
                                                                                        className="btn btn-sm btn-danger"
                                                                                        disabled={processingId === member.id}
                                                                                        onClick={() =>
                                                                                            updateStatus(
                                                                                                member.id,
                                                                                                "reject"
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        {processingId === member.id
                                                                                            ? "Processing..."
                                                                                            : "Reject"}
                                                                                    </button>
                                                                                </>
                                                                            )}

                                                                            {member.status === "APPROVED" && (
                                                                                <button
                                                                                    type="button"
                                                                                    className="btn btn-sm btn-outline-danger"
                                                                                    disabled={processingId === member.id}
                                                                                    onClick={() =>
                                                                                        changeStatus(
                                                                                            member.id,
                                                                                            "REJECTED"
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    {processingId === member.id
                                                                                        ? "Processing..."
                                                                                        : "Change to Rejected"}
                                                                                </button>
                                                                            )}

                                                                            {member.status === "REJECTED" && (
                                                                                <button
                                                                                    type="button"
                                                                                    className="btn btn-sm btn-outline-success"
                                                                                    disabled={processingId === member.id}
                                                                                    onClick={() =>
                                                                                        changeStatus(
                                                                                            member.id,
                                                                                            "APPROVED"
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    {processingId === member.id
                                                                                        ? "Processing..."
                                                                                        : "Change to Approved"}
                                                                                </button>
                                                                            )}

                                                                        </div>
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

export default Faculty;