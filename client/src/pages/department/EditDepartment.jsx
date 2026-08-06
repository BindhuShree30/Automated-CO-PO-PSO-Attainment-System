import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import {
  useDepartment,
  useUpdateDepartment,
} from "../../hooks/useDepartments";

function EditDepartment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: department } = useDepartment(id);
  

  console.log("ID:", id);
  console.log("Department:", department);
  const updateDepartment = useUpdateDepartment();

  const [formData, setFormData] = useState({
    code: "",
    name: "",
  });

  useEffect(() => {
    if (department) {
      setFormData({
        code: department.code || "",
        name: department.name || "",
      });
    }
  }, [department]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateDepartment.mutateAsync({
        id,
        data: formData,
      });

      toast.success(
        "Department updated successfully."
      );

      navigate("/admin/departments");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to update department."
      );
    }
  };

  return (
    <div className="container-fluid mt-4">

      <div className="card shadow-sm">

        <div className="card-header">
          <h4>Edit Department</h4>
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
              disabled={updateDepartment.isPending}
            >
              {updateDepartment.isPending
                ? "Updating..."
                : "Update Department"}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}

export default EditDepartment;