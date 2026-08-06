import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useCreateProgram } from "../../hooks/usePrograms";
import { useDepartments } from "../../hooks/useDepartments";

function AddProgram() {
  const navigate = useNavigate();

  const createProgram = useCreateProgram();
  const { data: departments = [] } = useDepartments();

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    duration: 4,
    departmentId: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createProgram.mutateAsync(formData);

      toast.success("Program created successfully.");

      navigate("/admin/programs");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Unable to create program."
      );
    }
  };

  return (
    <div className="container-fluid mt-4">

      <div className="card shadow-sm">

        <div className="card-header">
          <h4>Add Program</h4>
        </div>

        <div className="card-body">

          <form onSubmit={handleSubmit}>

            <div className="row">

              <div className="col-md-6 mb-3">
                <label className="form-label">Program Code</label>

                <input
                  className="form-control"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Program Name</label>

                <input
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Duration</label>

                <input
                  type="number"
                  className="form-control"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Department</label>

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

            </div>

            <button className="btn btn-primary">
              Save Program
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}

export default AddProgram;