import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import {
  useCourses,
  useDeleteCourse,
} from "../../hooks/useCourses";

function CourseList() {
  const {
    data: courses = [],
    isLoading,
  } = useCourses();

  const deleteCourse = useDeleteCourse();

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this course?")) {
      return;
    }

    try {
      await deleteCourse.mutateAsync(id);

      toast.success(
        "Course deleted successfully."
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Unable to delete course."
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
            Courses
          </h4>

          <Link
            to="/admin/courses/add"
            className="btn btn-primary"
          >
            Add Course
          </Link>

        </div>

        <div className="card-body">

          <div className="table-responsive">

            <table className="table table-bordered table-hover">

              <thead className="table-dark">

                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Credits</th>
                  <th>Semester</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>

              </thead>

              <tbody>

                {courses.length === 0 ? (

                  <tr>
                    <td
                      colSpan="7"
                      className="text-center"
                    >
                      No Courses Found
                    </td>
                  </tr>

                ) : (

                  courses.map((course) => (

                    <tr key={course.id}>

                      <td>{course.code}</td>

                      <td>{course.name}</td>

                      <td>{course.credits}</td>

                      <td>{course.semester}</td>

                      <td>
                        {course.program?.department?.name}
                      </td>

                      <td>

                        {course.status ? (

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
                          to={`/admin/courses/edit/${course.id}`}
                          className="btn btn-warning btn-sm me-2"
                        >
                          Edit
                        </Link>

                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() =>
                            handleDelete(course.id)
                          }
                        >
                          Delete
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

export default CourseList;