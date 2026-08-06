import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import {
  useProgram,
  useUpdateProgram,
} from "../../hooks/usePrograms";

import { useDepartments } from "../../hooks/useDepartments";

function EditProgram() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: program } = useProgram(id);

  const {
    data: departments = [],
  } = useDepartments();

  const updateProgram = useUpdateProgram();

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    duration: 4,
    departmentId: "",
  });

  useEffect(() => {
    if (program) {
      setFormData({
        code: program.code || "",
        name: program.name || "",
        duration: program.duration || 4,
        departmentId:
          program.departmentId || "",
      });
    }
  }, [program]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateProgram.mutateAsync({
        id,
        data: formData,
      });

      toast.success(
        "Program updated successfully."
      );

      navigate("/admin/programs");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to update program."
      );
    }
  };

  return (
    <div className="container-fluid mt-4">

      <div className="card shadow-sm">

        <div className="card-header">
          <h4>Edit Program</h4>
        </div>

        <div className="card-body">

          <form onSubmit={handleSubmit}>

            <div className="row">

              <div className="col-md-6 mb-3">

                <label className="form-label">
                  Program Code
                </label>

                <input
                  className="form-control"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="col-md-6 mb-3">

                <label className="form-label">
                  Program Name
                </label>

                <input
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="col-md-6 mb-3">

                <label className="form-label">
                  Duration
                </label>

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

                <label className="form-label">
                  Department
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

            </div>

            <button
              className="btn btn-primary"
              disabled={updateProgram.isPending}
            >
              {updateProgram.isPending
                ? "Updating..."
                : "Update Program"}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}

export default EditProgram;