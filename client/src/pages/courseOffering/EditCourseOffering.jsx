/**
 * ------------------------------------------------------------------
 * Edit Course Offering
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { useEffect, useMemo, useState } from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Save,
} from "react-bootstrap-icons";

import api from "../../api/axios";

import {
  getCourseOfferingById,
  updateCourseOffering,
} from "../../services/courseOfferingService";

function EditCourseOffering() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [semesters, setSemesters] = useState([]);

  const [formData, setFormData] = useState({
    courseId: "",
    batchId: "",
    semesterId: "",
    section: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /**
   * ---------------------------------------------------------------
   * Load Course Offering + Required Master Data
   * ---------------------------------------------------------------
   */

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          offeringResponse,
          coursesResponse,
          batchesResponse,
          semestersResponse,
        ] = await Promise.all([
          getCourseOfferingById(id),
          api.get("/courses"),
          api.get("/batches"),
          api.get("/semesters"),
        ]);

        const offering = offeringResponse;

        setCourses(
          coursesResponse?.data?.data || []
        );

        setBatches(
          batchesResponse?.data?.data || []
        );

        setSemesters(
          semestersResponse?.data?.data || []
        );

        if (!offering) {
          setError(
            "Course offering not found."
          );
          return;
        }

        setFormData({
          courseId:
            offering.courseId ||
            offering.course?.id ||
            "",

          batchId:
            offering.batchId ||
            offering.batch?.id ||
            "",

          semesterId:
            offering.semesterId ||
            offering.semester?.id ||
            "",

          section:
            offering.section || "",
        });
      } catch (err) {
        console.error(
          "Failed to load course offering:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Unable to load course offering."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  /**
   * ---------------------------------------------------------------
   * Filter Semesters By Batch
   * ---------------------------------------------------------------
   */

  const availableSemesters = useMemo(() => {
    if (!formData.batchId) {
      return [];
    }

    return semesters.filter(
      (semester) =>
        semester.batchId === formData.batchId
    );
  }, [
    semesters,
    formData.batchId,
  ]);

  /**
   * ---------------------------------------------------------------
   * Handle Form Change
   * ---------------------------------------------------------------
   */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    if (name === "batchId") {
      setFormData((previous) => ({
        ...previous,
        batchId: value,
        semesterId: "",
      }));

      return;
    }

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /**
   * ---------------------------------------------------------------
   * Submit
   * ---------------------------------------------------------------
   */

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      await updateCourseOffering({
        id,
        data: {
          courseId: formData.courseId,
          batchId: formData.batchId,
          semesterId: formData.semesterId,
          section:
            formData.section.trim() || null,
        },
      });

      navigate("/hod/course-offerings");
    } catch (err) {
      console.error(
        "Failed to update course offering:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to update course offering."
      );
    } finally {
      setSaving(false);
    }
  };

  /**
   * ---------------------------------------------------------------
   * Loading State
   * ---------------------------------------------------------------
   */

  if (loading) {
    return (
      <div className="container-fluid py-5 text-center">

        <div
          className="spinner-border text-primary"
          role="status"
        />

        <p className="text-muted mt-3">
          Loading course offering...
        </p>

      </div>
    );
  }

  /**
   * ---------------------------------------------------------------
   * Page
   * ---------------------------------------------------------------
   */

  return (
    <div className="container-fluid py-4">

      {/* HEADER */}

      <div className="d-flex align-items-center gap-3 mb-4">

        <Link
          to="/hod/course-offerings"
          className="btn btn-outline-secondary"
        >
          <ArrowLeft />
        </Link>

        <div>
          <h3 className="fw-bold mb-1">
            Edit Course Offering
          </h3>

          <p className="text-muted mb-0">
            Update course, batch, semester, or section.
          </p>
        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* FORM */}

      <div className="card border-0 shadow-sm">

        <div className="card-body p-4">

          <form onSubmit={handleSubmit}>

            <div className="row g-4">

              {/* COURSE */}

              <div className="col-md-6">

                <label
                  htmlFor="courseId"
                  className="form-label fw-semibold"
                >
                  Course
                </label>

                <select
                  id="courseId"
                  name="courseId"
                  className="form-select"
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

              {/* BATCH */}

              <div className="col-md-6">

                <label
                  htmlFor="batchId"
                  className="form-label fw-semibold"
                >
                  Batch
                </label>

                <select
                  id="batchId"
                  name="batchId"
                  className="form-select"
                  value={formData.batchId}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select Batch
                  </option>

                  {batches.map((batch) => (
                    <option
                      key={batch.id}
                      value={batch.id}
                    >
                      {batch.name} (
                      {batch.startYear}-
                      {batch.endYear})
                    </option>
                  ))}

                </select>

              </div>

              {/* SEMESTER */}

              <div className="col-md-6">

                <label
                  htmlFor="semesterId"
                  className="form-label fw-semibold"
                >
                  Semester
                </label>

                <select
                  id="semesterId"
                  name="semesterId"
                  className="form-select"
                  value={formData.semesterId}
                  onChange={handleChange}
                  disabled={!formData.batchId}
                  required
                >

                  <option value="">
                    {formData.batchId
                      ? "Select Semester"
                      : "Select Batch First"}
                  </option>

                  {availableSemesters.map(
                    (semester) => (
                      <option
                        key={semester.id}
                        value={semester.id}
                      >
                        Semester{" "}
                        {semester.semesterNumber} -{" "}
                        {semester.term}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* SECTION */}

              <div className="col-md-6">

                <label
                  htmlFor="section"
                  className="form-label fw-semibold"
                >
                  Section
                </label>

                <input
                  id="section"
                  name="section"
                  type="text"
                  className="form-control"
                  value={formData.section}
                  onChange={handleChange}
                  maxLength={20}
                  placeholder="Example: A"
                />

                <small className="text-muted">
                  Optional. Leave empty if section is
                  not applicable.
                </small>

              </div>

            </div>

            <hr className="my-4" />

            {/* ACTIONS */}

            <div className="d-flex justify-content-end gap-2">

              <Link
                to="/hod/course-offerings"
                className="btn btn-outline-secondary"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >

                {saving ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    />

                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="me-2" />

                    Save Changes
                  </>
                )}

              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}

export default EditCourseOffering;