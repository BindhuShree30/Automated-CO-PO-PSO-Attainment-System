/**
 * ------------------------------------------------------------------
 * Faculty Students
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Faculty can view student records.
 *
 * Student creation, editing, deletion and Excel import remain
 * HOD responsibilities.
 * ------------------------------------------------------------------
 */

import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

function FacultyStudents() {
  // ================================================================
  // STATE
  // ================================================================

  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ================================================================
  // LOAD STUDENTS
  // ================================================================

  const loadStudents = async () => {
    try {
      setLoading(true);

      const [
        studentsResponse,
        departmentsResponse,
        semestersResponse,
      ] = await Promise.all([
        api.get("/students"),
        api.get("/departments"),
        api.get("/semesters"),
      ]);

      const studentData =
        studentsResponse?.data?.data || [];

      const departmentData =
        departmentsResponse?.data?.data || [];

      const semesterData =
        semestersResponse?.data?.data || [];

      // --------------------------------------------------------------
      // SORT BY USN
      // --------------------------------------------------------------

      studentData.sort((a, b) => {
        const numberA = parseInt(
          a.usn?.match(/\d+$/)?.[0] || "0",
          10
        );

        const numberB = parseInt(
          b.usn?.match(/\d+$/)?.[0] || "0",
          10
        );

        return numberA - numberB;
      });

      setStudents(studentData);
      setDepartments(departmentData);
      setSemesters(semesterData);
    } catch (error) {
      console.error(
        "Failed to load faculty student data:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to load students."
      );
    } finally {
      setLoading(false);
    }
  };

  // ================================================================
  // INITIAL LOAD
  // ================================================================

  useEffect(() => {
    loadStudents();
  }, []);

  // ================================================================
  // DEPARTMENT NAME
  // ================================================================

  const getDepartmentName = (student) => {
    if (student.department?.name) {
      return student.department.name;
    }

    if (student.departmentName) {
      return student.departmentName;
    }

    const department = departments.find(
      (item) =>
        item.id === student.departmentId
    );

    return department?.name || "Not Assigned";
  };

  // ================================================================
  // DEPARTMENT CODE
  // ================================================================

  const getDepartmentCode = (student) => {
    if (student.department?.code) {
      return student.department.code;
    }

    const department = departments.find(
      (item) =>
        item.id === student.departmentId
    );

    return department?.code || "";
  };

  // ================================================================
  // SEMESTER
  // ================================================================

  const getSemesterName = (student) => {
    if (student.semester) {
      if (
        student.semester.semesterNumber !==
          undefined &&
        student.semester.semesterNumber !== null
      ) {
        return `Semester ${student.semester.semesterNumber}`;
      }

      if (student.semester.name) {
        return student.semester.name;
      }

      if (student.semester.number) {
        return `Semester ${student.semester.number}`;
      }
    }

    if (student.semesterName) {
      return student.semesterName;
    }

    const semester = semesters.find(
      (item) =>
        item.id === student.semesterId
    );

    if (!semester) {
      return "Not Assigned";
    }

    if (
      semester.semesterNumber !==
        undefined &&
      semester.semesterNumber !== null
    ) {
      return `Semester ${semester.semesterNumber}`;
    }

    if (semester.name) {
      return semester.name;
    }

    if (semester.number) {
      return `Semester ${semester.number}`;
    }

    return "Not Assigned";
  };

  // ================================================================
  // SEARCH
  // ================================================================

  const searchText =
    search.trim().toLowerCase();

  const filteredStudents =
    students.filter((student) => {
      if (!searchText) {
        return true;
      }

      const name =
        `${student.firstName || ""} ${
          student.lastName || ""
        }`.toLowerCase();

      const usn =
        student.usn?.toLowerCase() || "";

      const email =
        student.email?.toLowerCase() || "";

      const phone =
        student.phone?.toLowerCase() || "";

      const department =
        getDepartmentName(student)
          .toLowerCase();

      const semester =
        getSemesterName(student)
          .toLowerCase();

      return (
        name.includes(searchText) ||
        usn.includes(searchText) ||
        email.includes(searchText) ||
        phone.includes(searchText) ||
        department.includes(searchText) ||
        semester.includes(searchText)
      );
    });

  // ================================================================
  // PRINT
  // ================================================================

  const handlePrintStudents = () => {
    if (!students.length) {
      toast.error(
        "There are no students available to print."
      );

      return;
    }

    window.print();
  };

  // ================================================================
  // LOADING
  // ================================================================

  if (loading) {
    return (
      <div
        style={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="text-center">
          <div
            className="spinner-border text-primary"
            role="status"
          >
            <span className="visually-hidden">
              Loading...
            </span>
          </div>

          <p className="text-muted mt-3 mb-0">
            Loading students...
          </p>
        </div>
      </div>
    );
  }

  // ================================================================
  // UI
  // ================================================================

  return (
    <>
      {/* ============================================================
          PRINT STYLES
      ============================================================ */}

      <style>{`
        .faculty-students-page {
          max-width: 1500px;
          margin: 0 auto;
        }

        .student-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 28px;
        }

        .student-page-title {
          font-size: 30px;
          font-weight: 700;
          color: #172033;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .student-page-subtitle {
          margin: 7px 0 0;
          color: #718096;
          font-size: 15px;
        }

        .print-student-btn {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 11px 18px;
          border: 1px solid #d8dee9;
          border-radius: 10px;
          background: #ffffff;
          color: #25324a;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .print-student-btn:hover {
          background: #f7f9fc;
          border-color: #b9c4d6;
          transform: translateY(-1px);
        }

        .student-stat-card {
          position: relative;
          overflow: hidden;
          min-height: 125px;
          border: 1px solid #e7ebf2;
          border-radius: 16px;
          background: #ffffff;
          box-shadow: 0 4px 16px rgba(20, 35, 60, 0.06);
        }

        .student-stat-card::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: #2563eb;
        }

        .student-stat-content {
          height: 100%;
          padding: 22px 26px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .student-stat-label {
          color: #718096;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 7px;
        }

        .student-stat-value {
          color: #172033;
          font-size: 30px;
          font-weight: 700;
          line-height: 1;
        }

        .student-stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eff6ff;
          color: #2563eb;
          font-size: 21px;
        }

        .student-search-card {
          margin-top: 24px;
          border: 1px solid #e7ebf2;
          border-radius: 14px;
          background: #ffffff;
          box-shadow: 0 3px 14px rgba(20, 35, 60, 0.045);
        }

        .student-search-body {
          padding: 18px 20px;
        }

        .student-search-wrapper {
          position: relative;
        }

        .student-search-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-size: 16px;
          pointer-events: none;
        }

        .student-search-input {
          height: 46px;
          padding-left: 42px;
          border: 1px solid #dce2eb;
          border-radius: 9px;
          font-size: 14px;
          color: #25324a;
          box-shadow: none !important;
        }

        .student-search-input:focus {
          border-color: #7da5f8;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08) !important;
        }

        .student-table-card {
          margin-top: 24px;
          overflow: hidden;
          border: 1px solid #e7ebf2;
          border-radius: 16px;
          background: #ffffff;
          box-shadow: 0 4px 18px rgba(20, 35, 60, 0.055);
        }

        .student-table-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 22px;
          border-bottom: 1px solid #edf0f5;
        }

        .student-table-title {
          margin: 0;
          font-size: 16px;
          font-weight: 650;
          color: #25324a;
        }

        .student-table-count {
          padding: 5px 10px;
          border-radius: 20px;
          background: #f1f5f9;
          color: #64748b;
          font-size: 12px;
          font-weight: 600;
        }

        .student-table {
          margin-bottom: 0 !important;
        }

        .student-table thead th {
          padding: 14px 18px;
          border-bottom: 1px solid #e5eaf1;
          background: #f8fafc;
          color: #64748b;
          font-size: 12px;
          font-weight: 650;
          text-transform: uppercase;
          letter-spacing: 0.45px;
          white-space: nowrap;
        }

        .student-table tbody td {
          padding: 15px 18px;
          border-bottom: 1px solid #f0f2f6;
          color: #334155;
          font-size: 14px;
          vertical-align: middle;
        }

        .student-table tbody tr:last-child td {
          border-bottom: none;
        }

        .student-table tbody tr:hover {
          background: #fafcff;
        }

        .student-number {
          color: #94a3b8;
          font-size: 13px;
        }

        .student-usn {
          color: #1e40af;
          font-weight: 650;
          letter-spacing: 0.2px;
        }

        .student-name {
          color: #1e293b;
          font-weight: 600;
        }

        .student-email {
          color: #64748b;
        }

        .student-department-code {
          color: #334155;
          font-weight: 650;
        }

        .student-department-name {
          margin-top: 2px;
          color: #94a3b8;
          font-size: 12px;
        }

        .student-semester-badge {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 7px;
          background: #f1f5f9;
          color: #475569;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
        }

        .student-empty {
          padding: 60px 20px;
          text-align: center;
          color: #64748b;
        }

        .student-empty-icon {
          width: 52px;
          height: 52px;
          margin: 0 auto 14px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f1f5f9;
          color: #94a3b8;
          font-size: 21px;
        }

        @media (max-width: 768px) {
          .student-page-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .student-page-title {
            font-size: 26px;
          }

          .student-stat-card {
            max-width: 100%;
          }

          .print-student-btn {
            width: 100%;
            justify-content: center;
          }
        }

        @media print {
          @page {
            size: A4 landscape;
            margin: 12mm;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
          }

          body * {
            visibility: hidden !important;
          }

          .faculty-student-print,
          .faculty-student-print * {
            visibility: visible !important;
          }

          .faculty-student-print {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: 0 !important;
            box-shadow: none !important;
          }

          .no-print {
            display: none !important;
          }

          .student-table {
            width: 100% !important;
            border-collapse: collapse !important;
          }

          .student-table th,
          .student-table td {
            border: 1px solid #999 !important;
            padding: 6px !important;
            color: #000 !important;
          }
        }
      `}</style>

      <div className="container-fluid py-4">

        <div className="faculty-students-page">

          {/* ======================================================
              HEADER
          ====================================================== */}

          <div className="student-page-header">

            <div>
              <h1 className="student-page-title">
                Students
              </h1>

              <p className="student-page-subtitle">
                View student records and academic information.
              </p>
            </div>

            <button
              type="button"
              className="print-student-btn no-print"
              onClick={handlePrintStudents}
              disabled={students.length === 0}
            >
              <i className="bi bi-printer"></i>
              Print Student List
            </button>

          </div>

          {/* ======================================================
              TOTAL STUDENTS
          ====================================================== */}

          <div className="row">

            <div className="col-xl-4 col-lg-5 col-md-6">

              <div className="student-stat-card">

                <div className="student-stat-content">

                  <div>
                    <div className="student-stat-label">
                      Total Students
                    </div>

                    <div className="student-stat-value">
                      {students.length}
                    </div>
                  </div>

                  <div className="student-stat-icon">
                    <i className="bi bi-people"></i>
                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* ======================================================
              SEARCH
          ====================================================== */}

          <div className="student-search-card no-print">

            <div className="student-search-body">

              <div className="student-search-wrapper">

                <i className="bi bi-search student-search-icon"></i>

                <input
                  type="text"
                  className="form-control student-search-input"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search by USN, name, email, phone, department or semester..."
                />

              </div>

            </div>

          </div>

          {/* ======================================================
              STUDENT TABLE
          ====================================================== */}

          <div
            className="student-table-card faculty-student-print"
          >

            {/* TABLE HEADER */}

            <div className="student-table-header">

              <h5 className="student-table-title">
                Student List
              </h5>

              <span className="student-table-count">
                {filteredStudents.length} Students
              </span>

            </div>

            {/* TABLE */}

            {filteredStudents.length === 0 ? (

              <div className="student-empty">

                <div className="student-empty-icon">
                  <i className="bi bi-people"></i>
                </div>

                <h6 className="fw-semibold">
                  No students found
                </h6>

                <p className="mb-0">
                  Try changing your search criteria.
                </p>

              </div>

            ) : (

              <div className="table-responsive">

                <table className="table student-table">

                  <thead>

                    <tr>

                      <th className="px-4">
                        #
                      </th>

                      <th>
                        USN
                      </th>

                      <th>
                        Student Name
                      </th>

                      <th>
                        Email
                      </th>

                      <th>
                        Phone
                      </th>

                      <th>
                        Department
                      </th>

                      <th>
                        Semester
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredStudents.map(
                      (
                        student,
                        index
                      ) => {

                        const departmentName =
                          getDepartmentName(
                            student
                          );

                        const departmentCode =
                          getDepartmentCode(
                            student
                          );

                        const semesterName =
                          getSemesterName(
                            student
                          );

                        return (
                          <tr
                            key={
                              student.id
                            }
                          >

                            <td className="px-4 student-number">
                              {index + 1}
                            </td>

                            <td>
                              <span className="student-usn">
                                {student.usn}
                              </span>
                            </td>

                            <td>
                              <span className="student-name">
                                {student.firstName}{" "}
                                {student.lastName}
                              </span>
                            </td>

                            <td>
                              <span className="student-email">
                                {student.email ||
                                  "-"}
                              </span>
                            </td>

                            <td>
                              {student.phone ||
                                "-"}
                            </td>

                            <td>

                              {departmentName !==
                              "Not Assigned" ? (
                                <div>

                                  {departmentCode && (
                                    <div className="student-department-code">
                                      {
                                        departmentCode
                                      }
                                    </div>
                                  )}

                                  <div className="student-department-name">
                                    {
                                      departmentName
                                    }
                                  </div>

                                </div>
                              ) : (
                                <span className="text-muted">
                                  Not Assigned
                                </span>
                              )}

                            </td>

                            <td>

                              {semesterName !==
                              "Not Assigned" ? (
                                <span className="student-semester-badge">
                                  {
                                    semesterName
                                  }
                                </span>
                              ) : (
                                <span className="text-muted">
                                  Not Assigned
                                </span>
                              )}

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </div>

      </div>
    </>
  );
}

export default FacultyStudents;