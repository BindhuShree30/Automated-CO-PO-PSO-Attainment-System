import { useEffect, useState } from "react";

import {
  BookFill,
  PeopleFill,
  JournalCheck,
  ClipboardCheck,
  Diagram3Fill,
  FileEarmarkTextFill,
} from "react-bootstrap-icons";

import {
  getFacultyDashboard,
} from "../../services/facultyDashboardService";

function FacultyDashboard() {

  const [dashboardData, setDashboardData] =
    useState({
      courses: 0,
      students: 0,
      courseOutcomes: 0,
      assessments: 0,
      coPoMappings: 0,
      coPsoMappings: 0,
    });

  const [faculty, setFaculty] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /**
   * ---------------------------------------------------------
   * Load Faculty Dashboard
   * ---------------------------------------------------------
   */

  useEffect(() => {

    const loadDashboard = async () => {

      try {

        setLoading(true);

        setError("");

        const data =
          await getFacultyDashboard();

        console.log(
          "Faculty Dashboard Data:",
          data
        );


        setFaculty(
          data?.faculty ?? null
        );


        setDashboardData({

          courses:
            Number(
              data?.courses ?? 0
            ),

          students:
            Number(
              data?.students ?? 0
            ),

          courseOutcomes:
            Number(
              data?.courseOutcomes ?? 0
            ),

          assessments:
            Number(
              data?.assessments ?? 0
            ),

          coPoMappings:
            Number(
              data?.coPoMappings ?? 0
            ),

          coPsoMappings:
            Number(
              data?.coPsoMappings ?? 0
            ),

        });

      } catch (err) {

        console.error(
          "Failed to load Faculty Dashboard:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Unable to load dashboard data."
        );

      } finally {

        setLoading(false);

      }
    };


    loadDashboard();

  }, []);


  /**
   * ---------------------------------------------------------
   * Summary Cards
   * ---------------------------------------------------------
   */

  const summaryCards = [

    {
      title: "My Courses",
      value:
        dashboardData.courses,
      icon:
        <BookFill />,
      description:
        "Assigned Courses",
    },

    {
      title: "Students",
      value:
        dashboardData.students,
      icon:
        <PeopleFill />,
      description:
        "Students in My Courses",
    },

    {
      title: "Course Outcomes",
      value:
        dashboardData.courseOutcomes,
      icon:
        <JournalCheck />,
      description:
        "Defined COs",
    },

    {
      title: "Assessments",
      value:
        dashboardData.assessments,
      icon:
        <ClipboardCheck />,
      description:
        "Course Assessments",
    },

    {
      title: "CO–PO Mapping",
      value:
        dashboardData.coPoMappings,
      icon:
        <Diagram3Fill />,
      description:
        "Mapping Records",
    },

    {
      title: "CO–PSO Mapping",
      value:
        dashboardData.coPsoMappings,
      icon:
        <FileEarmarkTextFill />,
      description:
        "Mapping Records",
    },

  ];


  return (

    <div className="container-fluid px-0">


      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="mb-4">

        <h2 className="fw-bold mb-1">
          Faculty Dashboard
        </h2>

        <p className="text-muted mb-0">

          {faculty
            ? `Welcome ${faculty.firstName} ${faculty.lastName}`
            : "Manage your academic and OBE activities"}

        </p>

      </div>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (

        <div
          className="alert alert-danger border-0 shadow-sm mb-4"
          role="alert"
        >

          <strong>
            Dashboard Error:
          </strong>{" "}

          {error}

        </div>

      )}


      {/* =====================================================
          WELCOME SECTION
      ===================================================== */}

      <div
        className="card border-0 shadow-sm mb-4 overflow-hidden"
        style={{
          borderRadius: "18px",
          background:
            "linear-gradient(135deg, #123c4a 0%, #176b78 55%, #159a9c 100%)",
        }}
      >

        <div className="card-body p-4 p-lg-5">

          <div className="row align-items-center">


            {/* LEFT */}

            <div className="col-lg-7">

              <span
                className="badge rounded-pill px-3 py-2 mb-3"
                style={{
                  background:
                    "rgba(255,255,255,0.14)",
                  color: "#ffffff",
                  fontWeight: 500,
                }}
              >
                OBE Insight
              </span>


              <h3
                className="fw-bold mb-3"
                style={{
                  color: "#ffffff",
                  fontSize: "30px",
                }}
              >
                Faculty Workspace
              </h3>


              <p
                className="mb-0"
                style={{
                  color:
                    "rgba(255,255,255,0.84)",
                  fontSize: "15px",
                  lineHeight: 1.7,
                  maxWidth: "620px",
                }}
              >
                Manage your assigned courses,
                students, course outcomes,
                assessments and CO–PO–PSO
                mapping activities from one
                centralized workspace.
              </p>

            </div>


            {/* RIGHT */}

            <div
              className="col-lg-5 d-flex justify-content-center mt-4 mt-lg-0"
            >

              <div
                style={{
                  width: "190px",
                  height: "190px",
                  borderRadius: "50%",
                  background:
                    "rgba(255,255,255,0.10)",
                  border:
                    "1px solid rgba(255,255,255,0.20)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >

                <div
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "24px",
                    background:
                      "rgba(255,255,255,0.14)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow:
                      "0 15px 35px rgba(0,0,0,0.15)",
                  }}
                >

                  <BookFill
                    size={55}
                    color="#ffffff"
                  />

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="row g-4">

        {summaryCards.map(
          (card) => (

            <div
              className="col-12 col-sm-6 col-xl-4"
              key={card.title}
            >

              <div
                className="card border-0 shadow-sm h-100"
                style={{
                  borderRadius: "16px",
                }}
              >

                <div className="card-body p-4">

                  <div
                    className="d-flex align-items-start justify-content-between"
                  >

                    <div>

                      <p
                        className="text-muted mb-2"
                        style={{
                          fontSize: "14px",
                          fontWeight: 500,
                        }}
                      >
                        {card.title}
                      </p>


                      <h3
                        className="fw-bold mb-1"
                        style={{
                          fontSize: "30px",
                          color: "#172033",
                        }}
                      >
                        {loading
                          ? "..."
                          : card.value}
                      </h3>


                      <small className="text-muted">
                        {card.description}
                      </small>

                    </div>


                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "12px",
                        background:
                          "#ecfeff",
                        color:
                          "#0f8b8d",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "22px",
                      }}
                    >
                      {card.icon}
                    </div>

                  </div>

                </div>

              </div>

            </div>

          )
        )}

      </div>

    </div>

  );
}

export default FacultyDashboard;