import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import {
  useStudent,
  useUpdateStudent,
} from "../../hooks/useStudents";

import { usePrograms } from "../../hooks/usePrograms";

function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: student } = useStudent(id);
  const { data: programs = [] } = usePrograms();

  const updateStudent = useUpdateStudent();

  const [formData, setFormData] = useState({
    usn: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    programId: "",
  });

  useEffect(() => {
    if (student) {
      setFormData({
        usn: student.usn || "",
        firstName: student.firstName || "",
        lastName: student.lastName || "",
        email: student.email || "",
        phone: student.phone || "",
        programId: student.programId || "",
      });
    }
  }, [student]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateStudent.mutateAsync({
        id,
        data: formData,
      });

      toast.success("Student updated successfully.");

      navigate("/admin/students");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to update student."
      );
    }
  };

  return (
    <div className="container-fluid mt-4">

      <div className="card shadow-sm">

        <div className="card-header">
          <h4>Edit Student</h4>
        </div>

        <div className="card-body">

          <form onSubmit={handleSubmit}>

            <div className="row">

              <div className="col-md-6 mb-3">
                <label className="form-label">USN</label>

                <input
                  type="text"
                  className="form-control"
                  name="usn"
                  value={formData.usn}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Program</label>

                <select
                  className="form-select"
                  name="programId"
                  value={formData.programId}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select Program
                  </option>

                  {programs.map((program) => (
                    <option
                      key={program.id}
                      value={program.id}
                    >
                      {program.code} - {program.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">First Name</label>

                <input
                  type="text"
                  className="form-control"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Last Name</label>

                <input
                  type="text"
                  className="form-control"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Email</label>

                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Phone</label>

                <input
                  type="text"
                  className="form-control"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

            </div>

            <button
              className="btn btn-primary"
              disabled={updateStudent.isPending}
            >
              {updateStudent.isPending
                ? "Updating..."
                : "Update Student"}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}

export default EditStudent;