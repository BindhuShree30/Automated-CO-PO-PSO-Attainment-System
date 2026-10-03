/**
 * ------------------------------------------------------------------
 * Course Registration List
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Faculty can:
 * - View their assigned Course Offerings
 * - Select a Course Offering
 * - Register students
 *
 * Faculty cannot:
 * - Create Course Offerings
 * - Edit Course Offerings
 * - Delete Course Offerings
 * - Assign Faculty
 * ------------------------------------------------------------------
 */

import { Link } from "react-router-dom";
import { Book, People } from "react-bootstrap-icons";

import { useMyCourseOfferings } from "../../hooks/useCourseOfferings";

function CourseRegistrationList() {
    const {
        data: courseOfferings = [],
        isLoading,
        isError,
        error,
    } = useMyCourseOfferings();

    if (isLoading) {
        return (
            <div className="container-fluid p-4">
                <div className="text-center py-5">
                    Loading your course offerings...
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="container-fluid p-4">
                <div className="alert alert-danger">
                    {error?.response?.data?.message ||
                        "Unable to load your course offerings."}
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid p-4">

            {/* Header */}
            <div className="mb-4">
                <h2 className="fw-bold mb-1">
                    Course Registration
                </h2>

                <p className="text-muted mb-0">
                    Select one of your assigned courses to register
                    students.
                </p>
            </div>

            {/* Summary */}
            <div className="row mb-4">
                <div className="col-md-4">
                    <div className="card shadow-sm border-0">
                        <div className="card-body">
                            <small className="text-muted">
                                My Course Offerings
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
                                Active Courses
                            </small>

                            <h3 className="fw-bold mt-2 mb-0">
                                {
                                    courseOfferings.filter(
                                        (item) =>
                                            item.status === true
                                    ).length
                                }
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Offerings */}
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
                                    <th>Status</th>
                                    <th className="text-end">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>

                                {courseOfferings.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="text-center py-5 text-muted"
                                        >
                                            No course offerings are
                                            assigned to you.
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

                                            return (
                                                <tr
                                                    key={
                                                        offering.id
                                                    }
                                                >
                                                    <td>
                                                        {index + 1}
                                                    </td>

                                                    {/* Course */}
                                                    <td>
                                                        <div className="fw-semibold">
                                                            {course?.code ||
                                                                offering.courseId}
                                                        </div>

                                                        <small className="text-muted">
                                                            {course?.name ||
                                                                "—"}
                                                        </small>
                                                    </td>

                                                    {/* Batch */}
                                                    <td>
                                                        {batch?.name ||
                                                            `${batch?.startYear || ""} - ${
                                                                batch?.endYear || ""
                                                            }`}
                                                    </td>

                                                    {/* Semester */}
                                                    <td>
                                                        {semester?.semesterNumber
                                                            ? `Semester ${semester.semesterNumber}`
                                                            : offering.semesterId}
                                                    </td>

                                                    {/* Section */}
                                                    <td>
                                                        {offering.section ||
                                                            "—"}
                                                    </td>

                                                    {/* Status */}
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

                                                    {/* Action */}
                                                    <td className="text-end">
                                                        <Link
                                                            to={`/faculty/course-registration/${offering.id}`}
                                                            className="btn btn-sm btn-primary d-inline-flex align-items-center gap-2"
                                                            state={{
                                                                courseOffering:
                                                                    offering,
                                                            }}
                                                        >
                                                            <People />
                                                            Register Students
                                                        </Link>
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

export default CourseRegistrationList;