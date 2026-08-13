import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import {
  useStudent,
  useUpdateStudent,
} from "../../hooks/useStudents";

import { useDepartments } from "../../hooks/useDepartments";
import { useSemesters } from "../../hooks/useSemesters";

function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: student,
    isLoading: studentLoading,
    isError,
    error,
  } = useStudent(id);

  const {
    data: departments = [],
    isLoading: departmentsLoading,
  } = useDepartments();

  const {
    data: semesters = [],
    isLoading: semestersLoading,
  } = useSemesters();

  const updateStudent = useUpdateStudent();

  const [formData, setFormData] = useState({
    usn: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    departmentId: "",
    semesterId: "",
  });

  useEffect(() => {
    if (!student) {
      return;
    }

    setFormData({
      usn: student.usn || "",
      firstName: student.firstName || "",
      lastName: student.lastName || "",
      email: student.email || "",
      phone: student.phone || "",

      departmentId:
        student.departmentId ||
        student.department?.id ||
        "",

      semesterId:
        student.semesterId ||
        student.semester?.id ||
        "",
    });
  }, [student]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.departmentId) {
      toast.error("Please select a department.");
      return;
    }

    if (!formData.semesterId) {
      toast.error("Please select a semester.");
      return;
    }

    try {
      await updateStudent.mutateAsync({
        id,
        data: formData,
      });

      toast.success("Student updated successfully.");

      navigate("/hod/students");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to update student."
      );
    }
  };

  if (
    studentLoading ||
    departmentsLoading ||
    semestersLoading
  ) {
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
              Loading student information...
            </p>

          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container-fluid mt-4">
        <div className="alert alert-danger">
          {error?.response?.data?.message ||
            "Unable to load student information."}
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">

      <div className="card shadow-sm">

        <div className="card-header">
          <h4 className="mb-1">
            Edit Student
          </h4>

          <small className="text-muted">
            Update student academic and personal information
          </small>
        </div>

        <div className="card-body">

          <form onSubmit={handleSubmit}>

            <div className="row">

              {/* USN */}
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  USN <span className="text-danger">*</span>
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="usn"
                  value={formData.usn}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* First Name */}
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  First Name{" "}
                  <span className="text-danger">*</span>
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Last Name */}
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Last Name{" "}
                  <span className="text-danger">*</span>
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Email */}
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Email{" "}
                  <span className="text-danger">*</span>
                </label>

                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Phone */}
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Phone
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              {/* Department */}
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Department{" "}
                  <span className="text-danger">*</span>
                </label>

                <select
                  className="form-select"
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select Department
                  </option>

                  {departments.map((department) => (
                    <option
                      key={department.id}
                      value={department.id}
                    >
                      {department.code} - {department.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Semester */}
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Semester{" "}
                  <span className="text-danger">*</span>
                </label>

                <select
                  className="form-select"
                  name="semesterId"
                  value={formData.semesterId}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select Semester
                  </option>

                  {semesters.map((semester) => (
                    <option
                      key={semester.id}
                      value={semester.id}
                    >
                      {semester.name ||
                        `Semester ${semester.semesterNumber}`}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            <div className="d-flex gap-2 mt-3">

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  navigate("/hod/students")
                }
                disabled={updateStudent.isPending}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={updateStudent.isPending}
              >
                {updateStudent.isPending
                  ? "Updating..."
                  : "Update Student"}
              </button>

            </div>

          </form>

        </div>
      </div>
    </div>
  );
}

export default EditStudent;