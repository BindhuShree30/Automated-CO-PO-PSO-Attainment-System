import { useMemo, useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";

import {
  Search,
  Upload,
  CheckCircle,
  PersonPlus,
  FileEarmarkExcel,
  Trash,
  Check2Circle,
  XCircle,
  ArrowRepeat,
} from "react-bootstrap-icons";

import { useCourseOfferings } from "../../hooks/useCourseOfferings";
import {
  useBulkRegisterStudents,
  useRegistrationsByCourseOffering,
  useDeleteCourseRegistration,
  useUpdateCourseRegistration,
} from "../../hooks/useCourseRegistrations";
import { useStudents } from "../../hooks/useStudents";

function CourseRegistrationStudents() {
  const { courseOfferingId: urlCourseOfferingId } = useParams();

  const [selectedCourseOfferingId, setSelectedCourseOfferingId] = useState(
    urlCourseOfferingId || ""
  );
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [search, setSearch] = useState("");
  const [activeMode, setActiveMode] = useState("manual");
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const fileInputRef = useRef(null);

  // Sync route param if navigation changes
  useEffect(() => {
    if (urlCourseOfferingId) {
      setSelectedCourseOfferingId(urlCourseOfferingId);
    }
  }, [urlCourseOfferingId]);

  // =========================================================
  // DATA QUERIES
  // =========================================================
  const {
    data: courseOfferings = [],
    isLoading: courseOfferingsLoading,
    isError: courseOfferingsError,
  } = useCourseOfferings();

  const { data: students = [], isLoading: studentsLoading } = useStudents();

  const {
    data: registrations = [],
    isLoading: registrationsLoading,
    refetch: refetchRegistrations,
  } = useRegistrationsByCourseOffering(selectedCourseOfferingId);

  // =========================================================
  // MUTATIONS (REGISTER, UPDATE, DELETE)
  // =========================================================
  const bulkRegisterMutation = useBulkRegisterStudents();
  const deleteRegistrationMutation = useDeleteCourseRegistration();
  const updateRegistrationMutation = useUpdateCourseRegistration();

  // =========================================================
  // SELECTED OFFERING
  // =========================================================
  const selectedOffering = useMemo(() => {
    return courseOfferings.find((item) => item.id === selectedCourseOfferingId);
  }, [courseOfferings, selectedCourseOfferingId]);

  // =========================================================
  // REGISTERED STUDENT IDS
  // =========================================================
  const registeredStudentIds = useMemo(() => {
    return new Set(
      registrations.map((reg) => reg.studentId || reg.student?.id)
    );
  }, [registrations]);

  // =========================================================
  // BATCH MATCHING (Direct & Nested Semester Resolution)
  // =========================================================
  const availableStudents = useMemo(() => {
    if (!selectedOffering) return [];

    const targetBatchId =
      selectedOffering.batchId || selectedOffering.batch?.id;

    return students.filter((student) => {
      const studentBatchId =
        student.batchId ||
        student.batch?.id ||
        student.semester?.batchId ||
        student.semester?.batch?.id;

      // Match strictly if student has batch information, otherwise permit enrollment
      if (!targetBatchId || !studentBatchId) {
        return true;
      }

      return String(studentBatchId) === String(targetBatchId);
    });
  }, [students, selectedOffering]);

  // =========================================================
  // SEARCH FILTER
  // =========================================================
  const filteredStudents = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return availableStudents;

    return availableStudents.filter((student) => {
      const usn = student.usn || student.USN || "";
      const firstName = student.firstName || "";
      const lastName = student.lastName || "";
      const name = student.name || `${firstName} ${lastName}`;
      const email = student.email || "";

      return (
        String(usn).toLowerCase().includes(value) ||
        String(name).toLowerCase().includes(value) ||
        String(email).toLowerCase().includes(value)
      );
    });
  }, [availableStudents, search]);

  // Unregistered students available for manual selection
  const selectableStudents = useMemo(() => {
    return filteredStudents.filter(
      (student) => !registeredStudentIds.has(student.id)
    );
  }, [filteredStudents, registeredStudentIds]);

  const allVisibleSelected =
    selectableStudents.length > 0 &&
    selectableStudents.every((student) =>
      selectedStudentIds.includes(student.id)
    );

  // =========================================================
  // SELECTION HANDLERS
  // =========================================================
  const handleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedStudentIds((prev) =>
        prev.filter((id) => !selectableStudents.some((s) => s.id === id))
      );
      return;
    }

    setSelectedStudentIds((prev) => {
      const ids = new Set(prev);
      selectableStudents.forEach((student) => ids.add(student.id));
      return Array.from(ids);
    });
  };

  const handleStudentSelect = (studentId) => {
    setSelectedStudentIds((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      }
      return [...prev, studentId];
    });
  };

  const handleCourseChange = (event) => {
    setSelectedCourseOfferingId(event.target.value);
    setSelectedStudentIds([]);
    setSearch("");
    setUploadResult(null);
  };

  // =========================================================
  // MANUAL REGISTRATION
  // =========================================================
  const handleManualRegister = async () => {
    if (!selectedCourseOfferingId) {
      toast.error("Please select a course offering.");
      return;
    }

    if (selectedStudentIds.length === 0) {
      toast.error("Please select at least one student.");
      return;
    }

    try {
      await bulkRegisterMutation.mutateAsync({
        courseOfferingId: selectedCourseOfferingId,
        studentIds: selectedStudentIds,
      });

      toast.success(
        `${selectedStudentIds.length} student(s) registered successfully.`
      );
      setSelectedStudentIds([]);
      if (refetchRegistrations) refetchRegistrations();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to register students."
      );
    }
  };

  // =========================================================
  // EDIT STATUS (ACTIVE / INACTIVE TOGGLE)
  // =========================================================
  const handleToggleStatus = async (reg) => {
    const nextStatus = !reg.status;
    const studentName = getStudentName(reg.student);

    try {
      await updateRegistrationMutation.mutateAsync({
        id: reg.id,
        data: { status: nextStatus },
      });

      toast.success(
        `Updated status for ${studentName} to ${nextStatus ? "Active" : "Inactive"}.`
      );
      if (refetchRegistrations) refetchRegistrations();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to update student status."
      );
    }
  };

  // =========================================================
  // DELETE REGISTRATION (REMOVE STUDENT)
  // =========================================================
  const handleDeleteRegistration = async (registrationId, studentName) => {
    if (
      !window.confirm(
        `Are you sure you want to remove ${studentName || "this student"} from the course?`
      )
    ) {
      return;
    }

    try {
      await deleteRegistrationMutation.mutateAsync(registrationId);
      toast.success("Student removed successfully.");
      if (refetchRegistrations) refetchRegistrations();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to remove student."
      );
    }
  };

  // =========================================================
  // EXCEL / CSV UPLOAD
  // =========================================================
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!selectedCourseOfferingId) {
      toast.error("Please select a course offering first.");
      event.target.value = "";
      return;
    }

    try {
      setUploading(true);
      setUploadResult(null);

      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      if (!rows.length) {
        throw new Error("The uploaded file is empty.");
      }

      // Normalize USN header format
      const uploadedUSNs = rows
        .map(
          (row) =>
            row.USN ||
            row.usn ||
            row.Usn ||
            row["Student USN"] ||
            row["StudentUSN"] ||
            ""
        )
        .map((usn) => String(usn).trim().toUpperCase())
        .filter(Boolean);

      if (!uploadedUSNs.length) {
        throw new Error("No USN column found in the uploaded file.");
      }

      const uniqueUSNs = [...new Set(uploadedUSNs)];

      // Build student lookup table
      const studentMap = new Map();
      availableStudents.forEach((student) => {
        const usn = student.usn || student.USN;
        if (usn) {
          studentMap.set(String(usn).trim().toUpperCase(), student);
        }
      });

      const matchedStudents = [];
      const notFoundUSNs = [];

      uniqueUSNs.forEach((usn) => {
        const student = studentMap.get(usn);
        if (student) {
          matchedStudents.push(student);
        } else {
          notFoundUSNs.push(usn);
        }
      });

      const alreadyRegistered = [];
      const newStudents = matchedStudents.filter((student) => {
        if (registeredStudentIds.has(student.id)) {
          alreadyRegistered.push(student);
          return false;
        }
        return true;
      });

      if (!newStudents.length) {
        setUploadResult({
          total: uniqueUSNs.length,
          matched: matchedStudents.length,
          registered: 0,
          alreadyRegistered: alreadyRegistered.length,
          notFound: notFoundUSNs.length,
          notFoundUSNs,
        });
        toast.info("No new students were found to register.");
        return;
      }

      await bulkRegisterMutation.mutateAsync({
        courseOfferingId: selectedCourseOfferingId,
        studentIds: newStudents.map((s) => s.id),
      });

      setUploadResult({
        total: uniqueUSNs.length,
        matched: matchedStudents.length,
        registered: newStudents.length,
        alreadyRegistered: alreadyRegistered.length,
        notFound: notFoundUSNs.length,
        notFoundUSNs,
      });

      toast.success(`${newStudents.length} student(s) registered successfully.`);
      if (refetchRegistrations) refetchRegistrations();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Unable to process file."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  // =========================================================
  // DISPLAY HELPERS
  // =========================================================
  const getStudentName = (student) => {
    if (!student) return "—";
    if (student.name) return student.name;
    return [student.firstName, student.lastName].filter(Boolean).join(" ") || "—";
  };

  const getBatchName = (batch) => {
    if (!batch) return "—";
    return batch.name || `${batch.startYear || ""}-${batch.endYear || ""}`;
  };

  if (courseOfferingsLoading) {
    return <div className="container-fluid p-4">Loading course offerings...</div>;
  }

  if (courseOfferingsError) {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-danger">Unable to load course offerings.</div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* HEADER */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Course Registration</h2>
        <p className="text-muted mb-0">
          Register students and manage existing enrollments for your assigned courses.
        </p>
      </div>

      {/* COURSE OFFERING SELECTOR */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <label className="form-label fw-bold">Select Course Offering</label>
          <select
            className="form-select form-select-lg"
            value={selectedCourseOfferingId}
            onChange={handleCourseChange}
          >
            <option value="">Select course offering</option>
            {courseOfferings.map((offering) => {
              const course = offering.course;
              const batch = offering.batch;
              const semester = offering.semester;

              return (
                <option key={offering.id} value={offering.id}>
                  {course?.code || offering.courseId} - {course?.name || ""} |{" "}
                  {getBatchName(batch)} |{" "}
                  {semester
                    ? `Semester ${semester.semesterNumber}`
                    : offering.semesterId}{" "}
                  | Section {offering.section || "—"}
                </option>
              );
            })}
          </select>

          {selectedOffering && (
            <div className="row mt-4 pt-3 border-top">
              <div className="col-md-3">
                <small className="text-muted">Course</small>
                <div className="fw-semibold">{selectedOffering.course?.code}</div>
                <small>{selectedOffering.course?.name}</small>
              </div>
              <div className="col-md-3">
                <small className="text-muted">Batch</small>
                <div className="fw-semibold">
                  {getBatchName(selectedOffering.batch)}
                </div>
              </div>
              <div className="col-md-3">
                <small className="text-muted">Semester</small>
                <div className="fw-semibold">
                  Semester {selectedOffering.semester?.semesterNumber || "—"}
                </div>
              </div>
              <div className="col-md-3">
                <small className="text-muted">Section</small>
                <div className="fw-semibold">
                  {selectedOffering.section || "—"}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* REGISTRATION ACTION TABS */}
      {selectedCourseOfferingId && (
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h4 className="fw-bold mb-1">Add Students</h4>
                <p className="text-muted mb-0">
                  Select students manually or upload an Excel sheet.
                </p>
              </div>
              <div className="text-end">
                <span className="badge bg-primary fs-6">
                  {registrations.length} Currently Enrolled
                </span>
              </div>
            </div>

            {/* MODE TOGGLES */}
            <div className="btn-group mb-4">
              <button
                type="button"
                className={`btn ${
                  activeMode === "manual" ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => setActiveMode("manual")}
              >
                <PersonPlus className="me-2" />
                Manual Entry
              </button>
              <button
                type="button"
                className={`btn ${
                  activeMode === "upload" ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => setActiveMode("upload")}
              >
                <FileEarmarkExcel className="me-2" />
                Upload Students (Excel)
              </button>
            </div>

            {/* MANUAL ENTRY MODE */}
            {activeMode === "manual" && (
              <>
                <div className="input-group mb-3">
                  <span className="input-group-text">
                    <Search />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by USN, name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="border rounded mb-3">
                  <div className="p-3 border-bottom bg-light">
                    <label className="d-flex align-items-center gap-2 mb-0">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={allVisibleSelected}
                        onChange={handleSelectAll}
                        disabled={selectableStudents.length === 0}
                      />
                      <span className="fw-semibold">
                        Select All Available Students (
                        {selectableStudents.length} available to add)
                      </span>
                    </label>
                  </div>

                  <div
                    className="table-responsive"
                    style={{ maxHeight: "350px" }}
                  >
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light sticky-top">
                        <tr>
                          <th>#</th>
                          <th>USN</th>
                          <th>Student Name</th>
                          <th>Email</th>
                          <th>Status</th>
                          <th className="text-center">Select</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentsLoading || registrationsLoading ? (
                          <tr>
                            <td colSpan="6" className="text-center py-4">
                              Loading students...
                            </td>
                          </tr>
                        ) : filteredStudents.length === 0 ? (
                          <tr>
                            <td
                              colSpan="6"
                              className="text-center py-4 text-muted"
                            >
                              No students found for this course offering's batch.
                            </td>
                          </tr>
                        ) : (
                          filteredStudents.map((student, index) => {
                            const isRegistered = registeredStudentIds.has(
                              student.id
                            );
                            const isSelected = selectedStudentIds.includes(
                              student.id
                            );

                            return (
                              <tr
                                key={student.id}
                                className={
                                  isRegistered ? "table-secondary bg-opacity-25" : ""
                                }
                              >
                                <td>{index + 1}</td>
                                <td className="fw-semibold">
                                  {student.usn || student.USN}
                                </td>
                                <td>{getStudentName(student)}</td>
                                <td>{student.email || "—"}</td>
                                <td>
                                  {isRegistered ? (
                                    <span className="badge bg-success">
                                      Enrolled
                                    </span>
                                  ) : (
                                    <span className="badge bg-secondary">
                                      Available
                                    </span>
                                  )}
                                </td>
                                <td className="text-center">
                                  {isRegistered ? (
                                    <CheckCircle className="text-success fs-5" />
                                  ) : (
                                    <input
                                      type="checkbox"
                                      className="form-check-input"
                                      checked={isSelected}
                                      onChange={() =>
                                        handleStudentSelect(student.id)
                                      }
                                    />
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">
                    {selectedStudentIds.length} student(s) selected
                  </span>
                  <button
                    type="button"
                    className="btn btn-primary px-4"
                    disabled={
                      selectedStudentIds.length === 0 ||
                      bulkRegisterMutation.isPending
                    }
                    onClick={handleManualRegister}
                  >
                    {bulkRegisterMutation.isPending
                      ? "Registering..."
                      : "Register Selected Students"}
                  </button>
                </div>
              </>
            )}

            {/* EXCEL UPLOAD MODE */}
            {activeMode === "upload" && (
              <div className="border rounded p-4 text-center">
                <FileEarmarkExcel size={45} className="text-success mb-2" />
                <h5 className="fw-bold">Upload Student List</h5>
                <p className="text-muted mb-2">
                  Excel or CSV must have a header column named <code>USN</code>.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="d-none"
                  onChange={handleFileUpload}
                />
                <button
                  type="button"
                  className="btn btn-success btn-lg mt-2"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="me-2" />
                  {uploading ? "Processing..." : "Choose Excel File"}
                </button>

                {uploadResult && (
                  <div className="mt-4 text-start">
                    <h6 className="fw-bold">Upload Results:</h6>
                    <div className="row g-2">
                      <div className="col-3">
                        <div className="p-2 border rounded bg-light">
                          Total: <strong>{uploadResult.total}</strong>
                        </div>
                      </div>
                      <div className="col-3">
                        <div className="p-2 border rounded bg-light text-success">
                          Enrolled: <strong>{uploadResult.registered}</strong>
                        </div>
                      </div>
                      <div className="col-3">
                        <div className="p-2 border rounded bg-light">
                          Already Enrolled:{" "}
                          <strong>{uploadResult.alreadyRegistered}</strong>
                        </div>
                      </div>
                      <div className="col-3">
                        <div className="p-2 border rounded bg-light text-danger">
                          Not Found: <strong>{uploadResult.notFound}</strong>
                        </div>
                      </div>
                    </div>

                    {uploadResult.notFoundUSNs?.length > 0 && (
                      <div className="alert alert-warning mt-3">
                        <strong>USNs not matching the batch:</strong>
                        <div className="small mt-1">
                          {uploadResult.notFoundUSNs.join(", ")}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          ENROLLED STUDENTS LIST (WITH EDIT & DELETE ACTIONS)
      ===================================================== */}
      {selectedCourseOfferingId && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0">
              Enrolled Students ({registrations.length})
            </h5>
            <small className="text-muted">
              Use Actions to toggle student active status or remove enrollment.
            </small>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>USN</th>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Enrollment Date</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {registrationsLoading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        Loading enrolled students...
                      </td>
                    </tr>
                  ) : registrations.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-muted">
                        No students are currently registered for this course offering.
                      </td>
                    </tr>
                  ) : (
                    registrations.map((reg, index) => {
                      const student = reg.student;
                      const studentName = getStudentName(student);

                      return (
                        <tr key={reg.id}>
                          <td>{index + 1}</td>
                          <td className="fw-semibold">
                            {student?.usn || "—"}
                          </td>
                          <td>{studentName}</td>
                          <td>{student?.email || "—"}</td>
                          <td>{reg.registrationDate || "—"}</td>
                          <td>
                            {reg.status ? (
                              <span className="badge bg-success d-inline-flex align-items-center gap-1">
                                <Check2Circle /> Active
                              </span>
                            ) : (
                              <span className="badge bg-secondary d-inline-flex align-items-center gap-1">
                                <XCircle /> Inactive
                              </span>
                            )}
                          </td>
                          <td className="text-end">
                            <div className="btn-group">
                              {/* Toggle Active / Inactive Status */}
                              <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
                                title="Toggle Status (Active/Inactive)"
                                disabled={updateRegistrationMutation.isPending}
                                onClick={() => handleToggleStatus(reg)}
                              >
                                <ArrowRepeat />
                                {reg.status ? "Set Inactive" : "Set Active"}
                              </button>

                              {/* Delete Enrollment */}
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-1 ms-1"
                                title="Remove Student from Course"
                                disabled={deleteRegistrationMutation.isPending}
                                onClick={() =>
                                  handleDeleteRegistration(reg.id, studentName)
                                }
                              >
                                <Trash /> Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseRegistrationStudents;