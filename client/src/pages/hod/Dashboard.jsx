import { useEffect, useState } from "react";

import {
  PeopleFill,
  PersonBadgeFill,
  BookFill,
  CollectionFill,
  JournalCheck,
  JournalText,
} from "react-bootstrap-icons";

import { getHodDashboard } from "../../services/dashboardService";

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    faculty: 0,
    students: 0,
    courses: 0,
    batches: 0,
    programOutcomes: 0,
    courseOfferings: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /**
   * ---------------------------------------------------------
   * Load HOD Dashboard Data
   * ---------------------------------------------------------
   */
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getHodDashboard();

        console.log("HOD Dashboard Data:", data);

        setDashboardData({
          faculty: Number(data?.faculty ?? 0),
          students: Number(data?.students ?? 0),
          courses: Number(data?.courses ?? 0),
          batches: Number(data?.batches ?? 0),
          programOutcomes: Number(
            data?.programOutcomes ?? 0
          ),
          courseOfferings: Number(
            data?.courseOfferings ?? 0
          ),
        });
      } catch (err) {
        console.error(
          "Failed to load HOD dashboard:",
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
   * Dashboard Summary Cards
   * ---------------------------------------------------------
   */
  const summaryCards = [
    {
      title: "Faculty",
      value: dashboardData.faculty,
      icon: <PersonBadgeFill />,
      description: "Department Faculty",
    },
    {
      title: "Students",
      value: dashboardData.students,
      icon: <PeopleFill />,
      description: "Total Students",
    },
    {
      title: "Courses",
      value: dashboardData.courses,
      icon: <BookFill />,
      description: "Department Courses",
    },
    {
      title: "Batches",
      value: dashboardData.batches,
      icon: <CollectionFill />,
      description: "Academic Batches",
    },
    {
      title: "Program Outcomes",
      value: dashboardData.programOutcomes,
      icon: <JournalCheck />,
      description: "Defined POs",
    },
    {
      title: "Course Offerings",
      value: dashboardData.courseOfferings,
      icon: <JournalText />,
      description: "Active Offerings",
    },
  ];

  return (
    <div className="container-fluid px-0">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="mb-4">

        <h2 className="fw-bold mb-1">
          HOD Dashboard
        </h2>

        <p className="text-muted mb-0">
          Department-level Outcome-Based Education
          overview
        </p>

      </div>


      {/* =====================================================
          ERROR MESSAGE
      ===================================================== */}

      {error && (
        <div
          className="alert alert-danger border-0 shadow-sm mb-4"
          role="alert"
        >
          <strong>Dashboard Error:</strong>{" "}
          {error}
        </div>
      )}


      {/* =====================================================
          OBE WELCOME SECTION
      ===================================================== */}

      <div
        className="card border-0 shadow-sm mb-4 overflow-hidden"
        style={{
          borderRadius: "18px",
          background:
            "linear-gradient(135deg, #0f2d5c 0%, #164a9c 55%, #2563eb 100%)",
        }}
      >

        <div className="card-body p-4 p-lg-5">

          <div className="row align-items-center">

            {/* =================================================
                LEFT CONTENT
            ================================================= */}

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
                Department OBE Overview
              </h3>

              <p
                className="mb-0"
                style={{
                  color:
                    "rgba(255,255,255,0.82)",
                  fontSize: "15px",
                  lineHeight: 1.7,
                  maxWidth: "620px",
                }}
              >
                Manage and monitor faculty, students,
                courses, batches, program outcomes and
                course offerings from one centralized
                platform.
              </p>

            </div>


            {/* =================================================
                RIGHT VISUAL
            ================================================= */}

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
                  position: "relative",
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

                  <JournalCheck
                    size={58}
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

        {summaryCards.map((card) => (

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

                  {/* =========================================
                      CARD TEXT
                  ========================================= */}

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


                  {/* =========================================
                      ICON
                  ========================================= */}

                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      background: "#eff6ff",
                      color: "#2563eb",
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

        ))}

      </div>

    </div>
  );
}

export default Dashboard;