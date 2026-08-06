import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useCreateCourseOutcome } from "../../hooks/useCourseOutcomes";
import { useCourses } from "../../hooks/useCourses";

function AddCourseOutcome() {
  const navigate = useNavigate();

  const createCO = useCreateCourseOutcome();

  const { data: courses = [] } = useCourses();

  const [formData, setFormData] = useState({
    courseId: "",
    coNumber: 1,
    code: "CO1",
    description: "",
    bloomLevel: "L1",
    targetAttainment: 60,
    status: true,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    const updated = {
      ...formData,
    };

    if (name === "coNumber") {
      updated.coNumber = Number(value);
      updated.code = `CO${value}`;
    } else if (name === "targetAttainment") {
      updated.targetAttainment = Number(value);
    } else {
      updated[name] = value;
    }

    setFormData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createCO.mutateAsync(formData);

      toast.success("Course Outcome created successfully.");

      navigate("/admin/course-outcomes");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to create Course Outcome."
      );
    }
  };

  return (
    <div className="container-fluid mt-4">
      <div className="card shadow-sm">

        <div className="card-header">
          <h4>Add Course Outcome</h4>
        </div>

        <div className="card-body">

          <form onSubmit={handleSubmit}>

            <div className="row">

              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Course
                </label>

                <select
                  className="form-select"
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select Course
                  </option>

                  {courses.map((course) => (
                    <option
                      key={course.id}
                      value={course.id}
                    >
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">
                  CO Number
                </label>

                <input
                  type="number"
                  min="1"
                  className="form-control"
                  name="coNumber"
                  value={formData.coNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">
                  Code
                </label>

                <input
                  className="form-control"
                  value={formData.code}
                  readOnly
                />
              </div>

              <div className="col-md-12 mb-3">
                <label className="form-label">
                  Description
                </label>

                <textarea
                  rows="4"
                  className="form-control"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">
                  Bloom Level
                </label>

                <select
                  className="form-select"
                  name="bloomLevel"
                  value={formData.bloomLevel}
                  onChange={handleChange}
                >
                  <option value="L1">L1 - Remember</option>
                  <option value="L2">L2 - Understand</option>
                  <option value="L3">L3 - Apply</option>
                  <option value="L4">L4 - Analyze</option>
                  <option value="L5">L5 - Evaluate</option>
                  <option value="L6">L6 - Create</option>
                </select>
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">
                  Target Level
                </label>

                <select
                  className="form-select"
                  name="targetAttainment"
                  value={formData.targetAttainment}
                  onChange={handleChange}
                >
                  <option value={50}>Level 1 (50%)</option>
                  <option value={55}>Level 2 (55%)</option>
                  <option value={60}>Level 3 (60%)</option>
                </select>
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">
                  Status
                </label>

                <select
                  className="form-select"
                  name="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value === "true",
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
              disabled={createCO.isPending}
            >
              {createCO.isPending
                ? "Saving..."
                : "Save Course Outcome"}
            </button>

          </form>

        </div>

      </div>
    </div>
  );
}

export default AddCourseOutcome;