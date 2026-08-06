import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDepartments } from "../../hooks/useDepartments";
import { useCreateCourse } from "../../hooks/useCourses";
import { usePrograms } from "../../hooks/usePrograms";

function AddCourse() {
  const navigate = useNavigate();

  const createCourse = useCreateCourse();
  const { data: departments = [] } = useDepartments();
  const { data: programs = [] } = usePrograms();

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    credits: 3,
    semester: 1,
    departmentId: "",
    programId: "",
    status: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? checked
          : ["credits", "semester"].includes(name)
          ? Number(value)
          : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createCourse.mutateAsync(formData);

      toast.success("Course created successfully.");

      navigate("/admin/courses");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to create course."
      );
    }
  };

  return (
    <div className="container-fluid mt-4">

      <div className="card shadow-sm">

        <div className="card-header">
          <h4>Add Course</h4>
        </div>

        <div className="card-body">

          <form onSubmit={handleSubmit}>

            <div className="row">

              <div className="col-md-6 mb-3">
                <label>Course Code</label>
                <input
                  className="form-control"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label>Course Name</label>
                <input
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label>Credits</label>
                <input
                  type="number"
                  className="form-control"
                  name="credits"
                  value={formData.credits}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label>Semester</label>
                <input
                  type="number"
                  className="form-control"
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">

                <label>Department</label>

                <select
                  className="form-select"
                  value={formData.departmentId}
                  onChange={(e) => {

                    const departmentId = e.target.value;

                    const selectedProgram = programs.find(
                      (program) =>
                        program.departmentId === departmentId
                    );

                    setFormData((prev) => ({
                      ...prev,
                      departmentId,
                      programId: selectedProgram
                        ? selectedProgram.id
                        : "",
                    }));

                  }}
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

              

              <div className="col-md-6 mb-3">

                <label>Status</label>

                <select
                  className="form-select"
                  name="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status:
                        e.target.value === "true",
                    })
                  }
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
              disabled={createCourse.isPending}
            >
              {createCourse.isPending
                ? "Saving..."
                : "Save Course"}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}

export default AddCourse;