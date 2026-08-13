import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useCreateStudent } from "../../hooks/useStudents";
import { useDepartments } from "../../hooks/useDepartments";
import { useSemesters } from "../../hooks/useSemesters";

function AddStudent() {
  const navigate = useNavigate();

  const createStudent = useCreateStudent();

  const {
    data: departments = [],
    isLoading: departmentsLoading,
  } = useDepartments();

  const {
    data: semesters = [],
    isLoading: semestersLoading,
  } = useSemesters();

  const [formData, setFormData] = useState({
    usn: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    departmentId: "",
    semesterId: "",
  });

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
      await createStudent.mutateAsync(formData);

      toast.success("Student created successfully.");

      navigate("/hod/students");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to create student."
      );
    }
  };

  return (
    <div className="container-fluid mt-4">
      <div className="card shadow-sm">

        <div className="card-header">
          <h4 className="mb-1">
            Add Student
          </h4>

          <small className="text-muted">
            Add student academic and personal information
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
                  placeholder="Enter USN"
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
                  placeholder="Enter first name"
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
                  placeholder="Enter last name"
                  required
                />
              </div>

              {/* Email */}
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Email <span className="text-danger">*</span>
                </label>

                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
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
                  placeholder="Enter phone number"
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
                  disabled={departmentsLoading}
                >
                  <option value="">
                    {departmentsLoading
                      ? "Loading departments..."
                      : "Select Department"}
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
                  disabled={semestersLoading}
                >
                  <option value="">
                    {semestersLoading
                      ? "Loading semesters..."
                      : "Select Semester"}
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
                disabled={createStudent.isPending}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={
                  createStudent.isPending ||
                  departmentsLoading ||
                  semestersLoading
                }
              >
                {createStudent.isPending
                  ? "Saving..."
                  : "Save Student"}
              </button>

            </div>

          </form>

        </div>
      </div>
    </div>
  );
}

export default AddStudent;