import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  useCreateCourseOutcome,
} from "../../hooks/useCourseOutcomes";

import {
  useMyCourseOfferings,
} from "../../hooks/useCourseOfferings";

function AddCourseOutcome() {
  const navigate = useNavigate();

  /**
   * ---------------------------------------------------------
   * Create CO
   * ---------------------------------------------------------
   */
  const createCO =
    useCreateCourseOutcome();

  /**
   * ---------------------------------------------------------
   * Get only courses assigned to logged-in faculty
   * ---------------------------------------------------------
   */
  const {
    data: courseOfferings = [],
    isLoading: coursesLoading,
    isError: coursesError,
  } = useMyCourseOfferings();

  /**
   * ---------------------------------------------------------
   * Form State
   * ---------------------------------------------------------
   */
  const [formData, setFormData] =
    useState({
      courseId: "",
      coNumber: 1,
      code: "CO1",
      description: "",
      bloomLevel: "L1",
      targetAttainment: 60,
      status: true,
    });

  /**
   * ---------------------------------------------------------
   * Handle Change
   * ---------------------------------------------------------
   */
  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    const updated = {
      ...formData,
    };

    if (name === "coNumber") {
      const number =
        Number(value);

      updated.coNumber =
        number;

      updated.code =
        `CO${number}`;
    } else if (
      name === "targetAttainment"
    ) {
      updated.targetAttainment =
        Number(value);
    } else {
      updated[name] =
        value;
    }

    setFormData(updated);
  };

  /**
   * ---------------------------------------------------------
   * Submit
   * ---------------------------------------------------------
   */
  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    if (!formData.courseId) {
      toast.error(
        "Please select a course."
      );

      return;
    }

    if (
      !formData.description.trim()
    ) {
      toast.error(
        "Course Outcome description is required."
      );

      return;
    }

    try {
      await createCO.mutateAsync(
        formData
      );

      toast.success(
        "Course Outcome created successfully."
      );

      navigate(
        "/faculty/course-outcomes"
      );
    } catch (error) {
      toast.error(
        error.response?.data
          ?.message ||
          "Unable to create Course Outcome."
      );
    }
  };

  return (
    <div className="container-fluid mt-4">
      <div className="card shadow-sm">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="card-header">
          <h4>
            Add Course Outcome
          </h4>
        </div>

        <div className="card-body">

          {/* ===================================================
              COURSE LOADING ERROR
          =================================================== */}

          {coursesError && (
            <div className="alert alert-danger">
              Unable to load your assigned
              courses.
            </div>
          )}

          <form
            onSubmit={handleSubmit}
          >

            <div className="row">

              {/* =================================================
                  COURSE
              ================================================= */}

              <div className="col-md-6 mb-3">

                <label className="form-label">
                  Course
                </label>

                <select
                  className="form-select"
                  name="courseId"
                  value={
                    formData.courseId
                  }
                  onChange={
                    handleChange
                  }
                  required
                  disabled={
                    coursesLoading
                  }
                >

                  <option value="">
                    {coursesLoading
                      ? "Loading assigned courses..."
                      : "Select Course"}
                  </option>

                  {!coursesLoading &&
                    courseOfferings.map(
                      (offering) => {

                        const course =
                          offering.course;

                        if (!course) {
                          return null;
                        }

                        return (
                          <option
                            key={
                              offering.id
                            }
                            value={
                              course.id
                            }
                          >
                            {course.code}{" "}
                            -{" "}
                            {course.name}
                            {offering.section
                              ? ` - Section ${offering.section}`
                              : ""}
                          </option>
                        );
                      }
                    )}

                </select>

                {/* No assigned courses */}

                {!coursesLoading &&
                  !coursesError &&
                  courseOfferings.length ===
                    0 && (
                    <small className="text-danger">
                      No courses are currently
                      assigned to you.
                    </small>
                  )}

              </div>

              {/* =================================================
                  CO NUMBER
              ================================================= */}

              <div className="col-md-3 mb-3">

                <label className="form-label">
                  CO Number
                </label>

                <input
                  type="number"
                  min="1"
                  className="form-control"
                  name="coNumber"
                  value={
                    formData.coNumber
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>

              {/* =================================================
                  CODE
              ================================================= */}

              <div className="col-md-3 mb-3">

                <label className="form-label">
                  Code
                </label>

                <input
                  className="form-control"
                  value={
                    formData.code
                  }
                  readOnly
                />

              </div>

              {/* =================================================
                  DESCRIPTION
              ================================================= */}

              <div className="col-md-12 mb-3">

                <label className="form-label">
                  Description
                </label>

                <textarea
                  rows="4"
                  className="form-control"
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter the Course Outcome description"
                  required
                />

              </div>

              {/* =================================================
                  BLOOM LEVEL
              ================================================= */}

              <div className="col-md-4 mb-3">

                <label className="form-label">
                  Bloom Level
                </label>

                <select
                  className="form-select"
                  name="bloomLevel"
                  value={
                    formData.bloomLevel
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value="L1">
                    L1 - Remember
                  </option>

                  <option value="L2">
                    L2 - Understand
                  </option>

                  <option value="L3">
                    L3 - Apply
                  </option>

                  <option value="L4">
                    L4 - Analyze
                  </option>

                  <option value="L5">
                    L5 - Evaluate
                  </option>

                  <option value="L6">
                    L6 - Create
                  </option>

                </select>

              </div>

              {/* =================================================
                  TARGET ATTAINMENT
              ================================================= */}

              <div className="col-md-4 mb-3">

                <label className="form-label">
                  Target Level
                </label>

                <select
                  className="form-select"
                  name="targetAttainment"
                  value={
                    formData.targetAttainment
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value={50}>
                    Level 1 (50%)
                  </option>

                  <option value={55}>
                    Level 2 (55%)
                  </option>

                  <option value={60}>
                    Level 3 (60%)
                  </option>

                </select>

              </div>

              {/* =================================================
                  STATUS
              ================================================= */}

              <div className="col-md-4 mb-3">

                <label className="form-label">
                  Status
                </label>

                <select
                  className="form-select"
                  name="status"
                  value={
                    String(
                      formData.status
                    )
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status:
                        e.target.value ===
                        "true",
                    })
                  }
                >

                  <option value="true">
                    Active
                  </option>

                  <option value="false">
                    Inactive
                  </option>

                </select>

              </div>

            </div>

            {/* =================================================
                SUBMIT
            ================================================= */}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={
                createCO.isPending ||
                coursesLoading ||
                courseOfferings.length ===
                  0
              }
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