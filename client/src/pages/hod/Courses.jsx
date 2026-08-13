import { useState } from "react";
import toast from "react-hot-toast";

import {
  useCourses,
  useCreateCourse,
  useUpdateCourse,
  useDeleteCourse,
} from "../../hooks/useCourses";

import { useDepartments } from "../../hooks/useDepartments";

function Courses() {
  const {
    data: courses = [],
    isLoading,
    isError,
    error,
  } = useCourses();

  const { data: departments = [] } = useDepartments();

  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();

  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    credits: "",
    semester: "",
    departmentId: "",
    status: true,
  });

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      credits: "",
      semester: "",
      departmentId: "",
      status: true,
    });

    setEditingCourse(null);
  };

  // =========================================================
  // OPEN ADD COURSE
  // =========================================================

  const handleAddCourse = () => {
    resetForm();
    setShowModal(true);
  };

  // =========================================================
  // OPEN EDIT COURSE
  // =========================================================

  const handleEditCourse = (course) => {
    setEditingCourse(course);

    setFormData({
      name: course.name || "",
      code: course.code || "",
      credits: course.credits ?? "",
      semester: course.semester ?? "",
      departmentId:
        course.departmentId ||
        course.department?.id ||
        "",
      status: course.status ?? true,
    });

    setShowModal(true);
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const handleCloseModal = () => {
    if (
      createCourse.isPending ||
      updateCourse.isPending
    ) {
      return;
    }

    setShowModal(false);
    resetForm();
  };

  // =========================================================
  // INPUT CHANGE
  // =========================================================

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // =========================================================
  // SAVE COURSE
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Course name is required.");
      return;
    }

    if (!formData.code.trim()) {
      toast.error("Course code is required.");
      return;
    }

    if (!formData.departmentId) {
      toast.error("Please select a department.");
      return;
    }

    if (!formData.semester) {
      toast.error("Semester is required.");
      return;
    }

    if (!formData.credits) {
      toast.error("Credits are required.");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      credits: Number(formData.credits),
      semester: Number(formData.semester),
      departmentId: formData.departmentId,
      status: Boolean(formData.status),
    };

    try {
      if (editingCourse) {
        await updateCourse.mutateAsync({
          id: editingCourse.id,
          data: payload,
        });

        toast.success(
          "Course updated successfully."
        );
      } else {
        await createCourse.mutateAsync(payload);

        toast.success(
          "Course created successfully."
        );
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to save course."
      );
    }
  };

  // =========================================================
  // DELETE COURSE
  // =========================================================

  const handleDelete = async (course) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${course.code} - ${course.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteCourse.mutateAsync(course.id);

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

  // =========================================================
  // GET DEPARTMENT
  // =========================================================

  const getDepartment = (course) => {
    if (course.department) {
      return course.department;
    }

    return departments.find(
      (department) =>
        department.id === course.departmentId
    );
  };

  // =========================================================
  // LOADING
  // =========================================================

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
              Loading courses...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (isError) {
    return (
      <div className="container-fluid mt-4">
        <div className="alert alert-danger">
          {error?.response?.data?.message ||
            "Unable to load courses."}
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="container-fluid mt-4">
      <div className="card shadow-sm">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="card-header d-flex justify-content-between align-items-center">

          <div>
            <h4 className="mb-1">
              Course Management
            </h4>

            <small className="text-muted">
              Manage courses, departments, semesters
              and credits
            </small>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAddCourse}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Add Course
          </button>

        </div>

        {/* =====================================================
            BODY
        ====================================================== */}

        <div className="card-body">

          <div className="mb-3">
            <span className="badge bg-primary">
              Total Courses: {courses.length}
            </span>
          </div>

          <div className="table-responsive">

            <table className="table table-bordered table-hover align-middle">

              <thead className="table-dark">

                <tr>

                  <th style={{ width: "130px" }}>
                    Code
                  </th>

                  <th>
                    Course Name
                  </th>

                  <th>
                    Department
                  </th>

                  <th>
                    Semester
                  </th>

                  <th>
                    Credits
                  </th>

                  <th>
                    Status
                  </th>

                  <th style={{ width: "130px" }}>
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {courses.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center py-4 text-muted"
                    >
                      No courses found.
                    </td>
                  </tr>
                ) : (
                  courses.map((course) => {

                    const department =
                      getDepartment(course);

                    return (
                      <tr key={course.id}>

                        {/* CODE */}

                        <td>
                          <strong>
                            {course.code}
                          </strong>
                        </td>

                        {/* COURSE NAME */}

                        <td>
                          {course.name}
                        </td>

                        {/* DEPARTMENT */}

                        <td>
                          {department ? (
                            <div>
                              <strong>
                                {department.code}
                              </strong>

                              <div className="small text-muted">
                                {department.name}
                              </div>
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>

                        {/* SEMESTER */}

                        <td>
                          <span className="badge bg-info text-dark">
                            Semester{" "}
                            {course.semester}
                          </span>
                        </td>

                        {/* CREDITS */}

                        <td>
                          <span className="badge bg-secondary">
                            {course.credits}
                          </span>
                        </td>

                        {/* STATUS */}

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

                        {/* ACTIONS */}

                        <td>

                          <button
                            type="button"
                            className="btn btn-warning btn-sm me-2"
                            title="Edit Course"
                            onClick={() =>
                              handleEditCourse(course)
                            }
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>

                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            title="Delete Course"
                            disabled={
                              deleteCourse.isPending
                            }
                            onClick={() =>
                              handleDelete(course)
                            }
                          >
                            {deleteCourse.isPending ? (
                              <span
                                className="spinner-border spinner-border-sm"
                                role="status"
                              ></span>
                            ) : (
                              <i className="bi bi-trash"></i>
                            )}
                          </button>

                        </td>

                      </tr>
                    );
                  })
                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

      {/* =======================================================
          ADD / EDIT COURSE MODAL
      ======================================================== */}

      {showModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{
            backgroundColor:
              "rgba(0, 0, 0, 0.5)",
          }}
        >

          <div className="modal-dialog modal-lg modal-dialog-centered">

            <div className="modal-content">

              {/* MODAL HEADER */}

              <div className="modal-header">

                <div>

                  <h5 className="modal-title">
                    {editingCourse
                      ? "Edit Course"
                      : "Add Course"}
                  </h5>

                  <small className="text-muted">
                    {editingCourse
                      ? "Update course information"
                      : "Create a new course"}
                  </small>

                </div>

                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                  disabled={
                    createCourse.isPending ||
                    updateCourse.isPending
                  }
                ></button>

              </div>

              {/* MODAL BODY */}

              <form onSubmit={handleSubmit}>

                <div className="modal-body">

                  <div className="row">

                    {/* COURSE CODE */}

                    <div className="col-md-6 mb-3">

                      <label className="form-label">
                        Course Code
                        <span className="text-danger">
                          {" "}*
                        </span>
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        placeholder="e.g. 21CS51"
                        required
                      />

                    </div>

                    {/* COURSE NAME */}

                    <div className="col-md-6 mb-3">

                      <label className="form-label">
                        Course Name
                        <span className="text-danger">
                          {" "}*
                        </span>
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Database Management Systems"
                        required
                      />

                    </div>

                    {/* DEPARTMENT */}

                    <div className="col-md-6 mb-3">

                      <label className="form-label">
                        Department
                        <span className="text-danger">
                          {" "}*
                        </span>
                      </label>

                      <select
                        className="form-select"
                        name="departmentId"
                        value={
                          formData.departmentId
                        }
                        onChange={handleChange}
                        required
                      >

                        <option value="">
                          Select Department
                        </option>

                        {departments.map(
                          (department) => (
                            <option
                              key={department.id}
                              value={department.id}
                            >
                              {department.code} -{" "}
                              {department.name}
                            </option>
                          )
                        )}

                      </select>

                    </div>

                    {/* SEMESTER */}

                    <div className="col-md-6 mb-3">

                      <label className="form-label">
                        Semester
                        <span className="text-danger">
                          {" "}*
                        </span>
                      </label>

                      <select
                        className="form-select"
                        name="semester"
                        value={formData.semester}
                        onChange={handleChange}
                        required
                      >

                        <option value="">
                          Select Semester
                        </option>

                        {[
                          1,
                          2,
                          3,
                          4,
                          5,
                          6,
                          7,
                          8,
                        ].map((semester) => (
                          <option
                            key={semester}
                            value={semester}
                          >
                            Semester {semester}
                          </option>
                        ))}

                      </select>

                    </div>

                    {/* CREDITS */}

                    <div className="col-md-6 mb-3">

                      <label className="form-label">
                        Credits
                        <span className="text-danger">
                          {" "}*
                        </span>
                      </label>

                      <select
                        className="form-select"
                        name="credits"
                        value={formData.credits}
                        onChange={handleChange}
                        required
                      >

                        <option value="">
                          Select Credits
                        </option>

                        {[
                          1,
                          2,
                          3,
                          4,
                          5,
                          6,
                          7,
                          8,
                        ].map((credit) => (
                          <option
                            key={credit}
                            value={credit}
                          >
                            {credit}{" "}
                            {credit === 1
                              ? "Credit"
                              : "Credits"}
                          </option>
                        ))}

                      </select>

                    </div>

                    {/* STATUS */}

                    <div className="col-12 mb-3">

                      <div className="form-check form-switch">

                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="courseStatus"
                          name="status"
                          checked={
                            formData.status
                          }
                          onChange={handleChange}
                        />

                        <label
                          className="form-check-label"
                          htmlFor="courseStatus"
                        >
                          Active Course
                        </label>

                      </div>

                    </div>

                  </div>

                </div>

                {/* MODAL FOOTER */}

                <div className="modal-footer">

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseModal}
                    disabled={
                      createCourse.isPending ||
                      updateCourse.isPending
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={
                      createCourse.isPending ||
                      updateCourse.isPending
                    }
                  >

                    {createCourse.isPending ||
                    updateCourse.isPending ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>

                        {editingCourse
                          ? "Updating..."
                          : "Saving..."}
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-2"></i>

                        {editingCourse
                          ? "Update Course"
                          : "Save Course"}
                      </>
                    )}

                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Courses;