import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { usePrograms } from "../../hooks/usePrograms";
import { useCreateProgramOutcome } from "../../hooks/useProgramOutcomes";

function AddProgramOutcome() {

  const navigate = useNavigate();

  const createProgramOutcome =
    useCreateProgramOutcome();

  const { data: programs = [] } =
    usePrograms();

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    programId: "",
    status: true,
  });

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]:
        name === "status"
          ? value === "true"
          : value,
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await createProgramOutcome.mutateAsync(
        formData
      );

      toast.success(
        "Program Outcome created successfully."
      );

      navigate("/admin/program-outcomes");

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Unable to create Program Outcome."
      );

    }

  };

  return (

    <div className="container-fluid mt-4">

      <div className="card shadow-sm">

        <div className="card-header">
          <h4>Add Program Outcome</h4>
        </div>

        <div className="card-body">

          <form onSubmit={handleSubmit}>

            <div className="row">

              <div className="col-md-6 mb-3">

                <label>PO Code</label>

                <input
                  className="form-control"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="PO1"
                  required
                />

              </div>

              <div className="col-md-6 mb-3">

                <label>Program</label>

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

              <div className="col-12 mb-3">

                <label>Description</label>

                <textarea
                  className="form-control"
                  rows="4"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="col-md-6 mb-3">

                <label>Status</label>

                <select
                  className="form-select"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >

                  <option value={true}>
                    Active
                  </option>

                  <option value={false}>
                    Inactive
                  </option>

                </select>

              </div>

            </div>

            <button
              className="btn btn-primary"
              disabled={
                createProgramOutcome.isPending
              }
            >
              {createProgramOutcome.isPending
                ? "Saving..."
                : "Save Program Outcome"}
            </button>

          </form>

        </div>

      </div>

    </div>

  );

}

export default AddProgramOutcome;