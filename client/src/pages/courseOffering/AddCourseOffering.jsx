/**
 * ------------------------------------------------------------------
 * Add Course Offering
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * HOD can create a Course Offering by selecting:
 *
 * - Course
 * - Batch
 * - Semester
 * - Faculty
 * - Section
 *
 * ------------------------------------------------------------------
 */

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
} from "react-bootstrap-icons";

import api from "../../api/axios";

import {
  createCourseOffering,
} from "../../services/courseOfferingService";


/**
 * ------------------------------------------------------------------
 * Extract Array From API Response
 * ------------------------------------------------------------------
 *
 * Supports all common response formats used in this project:
 *
 * 1. { data: [...] }
 * 2. [...]
 * 3. { data: { data: [...] } }
 * 4. { items: [...] }
 * 5. { rows: [...] }
 *
 * This prevents dropdowns from becoming empty when services
 * return slightly different response structures.
 * ------------------------------------------------------------------
 */
const extractArray = (response) => {
  const payload = response?.data;

  /**
   * Axios response:
   *
   * response.data = [...]
   */
  if (Array.isArray(payload)) {
    return payload;
  }

  /**
   * Standard project response:
   *
   * response.data = {
   *   success: true,
   *   data: [...]
   * }
   */
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  /**
   * Nested response:
   *
   * response.data = {
   *   data: {
   *     data: [...]
   *   }
   * }
   */
  if (Array.isArray(payload?.data?.data)) {
    return payload.data.data;
  }

  /**
   * Alternative response formats.
   */
  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  if (Array.isArray(payload?.rows)) {
    return payload.rows;
  }

  return [];
};


/**
 * ------------------------------------------------------------------
 * Add Course Offering
 * ------------------------------------------------------------------
 */
function AddCourseOffering() {
  const navigate = useNavigate();


  /**
   * ================================================================
   * MASTER DATA
   * ================================================================
   */
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [faculties, setFaculties] = useState([]);


  /**
   * ================================================================
   * FORM DATA
   * ================================================================
   */
  const [formData, setFormData] = useState({
    courseId: "",
    batchId: "",
    semesterId: "",
    facultyId: "",
    section: "",
  });


  /**
   * ================================================================
   * STATE
   * ================================================================
   */
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");


  /**
   * ================================================================
   * LOAD MASTER DATA
   * ================================================================
   */
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        /**
         * ----------------------------------------------------------
         * Request all required master data
         * ----------------------------------------------------------
         */
        const [
          coursesResponse,
          batchesResponse,
          semestersResponse,
          facultiesResponse,
        ] = await Promise.all([
          api.get("/courses"),
          api.get("/batches"),
          api.get("/semesters"),

          /**
           * IMPORTANT
           *
           * This endpoint must return academic faculty records
           * from the `faculties` table.
           *
           * The ID returned here must be:
           *
           * faculties.id
           *
           * NOT users.id.
           */
          api.get("/faculty/approved"),
        ]);


        if (!mounted) {
          return;
        }


        /**
         * ----------------------------------------------------------
         * Extract API arrays safely
         * ----------------------------------------------------------
         */
        const courseData =
          extractArray(coursesResponse);

        const batchData =
          extractArray(batchesResponse);

        const semesterData =
          extractArray(semestersResponse);

        const facultyData =
          extractArray(facultiesResponse);


        /**
         * ----------------------------------------------------------
         * Debugging
         * ----------------------------------------------------------
         *
         * Keep these logs temporarily so we can verify exactly
         * what the backend is returning.
         */
        console.log(
          "COURSES:",
          courseData
        );

        console.log(
          "BATCHES:",
          batchData
        );

        console.log(
          "SEMESTERS:",
          semesterData
        );

        console.log(
          "APPROVED FACULTIES:",
          facultyData
        );


        /**
         * ----------------------------------------------------------
         * Set State
         * ----------------------------------------------------------
         */
        setCourses(courseData);
        setBatches(batchData);
        setSemesters(semesterData);
        setFaculties(facultyData);


      } catch (err) {
        console.error(
          "Failed to load course offering data:",
          err
        );

        if (!mounted) {
          return;
        }

        setError(
          err?.response?.data?.message ||
            "Unable to load required course offering data."
        );

      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };


    loadData();


    return () => {
      mounted = false;
    };
  }, []);


  /**
   * ================================================================
   * FILTER SEMESTERS BY BATCH
   * ================================================================
   */
  const availableSemesters = useMemo(() => {
    if (!formData.batchId) {
      return [];
    }

    return semesters.filter(
      (semester) =>
        String(semester.batchId) ===
        String(formData.batchId)
    );
  }, [
    semesters,
    formData.batchId,
  ]);


  /**
   * ================================================================
   * HANDLE CHANGE
   * ================================================================
   */
  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;


    /**
     * When Batch changes:
     *
     * reset Semester.
     */
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
   * ================================================================
   * VALIDATE FORM
   * ================================================================
   */
  const validateForm = () => {
    if (!formData.courseId) {
      return "Please select a course.";
    }

    if (!formData.batchId) {
      return "Please select a batch.";
    }

    if (!formData.semesterId) {
      return "Please select a semester.";
    }

    if (!formData.facultyId) {
      return "Please select a faculty.";
    }

    return "";
  };


  /**
   * ================================================================
   * SUBMIT
   * ================================================================
   */
  const handleSubmit = async (event) => {
    event.preventDefault();


    const validationError =
      validateForm();


    if (validationError) {
      setError(validationError);
      return;
    }


    try {
      setSaving(true);
      setError("");


      /**
       * IMPORTANT
       *
       * facultyId must be:
       *
       * faculties.id
       *
       * because:
       *
       * course_offerings.faculty_id
       *      ↓
       * faculties.id
       */
      const payload = {
        courseId: formData.courseId,
        batchId: formData.batchId,
        semesterId: formData.semesterId,
        facultyId: formData.facultyId,
        section:
          formData.section.trim() || null,
      };


      console.log(
        "CREATE COURSE OFFERING PAYLOAD:",
        payload
      );


      await createCourseOffering(
        payload
      );


      navigate(
        "/hod/course-offerings"
      );


    } catch (err) {
      console.error(
        "Failed to create course offering:",
        err
      );


      setError(
        err?.response?.data?.message ||
          "Unable to create course offering."
      );


    } finally {
      setSaving(false);
    }
  };


  /**
   * ================================================================
   * LOADING
   * ================================================================
   */
  if (loading) {
    return (
      <div className="container-fluid py-5 text-center">

        <div
          className="spinner-border text-primary"
          role="status"
        />

        <p className="text-muted mt-3 mb-0">
          Loading course offering data...
        </p>

      </div>
    );
  }


  /**
   * ================================================================
   * UI
   * ================================================================
   */
  return (
    <div className="container-fluid py-4">

      {/* =========================================================
          HEADER
      ========================================================= */}

      <div className="d-flex align-items-center gap-3 mb-4">

        <Link
          to="/hod/course-offerings"
          className="btn btn-outline-secondary"
          title="Back"
        >
          <ArrowLeft />
        </Link>


        <div>

          <h3 className="fw-bold mb-1">
            Add Course Offering
          </h3>

          <p className="text-muted mb-0">
            Create a course offering and assign faculty.
          </p>

        </div>

      </div>


      {/* =========================================================
          ERROR
      ========================================================= */}

      {error && (
        <div
          className="alert alert-danger"
          role="alert"
        >
          {error}
        </div>
      )}


      {/* =========================================================
          MASTER DATA STATUS
      ========================================================= */}

      {(courses.length === 0 ||
        batches.length === 0 ||
        faculties.length === 0) && (
        <div className="alert alert-warning">

          <strong>
            Some master data is unavailable.
          </strong>

          <div className="mt-2">

            {courses.length === 0 && (
              <div>
                • No courses available
              </div>
            )}

            {batches.length === 0 && (
              <div>
                • No batches available
              </div>
            )}

            {faculties.length === 0 && (
              <div>
                • No approved faculty available
              </div>
            )}

          </div>

        </div>
      )}


      {/* =========================================================
          FORM CARD
      ========================================================= */}

      <div className="card border-0 shadow-sm">

        <div className="card-body p-4">

          <form onSubmit={handleSubmit}>

            <div className="row g-4">


              {/* =================================================
                  COURSE
              ================================================= */}

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
                  disabled={
                    saving ||
                    courses.length === 0
                  }
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
                      {course.code ||
                        course.courseCode ||
                        "—"}{" "}
                      -{" "}
                      {course.name ||
                        course.courseName ||
                        "Unnamed Course"}
                    </option>
                  ))}

                </select>


                {courses.length === 0 && (
                  <small className="text-danger">
                    No courses available.
                  </small>
                )}

              </div>


              {/* =================================================
                  BATCH
              ================================================= */}

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
                  disabled={
                    saving ||
                    batches.length === 0
                  }
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
                      {batch.name ||
                        `${batch.startYear || ""}-${batch.endYear || ""}`}
                      {" "}
                      (
                      {batch.startYear}
                      -
                      {batch.endYear}
                      )
                    </option>
                  ))}

                </select>


                {batches.length === 0 && (
                  <small className="text-danger">
                    No batches available.
                  </small>
                )}

              </div>


              {/* =================================================
                  SEMESTER
              ================================================= */}

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
                  disabled={
                    !formData.batchId ||
                    saving
                  }
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
                        {semester.semesterNumber}{" "}
                        -{" "}
                        {semester.term}
                      </option>
                    )
                  )}

                </select>


                {formData.batchId &&
                  availableSemesters.length === 0 && (
                    <small className="text-danger">
                      No semesters found for this batch.
                    </small>
                  )}

              </div>


              {/* =================================================
                  FACULTY
              ================================================= */}

              <div className="col-md-6">

                <label
                  htmlFor="facultyId"
                  className="form-label fw-semibold"
                >
                  Faculty
                </label>


                <select
                  id="facultyId"
                  name="facultyId"
                  className="form-select"
                  value={formData.facultyId}
                  onChange={handleChange}
                  disabled={
                    saving ||
                    faculties.length === 0
                  }
                  required
                >

                  <option value="">
                    Select Faculty
                  </option>


                  {faculties.map(
                    (faculty) => (
                      <option
                        key={faculty.id}
                        value={faculty.id}
                      >
                        {faculty.firstName}{" "}
                        {faculty.lastName}

                        {faculty.employeeId
                          ? ` (${faculty.employeeId})`
                          : ""}
                      </option>
                    )
                  )}

                </select>


                {faculties.length === 0 && (
                  <small className="text-danger">
                    No approved faculty available.
                  </small>
                )}

              </div>


              {/* =================================================
                  SECTION
              ================================================= */}

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
                  placeholder="Example: A"
                  maxLength={20}
                  value={formData.section}
                  onChange={handleChange}
                  disabled={saving}
                />


                <small className="text-muted">
                  Optional. Leave empty if section is
                  not applicable.
                </small>

              </div>

            </div>


            {/* =====================================================
                INFORMATION
            ===================================================== */}

            <div className="alert alert-info mt-4 mb-0">

              <strong>
                Course Offering:
              </strong>{" "}

              The selected course, batch, semester,
              section and faculty will be linked
              together as one course offering.

            </div>


            <hr className="my-4" />


            {/* =====================================================
                ACTIONS
            ===================================================== */}

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
                disabled={
                  saving ||
                  courses.length === 0 ||
                  batches.length === 0 ||
                  availableSemesters.length === 0 ||
                  faculties.length === 0
                }
              >

                {saving ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    />

                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="me-2" />

                    Create Course Offering
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

export default AddCourseOffering;