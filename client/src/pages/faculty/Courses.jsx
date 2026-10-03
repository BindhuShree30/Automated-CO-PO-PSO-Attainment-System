/**
 * ------------------------------------------------------------------
 * Faculty My Courses
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Displays only the active Course Offerings assigned to the
 * currently logged-in faculty.
 *
 * Faculty assignment is determined by:
 *
 * CourseOffering.facultyId
 *
 * The backend identifies the logged-in faculty and returns
 * only their assigned Course Offerings.
 * ------------------------------------------------------------------
 */

import { useEffect, useState } from "react";

import {
  Book,
  People,
  Calendar3,
  Layers,
} from "react-bootstrap-icons";

import {
  useNavigate,
} from "react-router-dom";

import api from "../../api/axios";

function FacultyCourses() {
  const navigate = useNavigate();

  const [courses, setCourses] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /**
   * --------------------------------------------------------------
   * Fetch My Courses
   * --------------------------------------------------------------
   */
  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get(
          "/course-offerings/my-courses"
        );

      setCourses(
        response.data?.data ?? []
      );
    } catch (err) {
      console.error(
        "Failed to load faculty courses:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to load your courses."
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * --------------------------------------------------------------
   * Initial Load
   * --------------------------------------------------------------
   */
  useEffect(() => {
    loadCourses();
  }, []);

  /**
   * --------------------------------------------------------------
   * Loading
   * --------------------------------------------------------------
   */
  if (loading) {
    return (
      <div className="container-fluid py-4">

        <div className="card shadow-sm border-0">

          <div className="card-body text-center py-5">

            <div
              className="spinner-border text-primary"
              role="status"
            >
              <span className="visually-hidden">
                Loading...
              </span>
            </div>

            <p className="mt-3 mb-0 text-muted">
              Loading your courses...
            </p>

          </div>

        </div>

      </div>
    );
  }

  /**
   * --------------------------------------------------------------
   * Error
   * --------------------------------------------------------------
   */
  if (error) {
    return (
      <div className="container-fluid py-4">

        <div className="alert alert-danger">
          {error}
        </div>

      </div>
    );
  }

  /**
   * --------------------------------------------------------------
   * Page
   * --------------------------------------------------------------
   */
  return (
    <div className="container-fluid py-4">

      {/* ========================================================
          HEADER
      ======================================================== */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            My Courses
          </h2>

          <p className="text-muted mb-0">
            Courses assigned to you for teaching.
          </p>
        </div>

        <div
          className="rounded-circle d-flex align-items-center justify-content-center"
          style={{
            width: "52px",
            height: "52px",
            background: "#eef3ff",
            color: "#23439c",
          }}
        >
          <Book size={25} />
        </div>

      </div>


      {/* ========================================================
          EMPTY STATE
      ======================================================== */}

      {courses.length === 0 ? (

        <div className="card border-0 shadow-sm">

          <div className="card-body text-center py-5">

            <Book
              size={50}
              className="text-muted mb-3"
            />

            <h5 className="fw-semibold">
              No Courses Assigned
            </h5>

            <p className="text-muted mb-0">
              You currently do not have any
              course offerings assigned to you.
            </p>

          </div>

        </div>

      ) : (

        /* ======================================================
           COURSE CARDS
        ====================================================== */

        <div className="row g-4">

          {courses.map((offering) => {

            const course =
              offering.course || {};

            const batch =
              offering.batch || {};

            const semester =
              offering.semester || {};

            const academicYear =
              semester.academicYear || {};

            return (
              <div
                className="col-xl-4 col-lg-6 col-md-6"
                key={offering.id}
              >

                <div
                  className="card h-100 border-0 shadow-sm"
                  style={{
                    borderRadius: "14px",
                  }}
                >

                  <div className="card-body">

                    {/* ==================================================
                        COURSE HEADER
                    ================================================== */}

                    <div className="d-flex align-items-start justify-content-between mb-3">

                      <div
                        className="rounded-3 d-flex align-items-center justify-content-center"
                        style={{
                          width: "48px",
                          height: "48px",
                          background: "#eef3ff",
                          color: "#23439c",
                        }}
                      >
                        <Book size={23} />
                      </div>

                      <span className="badge bg-success">
                        Active
                      </span>

                    </div>


                    {/* ==================================================
                        COURSE CODE
                    ================================================== */}

                    <div className="text-muted small mb-1">
                      {course.code || "Course"}
                    </div>


                    {/* ==================================================
                        COURSE NAME
                    ================================================== */}

                    <h5 className="fw-bold mb-3">
                      {course.name ||
                        "Course name unavailable"}
                    </h5>


                    {/* ==================================================
                        DETAILS
                    ================================================== */}

                    <div className="small text-muted">

                      {/* Batch */}

                      <div className="d-flex align-items-center mb-2">

                        <People
                          size={16}
                          className="me-2"
                        />

                        <span>
                          Batch:{" "}
                          <strong className="text-dark">
                            {batch.name
                              ? batch.name
                              : batch.startYear &&
                                batch.endYear
                              ? `${batch.startYear}-${batch.endYear}`
                              : "Not available"}
                          </strong>
                        </span>

                      </div>


                      {/* Semester */}

                      <div className="d-flex align-items-center mb-2">

                        <Layers
                          size={16}
                          className="me-2"
                        />

                        <span>
                          Semester:{" "}
                          <strong className="text-dark">
                            {semester.semesterNumber
                              ? `Semester ${semester.semesterNumber}`
                              : "Not available"}
                          </strong>
                        </span>

                      </div>


                      {/* Academic Year */}

                      <div className="d-flex align-items-center mb-2">

                        <Calendar3
                          size={16}
                          className="me-2"
                        />

                        <span>
                          Academic Year:{" "}
                          <strong className="text-dark">
                            {academicYear.name
                              ? academicYear.name
                              : academicYear.startYear &&
                                academicYear.endYear
                              ? `${academicYear.startYear}-${academicYear.endYear}`
                              : "Not available"}
                          </strong>
                        </span>

                      </div>


                      {/* Section */}

                      {offering.section && (

                        <div className="d-flex align-items-center mb-2">

                          <Book
                            size={16}
                            className="me-2"
                          />

                          <span>
                            Section:{" "}
                            <strong className="text-dark">
                              {offering.section}
                            </strong>
                          </span>

                        </div>

                      )}

                    </div>


                    {/* ==================================================
                        ACTIONS
                    ================================================== */}

                    <div className="d-flex gap-2 mt-4">

                      <button
                        type="button"
                        className="btn btn-primary flex-grow-1"
                        onClick={() =>
                          navigate(
                            `/faculty/course-outcomes?courseId=${course.id}`
                          )
                        }
                      >
                        Course Outcomes
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() =>
                          navigate(
                            `/faculty/co-po-mapping?courseId=${course.id}`
                          )
                        }
                      >
                        CO–PO
                      </button>

                    </div>

                  </div>

                </div>

              </div>
            );
          })}

        </div>

      )}

    </div>
  );
}

export default FacultyCourses;