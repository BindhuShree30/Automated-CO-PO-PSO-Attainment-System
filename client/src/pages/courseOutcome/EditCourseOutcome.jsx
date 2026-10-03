import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import {
  useCourseOutcome,
  useUpdateCourseOutcome,
} from "../../hooks/useCourseOutcomes";

import { useCourses } from "../../hooks/useCourses";

function EditCourseOutcome() {
  const { id } = useParams();

  const navigate = useNavigate();

  const { data: courses = [] } = useCourses();

  const { data: courseOutcome } =
    useCourseOutcome(id);

  const updateCO =
    useUpdateCourseOutcome();

  const [formData, setFormData] =
    useState({
      courseId: "",
      coNumber: 1,
      code: "",
      description: "",
      bloomLevel: "L1",
      targetAttainment: 60,
      status: true,
    });

  useEffect(() => {
    if (courseOutcome) {
      setFormData({
        courseId: courseOutcome.courseId,
        coNumber: courseOutcome.coNumber,
        code: courseOutcome.code,
        description: courseOutcome.description,
        bloomLevel: courseOutcome.bloomLevel,
        targetAttainment:
          courseOutcome.targetAttainment,
        status: courseOutcome.status,
      });
    }
  }, [courseOutcome]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    const updated = {
      ...formData,
      [name]:
        name === "coNumber" ||
        name === "targetAttainment"
          ? Number(value)
          : value,
    };

    if (name === "coNumber") {
      updated.code = `CO${value}`;
    }

    setFormData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateCO.mutateAsync({
        id,
        data: formData,
      });

      toast.success(
        "Course Outcome updated successfully."
      );

      navigate("/faculty/course-outcomes");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to update Course Outcome."
      );
    }
  };

  return (
    <div className="container-fluid mt-4">

      <div className="card shadow-sm">

        <div className="card-header">
          <h4>Edit Course Outcome</h4>
        </div>

        <div className="card-body">

          <form onSubmit={handleSubmit}>

            <div className="row">

              <div className="col-md-6 mb-3">
                <label>Course</label>

                <select
                  className="form-select"
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleChange}
                >
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
                <label>CO Number</label>

                <input
                  type="number"
                  className="form-control"
                  name="coNumber"
                  value={formData.coNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-3 mb-3">
                <label>Code</label>

                <input
                  className="form-control"
                  value={formData.code}
                  readOnly
                />
              </div>

              <div className="col-md-12 mb-3">
                <label>Description</label>

                <textarea
                  rows="4"
                  className="form-control"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4 mb-3">
                <label>Bloom Level</label>

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
                <label>Target Attainment</label>

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
                <label>Status</label>

                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status:
                        e.target.value === "true",
                    })
                  }
                >
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
              </div>

            </div>

            <button
              className="btn btn-primary"
              disabled={updateCO.isPending}
            >
              {updateCO.isPending
                ? "Updating..."
                : "Update Course Outcome"}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}

export default EditCourseOutcome;