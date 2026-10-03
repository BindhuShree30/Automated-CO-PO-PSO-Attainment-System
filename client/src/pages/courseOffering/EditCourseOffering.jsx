/**
 * ------------------------------------------------------------------
 * Edit Course Offering
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Allows HOD to edit:
 *
 * - Course
 * - Batch
 * - Semester
 * - Section
 *
 * ------------------------------------------------------------------
 */

import {
  useEffect,
  useMemo,
  useState,
} from "react";

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


  /* ================================================================
     STATE
  ================================================================ */

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


  /* ================================================================
     LOAD COURSE OFFERING + MASTER DATA
  ================================================================ */

  useEffect(() => {

    let mounted = true;


    const loadData = async () => {

      try {

        setLoading(true);

        setError("");


        if (!id) {

          setError(
            "Course offering ID is missing."
          );

          return;
        }


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


        /* ----------------------------------------------------------
           MASTER DATA
        ---------------------------------------------------------- */

        const courseList =
          coursesResponse?.data?.data ?? [];

        const batchList =
          batchesResponse?.data?.data ?? [];

        const semesterList =
          semestersResponse?.data?.data ?? [];


        if (!mounted) {
          return;
        }


        setCourses(
          Array.isArray(courseList)
            ? courseList
            : []
        );


        setBatches(
          Array.isArray(batchList)
            ? batchList
            : []
        );


        setSemesters(
          Array.isArray(semesterList)
            ? semesterList
            : []
        );


        /* ----------------------------------------------------------
           COURSE OFFERING RESPONSE
        ---------------------------------------------------------- */

        console.log(
          "EDIT COURSE OFFERING RESPONSE:",
          offeringResponse
        );


        let offering = null;


        /*
         * Backend response:
         *
         * {
         *   success: true,
         *   message: "...",
         *   data: {...}
         * }
         */

        if (
          offeringResponse?.data?.data
        ) {

          offering =
            offeringResponse.data.data;

        }

        /*
         * Alternative:
         *
         * {
         *   success: true,
         *   data: {
         *     courseOffering: {...}
         *   }
         * }
         */

        else if (
          offeringResponse?.data
            ?.courseOffering
        ) {

          offering =
            offeringResponse.data
              .courseOffering;

        }

        /*
         * Direct object fallback
         */

        else if (
          offeringResponse?.courseOffering
        ) {

          offering =
            offeringResponse.courseOffering;

        }

        /*
         * Direct data fallback
         */

        else if (
          offeringResponse?.data &&
          !Array.isArray(
            offeringResponse.data
          )
        ) {

          offering =
            offeringResponse.data;

        }


        console.log(
          "NORMALIZED COURSE OFFERING:",
          offering
        );


        /* ----------------------------------------------------------
           COURSE OFFERING NOT FOUND
        ---------------------------------------------------------- */

        if (!offering) {

          setError(
            "Course offering not found."
          );

          return;
        }


        /* ----------------------------------------------------------
           EXTRACT COURSE ID
        ---------------------------------------------------------- */

        const courseId =
          offering.courseId ??
          offering.course?.id ??
          "";


        /* ----------------------------------------------------------
           EXTRACT BATCH ID
        ---------------------------------------------------------- */

        const batchId =
          offering.batchId ??
          offering.batch?.id ??
          "";


        /* ----------------------------------------------------------
           EXTRACT SEMESTER ID
        ---------------------------------------------------------- */

        const semesterId =
          offering.semesterId ??
          offering.semester?.id ??
          "";


        /* ----------------------------------------------------------
           EXTRACT SECTION
        ---------------------------------------------------------- */

        const section =
          offering.section ?? "";


        console.log(
          "EDIT FORM VALUES:",
          {
            courseId,
            batchId,
            semesterId,
            section,
          }
        );


        /* ----------------------------------------------------------
           IMPORTANT
        ---------------------------------------------------------- */

        if (!mounted) {
          return;
        }


        setFormData({
          courseId: String(courseId),

          batchId: String(batchId),

          semesterId: String(semesterId),

          section: section ?? "",
        });


        setError("");

      }

      catch (err) {

        console.error(
          "Failed to load course offering:",
          err
        );


        if (!mounted) {
          return;
        }


        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load course offering."
        );

      }

      finally {

        if (mounted) {

          setLoading(false);

        }

      }

    };


    loadData();


    return () => {

      mounted = false;

    };

  }, [id]);


  /* ================================================================
     AVAILABLE SEMESTERS
  ================================================================ */

  const availableSemesters =
    useMemo(() => {

      if (!formData.batchId) {

        return [];

      }


      return semesters

        .filter(
          (semester) =>
            String(
              semester.batchId
            ) ===
            String(
              formData.batchId
            )
        )

        .sort(
          (a, b) =>
            Number(
              a.semesterNumber || 0
            ) -
            Number(
              b.semesterNumber || 0
            )
        );

    }, [
      semesters,
      formData.batchId,
    ]);


  /* ================================================================
     HANDLE CHANGE
  ================================================================ */

  const handleChange = (event) => {

    const {
      name,
      value,
    } = event.target;


    /*
     * Changing batch must reset semester
     * because semesters belong to a batch.
     */

    if (name === "batchId") {

      setFormData(
        (previous) => ({
          ...previous,

          batchId: value,

          semesterId: "",
        })
      );

      return;
    }


    setFormData(
      (previous) => ({
        ...previous,

        [name]: value,
      })
    );

  };


  /* ================================================================
     SUBMIT
  ================================================================ */

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();


    setError("");


    /* --------------------------------------------------------------
       VALIDATION
    -------------------------------------------------------------- */

    if (!formData.courseId) {

      setError(
        "Please select a course."
      );

      return;
    }


    if (!formData.batchId) {

      setError(
        "Please select a batch."
      );

      return;
    }


    if (!formData.semesterId) {

      setError(
        "Please select a semester."
      );

      return;
    }


    try {

      setSaving(true);


      /* ------------------------------------------------------------
         IMPORTANT FIX
         
         Service expects:
         
         updateCourseOffering(id, data)
         
         NOT:
         
         updateCourseOffering({
           id,
           data
         })
      ------------------------------------------------------------ */

      const response =
        await updateCourseOffering(
          id,
          {
            courseId:
              formData.courseId,

            batchId:
              formData.batchId,

            semesterId:
              formData.semesterId,

            section:
              formData.section.trim() ||
              null,
          }
        );


      console.log(
        "COURSE OFFERING UPDATED:",
        response
      );


      /* ------------------------------------------------------------
         SUCCESS
      ------------------------------------------------------------ */

      navigate(
        "/hod/course-offerings",
        {
          replace: true,

          state: {
            success:
              "Course offering updated successfully.",
          },
        }
      );

    }

    catch (err) {

      console.error(
        "Failed to update course offering:",
        err
      );


      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Unable to update course offering."
      );

    }

    finally {

      setSaving(false);

    }

  };


  /* ================================================================
     LOADING
  ================================================================ */

  if (loading) {

    return (

      <div
        className="container-fluid py-5 text-center"
      >

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


  /* ================================================================
     PAGE
  ================================================================ */

  return (

    <div
      className="container-fluid py-4"
      style={{
        maxWidth: "1100px",
      }}
    >

      {/* ============================================================
          HEADER
      ============================================================ */}

      <div
        className="d-flex align-items-center gap-3 mb-4"
      >

        <Link
          to="/hod/course-offerings"
          className="btn btn-outline-secondary"
          title="Back"
        >

          <ArrowLeft />

        </Link>


        <div>

          <h3
            className="fw-bold mb-1"
          >
            Edit Course Offering
          </h3>


          <p
            className="text-muted mb-0"
          >
            Update course, batch,
            semester, or section.
          </p>

        </div>

      </div>


      {/* ============================================================
          ERROR
      ============================================================ */}

      {error && (

        <div
          className="alert alert-danger"
          role="alert"
        >

          {error}

        </div>

      )}


      {/* ============================================================
          FORM CARD
      ============================================================ */}

      <div
        className="card border-0 shadow-sm"
      >

        <div
          className="card-body p-4"
        >

          <form
            onSubmit={handleSubmit}
          >

            <div className="row g-4">


              {/* ====================================================
                  COURSE
              ==================================================== */}

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
                  value={
                    formData.courseId
                  }
                  onChange={
                    handleChange
                  }
                  required
                  disabled={saving}
                >

                  <option value="">
                    Select Course
                  </option>


                  {courses.map(
                    (course) => (

                      <option
                        key={course.id}
                        value={course.id}
                      >

                        {course.code} -{" "}
                        {course.name}

                      </option>

                    )
                  )}

                </select>

              </div>


              {/* ====================================================
                  BATCH
              ==================================================== */}

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
                  value={
                    formData.batchId
                  }
                  onChange={
                    handleChange
                  }
                  required
                  disabled={saving}
                >

                  <option value="">
                    Select Batch
                  </option>


                  {batches.map(
                    (batch) => (

                      <option
                        key={batch.id}
                        value={batch.id}
                      >

                        {batch.name}

                        {" ("}

                        {batch.startYear}

                        -

                        {batch.endYear}

                        {")"}

                      </option>

                    )
                  )}

                </select>

              </div>


              {/* ====================================================
                  SEMESTER
              ==================================================== */}

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
                  value={
                    formData.semesterId
                  }
                  onChange={
                    handleChange
                  }
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

                        {
                          semester.semesterNumber
                        }

                        {" - "}

                        {
                          semester.term
                        }

                      </option>

                    )
                  )}

                </select>


                {formData.batchId &&
                  availableSemesters.length ===
                    0 && (

                    <small
                      className="text-danger d-block mt-2"
                    >
                      No semesters available
                      for this batch.
                    </small>

                  )}

              </div>


              {/* ====================================================
                  SECTION
              ==================================================== */}

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
                  value={
                    formData.section
                  }
                  onChange={
                    handleChange
                  }
                  maxLength={20}
                  placeholder="Example: A"
                  disabled={saving}
                />


                <small
                  className="text-muted"
                >
                  Optional. Leave empty
                  if section is not applicable.
                </small>

              </div>

            </div>


            <hr className="my-4" />


            {/* ======================================================
                ACTIONS
            ====================================================== */}

            <div
              className="d-flex justify-content-end gap-2"
            >

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