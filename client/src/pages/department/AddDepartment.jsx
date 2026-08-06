import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useCreateDepartment } from "../../hooks/useDepartments";

function AddDepartment() {
  const navigate = useNavigate();

  const createDepartment =
    useCreateDepartment();

  const [formData, setFormData] = useState({
    code: "",
    name: "",
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
      await createDepartment.mutateAsync(
        formData
      );

      toast.success(
        "Department created successfully."
      );

      navigate("/admin/departments");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to create department."
      );
    }
  };

  return (
    <div className="container-fluid mt-4">

      <div className="card shadow-sm">

        <div className="card-header">
          <h4>Add Department</h4>
        </div>

        <div className="card-body">

          <form onSubmit={handleSubmit}>

            <div className="mb-3">
              <label className="form-label">
                Department Code
              </label>

              <input
                className="form-control"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Department Name
              </label>

              <input
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <button
              className="btn btn-primary"
              disabled={
                createDepartment.isPending
              }
            >
              {createDepartment.isPending
                ? "Saving..."
                : "Save Department"}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}

export default AddDepartment;