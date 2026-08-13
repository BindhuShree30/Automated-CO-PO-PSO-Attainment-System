import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios";

function Students() {
    const fileInputRef = useRef(null);

    // =====================================================
    // STATE
    // =====================================================

    const [students, setStudents] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [semesters, setSemesters] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [departmentsLoading, setDepartmentsLoading] =
        useState(false);

    const [semestersLoading, setSemestersLoading] =
        useState(false);

    const [showStudentModal, setShowStudentModal] =
        useState(false);

    const [showUploadModal, setShowUploadModal] =
        useState(false);

    const [editingStudent, setEditingStudent] =
        useState(null);

    const [selectedFile, setSelectedFile] =
        useState(null);

    const [previewData, setPreviewData] =
        useState(null);

    const [previewLoading, setPreviewLoading] =
        useState(false);

    const [importing, setImporting] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [deletingId, setDeletingId] =
        useState(null);

    // =====================================================
    // STUDENT FORM
    // =====================================================

    const [formData, setFormData] = useState({
        usn: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        departmentId: "",
        semesterId: "",
    });

    // =====================================================
    // LOAD STUDENTS
    // LOAD DEPARTMENTS
    // LOAD SEMESTERS
    // =====================================================

    const loadStudents = async () => {
        try {
            setLoading(true);
            setDepartmentsLoading(true);
            setSemestersLoading(true);

            const [
                studentsResponse,
                departmentsResponse,
                semestersResponse,
            ] = await Promise.all([
                api.get("/students"),
                api.get("/departments"),
                api.get("/semesters"),
            ]);

            // ---------------------------------------------
            // STUDENTS
            // ---------------------------------------------

            const studentData =
                studentsResponse.data?.data || [];

            // ---------------------------------------------
            // DEPARTMENTS
            // ---------------------------------------------

            const departmentData =
                departmentsResponse.data?.data || [];

            // ---------------------------------------------
            // SEMESTERS
            // ---------------------------------------------

            const semesterData =
                semestersResponse.data?.data || [];

            // ---------------------------------------------
            // SORT STUDENTS BY USN
            // ---------------------------------------------

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

            console.log(
                "Students:",
                studentData
            );

            console.log(
                "Departments:",
                departmentData
            );

            console.log(
                "Semesters:",
                semesterData
            );

        } catch (error) {
            console.error(
                "Failed to load student data:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to load students, departments and semesters."
            );
        } finally {
            setLoading(false);
            setDepartmentsLoading(false);
            setSemestersLoading(false);
        }
    };

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {
        loadStudents();
    }, []);

    // =====================================================
    // REFRESH
    // =====================================================

    const handleRefresh = async () => {
        try {
            setRefreshing(true);

            await loadStudents();

        } finally {
            setRefreshing(false);
        }
    };

    // =====================================================
    // FORM CHANGE
    // =====================================================

    const handleInputChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // =====================================================
    // RESET FORM
    // =====================================================

    const resetForm = () => {
        setFormData({
            usn: "",
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            departmentId: "",
            semesterId: "",
        });

        setEditingStudent(null);
    };

    // =====================================================
    // ADD STUDENT
    // =====================================================

    const handleAddStudent = () => {
        resetForm();

        setShowStudentModal(true);
    };

    // =====================================================
    // EDIT STUDENT
    // =====================================================

    const handleEditStudent = (student) => {
        setEditingStudent(student);

        setFormData({
            usn: student.usn || "",

            firstName:
                student.firstName || "",

            lastName:
                student.lastName || "",

            email:
                student.email || "",

            phone:
                student.phone || "",

            departmentId:
                student.departmentId ||
                student.department?.id ||
                "",

            semesterId:
                student.semesterId ||
                student.semester?.id ||
                "",
        });

        setShowStudentModal(true);
    };

    // =====================================================
    // SAVE STUDENT
    // =====================================================

    const handleSaveStudent = async (event) => {
        event.preventDefault();

        // ---------------------------------------------
        // VALIDATION
        // ---------------------------------------------

        if (
            !formData.usn.trim() ||
            !formData.firstName.trim() ||
            !formData.lastName.trim() ||
            !formData.email.trim() ||
            !formData.departmentId ||
            !formData.semesterId
        ) {
            toast.error(
                "USN, first name, last name, email, department and semester are required."
            );

            return;
        }

        try {
            setSaving(true);

            // ---------------------------------------------
            // PAYLOAD
            // ---------------------------------------------

            const payload = {
                usn: formData.usn.trim(),

                firstName:
                    formData.firstName.trim(),

                lastName:
                    formData.lastName.trim(),

                email:
                    formData.email.trim(),

                phone:
                    formData.phone.trim() ||
                    undefined,

                departmentId:
                    formData.departmentId,

                semesterId:
                    formData.semesterId,
            };

            console.log(
                "Student payload:",
                payload
            );

            // ---------------------------------------------
            // UPDATE
            // ---------------------------------------------

            if (editingStudent) {
                await api.put(
                    `/students/${editingStudent.id}`,
                    payload
                );

                toast.success(
                    "Student updated successfully."
                );
            }

            // ---------------------------------------------
            // CREATE
            // ---------------------------------------------

            else {
                await api.post(
                    "/students",
                    payload
                );

                toast.success(
                    "Student added successfully."
                );
            }

            // ---------------------------------------------
            // CLOSE MODAL
            // ---------------------------------------------

            setShowStudentModal(false);

            resetForm();

            // ---------------------------------------------
            // REFRESH DATA
            // ---------------------------------------------

            await loadStudents();

        } catch (error) {
            console.error(
                "Save student error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to save student."
            );
        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // DELETE STUDENT
    // =====================================================

    const handleDeleteStudent = async (student) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${student.firstName} ${student.lastName}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(student.id);

            await api.delete(
                `/students/${student.id}`
            );

            toast.success(
                "Student deleted successfully."
            );

            await loadStudents();

        } catch (error) {
            console.error(
                "Delete student error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to delete student."
            );
        } finally {
            setDeletingId(null);
        }
    };

    // =====================================================
    // GET DEPARTMENT NAME
    // =====================================================

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

    // =====================================================
    // GET DEPARTMENT CODE
    // =====================================================

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

    // =====================================================
    // GET SEMESTER DISPLAY
    // =====================================================

    const getSemesterName = (student) => {
        if (student.semester) {
            if (
                student.semester.semesterNumber !==
                undefined &&
                student.semester.semesterNumber !==
                null
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

    // =====================================================
    // GET SEMESTER OPTION LABEL
    // =====================================================

    const getSemesterOptionLabel = (semester) => {
        if (
            semester.semesterNumber !==
            undefined &&
            semester.semesterNumber !== null
        ) {
            let label =
                `Semester ${semester.semesterNumber}`;

            if (semester.term) {
                label += ` - ${semester.term}`;
            }

            if (
                semester.academicYear?.name
            ) {
                label +=
                    ` (${semester.academicYear.name})`;
            }

            return label;
        }

        if (semester.name) {
            return semester.name;
        }

        if (semester.number) {
            return `Semester ${semester.number}`;
        }

        return "Semester";
    };

    // =====================================================
    // EXCEL UPLOAD
    // =====================================================

    const handleUploadExcel = () => {
        setSelectedFile(null);
        setPreviewData(null);

        setShowUploadModal(true);
    };

    // =====================================================
    // FILE CHANGE
    // =====================================================

    const handleFileChange = (event) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        const fileName =
            file.name.toLowerCase();

        const validFile =
            fileName.endsWith(".xlsx") ||
            fileName.endsWith(".xls");

        if (!validFile) {
            toast.error(
                "Please select an Excel file (.xlsx or .xls)."
            );

            event.target.value = "";

            return;
        }

        setSelectedFile(file);
        setPreviewData(null);
    };

    // =====================================================
    // PREVIEW EXCEL
    // =====================================================

    const handlePreviewExcel = async () => {
        if (!selectedFile) {
            toast.error(
                "Please select an Excel file first."
            );

            return;
        }

        try {
            setPreviewLoading(true);

            const data = new FormData();

            data.append(
                "file",
                selectedFile
            );

            const response = await api.post(
                "/students/upload/preview",
                data,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data",
                    },
                }
            );

            setPreviewData(
                response.data?.data
            );

            toast.success(
                "Excel file validated successfully."
            );

        } catch (error) {
            console.error(
                "Excel preview error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to preview Excel file."
            );
        } finally {
            setPreviewLoading(false);
        }
    };

    // =====================================================
    // IMPORT EXCEL
    // =====================================================

    const handleImportExcel = async () => {
        if (!selectedFile) {
            toast.error(
                "Please select an Excel file."
            );

            return;
        }

        if (!previewData) {
            toast.error(
                "Please preview the Excel file first."
            );

            return;
        }

        if (
            previewData.validCount === 0
        ) {
            toast.error(
                "There are no valid students available for import."
            );

            return;
        }

        try {
            setImporting(true);

            const data = new FormData();

            data.append(
                "file",
                selectedFile
            );

            const response = await api.post(
                "/students/upload/import",
                data,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data",
                    },
                }
            );

            const result =
                response.data?.data;

            toast.success(
                `${result?.importedCount || 0} student(s) imported successfully.`
            );

            setShowUploadModal(false);

            setSelectedFile(null);
            setPreviewData(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            await loadStudents();

        } catch (error) {
            console.error(
                "Excel import error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to import students."
            );
        } finally {
            setImporting(false);
        }
    };

    // =====================================================
    // CLOSE UPLOAD MODAL
    // =====================================================

    const closeUploadModal = () => {
        if (
            previewLoading ||
            importing
        ) {
            return;
        }

        setShowUploadModal(false);

        setSelectedFile(null);
        setPreviewData(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // =====================================================
    // CLOSE STUDENT MODAL
    // =====================================================

    const closeStudentModal = () => {
        if (saving) {
            return;
        }

        setShowStudentModal(false);

        resetForm();
    };

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="container-fluid py-4">

                <div className="text-center py-5">

                    <div
                        className="spinner-border text-primary"
                        role="status"
                    >
                        <span className="visually-hidden">
                            Loading...
                        </span>
                    </div>

                    <p className="mt-3 text-muted">
                        Loading students...
                    </p>

                </div>

            </div>
        );
    }

    // =====================================================
    // UI
    // =====================================================

    return (
        <div className="container-fluid py-4">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h3 className="fw-bold mb-1">
                        Student Management
                    </h3>

                    <p className="text-muted mb-0">
                        Manage student records and academic information.
                    </p>

                </div>

                <div className="d-flex gap-2">

                    <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        {refreshing
                            ? "Refreshing..."
                            : "Refresh"}
                    </button>

                    <button
                        type="button"
                        className="btn btn-outline-success"
                        onClick={handleUploadExcel}
                    >
                        <i className="bi bi-file-earmark-spreadsheet me-2"></i>

                        Upload Excel

                    </button>

                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleAddStudent}
                    >
                        <i className="bi bi-plus-lg me-2"></i>

                        Add Student

                    </button>

                </div>

            </div>

            {/* =================================================
                TOTAL STUDENTS
            ================================================= */}

            <div className="row mb-4">

                <div className="col-md-4">

                    <div className="card border-0 shadow-sm">

                        <div className="card-body text-center">

                            <p className="text-muted mb-1">
                                Total Students
                            </p>

                            <h2 className="fw-bold mb-0">
                                {students.length}
                            </h2>

                        </div>

                    </div>

                </div>

            </div>

            {/* =================================================
                STUDENT TABLE
            ================================================= */}

            <div className="card border-0 shadow-sm">

                <div className="card-body p-0">

                    {students.length === 0 ? (

                        <div className="text-center py-5">

                            <h5>
                                No students found.
                            </h5>

                            <p className="text-muted">
                                Add a student or upload an Excel file.
                            </p>

                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleAddStudent}
                            >
                                Add Student
                            </button>

                        </div>

                    ) : (

                        <div className="table-responsive">

                            <table className="table table-hover align-middle mb-0">

                                <thead className="table-light">

                                    <tr>

                                        <th className="px-4">
                                            USN
                                        </th>

                                        <th>
                                            Name
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

                                        <th className="text-end px-4">
                                            Actions
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {students.map(
                                        (student) => {

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

                                                    {/* USN */}

                                                    <td className="px-4">

                                                        <strong>
                                                            {
                                                                student.usn
                                                            }
                                                        </strong>

                                                    </td>

                                                    {/* NAME */}

                                                    <td>

                                                        {
                                                            student.firstName
                                                        }{" "}

                                                        {
                                                            student.lastName
                                                        }

                                                    </td>

                                                    {/* EMAIL */}

                                                    <td>

                                                        {
                                                            student.email ||
                                                            "-"
                                                        }

                                                    </td>

                                                    {/* PHONE */}

                                                    <td>

                                                        {
                                                            student.phone ||
                                                            "-"
                                                        }

                                                    </td>

                                                    {/* DEPARTMENT */}

                                                    <td>

                                                        {departmentName !==
                                                        "Not Assigned" ? (

                                                            <div>

                                                                <strong>
                                                                    {
                                                                        departmentCode
                                                                    }
                                                                </strong>

                                                                <div className="small text-muted">
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

                                                    {/* SEMESTER */}

                                                    <td>

                                                        {semesterName !==
                                                        "Not Assigned" ? (

                                                            <span>
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

                                                    {/* ACTIONS */}

                                                    <td className="text-end px-4">

                                                        <div className="d-flex justify-content-end gap-2">

                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-primary"
                                                                onClick={() =>
                                                                    handleEditStudent(
                                                                        student
                                                                    )
                                                                }
                                                            >
                                                                Edit
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() =>
                                                                    handleDeleteStudent(
                                                                        student
                                                                    )
                                                                }
                                                                disabled={
                                                                    deletingId ===
                                                                    student.id
                                                                }
                                                            >
                                                                {deletingId ===
                                                                student.id
                                                                    ? "Deleting..."
                                                                    : "Delete"}
                                                            </button>

                                                        </div>

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

            {/* =================================================
                ADD / EDIT STUDENT MODAL
            ================================================= */}

            {showStudentModal && (

                <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    style={{
                        backgroundColor:
                            "rgba(0,0,0,0.5)",
                    }}
                >

                    <div className="modal-dialog modal-lg modal-dialog-centered">

                        <div className="modal-content">

                            <form
                                onSubmit={
                                    handleSaveStudent
                                }
                            >

                                {/* HEADER */}

                                <div className="modal-header">

                                    <h5 className="modal-title fw-bold">

                                        {editingStudent
                                            ? "Edit Student"
                                            : "Add Student"}

                                    </h5>

                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={
                                            closeStudentModal
                                        }
                                        disabled={
                                            saving
                                        }
                                    ></button>

                                </div>

                                {/* BODY */}

                                <div className="modal-body">

                                    <div className="row g-3">

                                        {/* ================= USN ================= */}

                                        <div className="col-md-6">

                                            <label className="form-label">

                                                USN

                                                <span className="text-danger">
                                                    {" "}*
                                                </span>

                                            </label>

                                            <input
                                                type="text"
                                                name="usn"
                                                className="form-control"
                                                value={
                                                    formData.usn
                                                }
                                                onChange={
                                                    handleInputChange
                                                }
                                                placeholder="Enter USN"
                                                required
                                            />

                                        </div>

                                        {/* ================= FIRST NAME ================= */}

                                        <div className="col-md-6">

                                            <label className="form-label">

                                                First Name

                                                <span className="text-danger">
                                                    {" "}*
                                                </span>

                                            </label>

                                            <input
                                                type="text"
                                                name="firstName"
                                                className="form-control"
                                                value={
                                                    formData.firstName
                                                }
                                                onChange={
                                                    handleInputChange
                                                }
                                                placeholder="Enter first name"
                                                required
                                            />

                                        </div>

                                        {/* ================= LAST NAME ================= */}

                                        <div className="col-md-6">

                                            <label className="form-label">

                                                Last Name

                                                <span className="text-danger">
                                                    {" "}*
                                                </span>

                                            </label>

                                            <input
                                                type="text"
                                                name="lastName"
                                                className="form-control"
                                                value={
                                                    formData.lastName
                                                }
                                                onChange={
                                                    handleInputChange
                                                }
                                                placeholder="Enter last name"
                                                required
                                            />

                                        </div>

                                        {/* ================= EMAIL ================= */}

                                        <div className="col-md-6">

                                            <label className="form-label">

                                                Email

                                                <span className="text-danger">
                                                    {" "}*
                                                </span>

                                            </label>

                                            <input
                                                type="email"
                                                name="email"
                                                className="form-control"
                                                value={
                                                    formData.email
                                                }
                                                onChange={
                                                    handleInputChange
                                                }
                                                placeholder="Enter email"
                                                required
                                            />

                                        </div>

                                        {/* ================= PHONE ================= */}

                                        <div className="col-md-6">

                                            <label className="form-label">
                                                Phone
                                            </label>

                                            <input
                                                type="tel"
                                                name="phone"
                                                className="form-control"
                                                value={
                                                    formData.phone
                                                }
                                                onChange={
                                                    handleInputChange
                                                }
                                                placeholder="Enter phone number"
                                            />

                                        </div>

                                        {/* ================= DEPARTMENT ================= */}

                                        <div className="col-md-6">

                                            <label className="form-label">

                                                Department

                                                <span className="text-danger">
                                                    {" "}*
                                                </span>

                                            </label>

                                            <select
                                                name="departmentId"
                                                className="form-select"
                                                value={
                                                    formData.departmentId
                                                }
                                                onChange={
                                                    handleInputChange
                                                }
                                                required
                                                disabled={
                                                    departmentsLoading
                                                }
                                            >

                                                <option value="">

                                                    {departmentsLoading
                                                        ? "Loading departments..."
                                                        : "Select Department"}

                                                </option>

                                                {departments.map(
                                                    (
                                                        department
                                                    ) => (

                                                        <option
                                                            key={
                                                                department.id
                                                            }
                                                            value={
                                                                department.id
                                                            }
                                                        >

                                                            {
                                                                department.code
                                                            }

                                                            {" - "}

                                                            {
                                                                department.name
                                                            }

                                                        </option>

                                                    )
                                                )}

                                            </select>

                                        </div>

                                        {/* ================= SEMESTER ================= */}

                                        <div className="col-md-6">

                                            <label className="form-label">

                                                Semester

                                                <span className="text-danger">
                                                    {" "}*
                                                </span>

                                            </label>

                                            <select
                                                name="semesterId"
                                                className="form-select"
                                                value={
                                                    formData.semesterId
                                                }
                                                onChange={
                                                    handleInputChange
                                                }
                                                required
                                                disabled={
                                                    semestersLoading
                                                }
                                            >

                                                <option value="">

                                                    {semestersLoading
                                                        ? "Loading semesters..."
                                                        : "Select Semester"}

                                                </option>

                                                {semesters.map(
                                                    (
                                                        semester
                                                    ) => (

                                                        <option
                                                            key={
                                                                semester.id
                                                            }
                                                            value={
                                                                semester.id
                                                            }
                                                        >

                                                            {
                                                                getSemesterOptionLabel(
                                                                    semester
                                                                )
                                                            }

                                                        </option>

                                                    )
                                                )}

                                            </select>

                                        </div>

                                    </div>

                                </div>

                                {/* FOOTER */}

                                <div className="modal-footer">

                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={
                                            closeStudentModal
                                        }
                                        disabled={
                                            saving
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={
                                            saving ||
                                            departmentsLoading ||
                                            semestersLoading
                                        }
                                    >

                                        {saving
                                            ? editingStudent
                                                ? "Updating..."
                                                : "Saving..."
                                            : editingStudent
                                                ? "Update Student"
                                                : "Add Student"}

                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                </div>

            )}

            {/* =================================================
                EXCEL UPLOAD MODAL
            ================================================= */}

            {showUploadModal && (

                <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    style={{
                        backgroundColor:
                            "rgba(0,0,0,0.5)",
                    }}
                >

                    <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">

                        <div className="modal-content">

                            {/* HEADER */}

                            <div className="modal-header">

                                <h5 className="modal-title fw-bold">
                                    Upload Students from Excel
                                </h5>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={
                                        closeUploadModal
                                    }
                                    disabled={
                                        previewLoading ||
                                        importing
                                    }
                                ></button>

                            </div>

                            {/* BODY */}

                            <div className="modal-body">

                                {/* FILE */}

                                <div className="border rounded p-4 mb-4">

                                    <label className="form-label fw-semibold">

                                        Select Excel File

                                    </label>

                                    <input
                                        ref={
                                            fileInputRef
                                        }
                                        type="file"
                                        className="form-control"
                                        accept=".xlsx,.xls"
                                        onChange={
                                            handleFileChange
                                        }
                                        disabled={
                                            previewLoading ||
                                            importing
                                        }
                                    />

                                    <div className="form-text">

                                        Required columns:
                                        USN, First Name,
                                        Last Name, Email.
                                        Phone, Department
                                        and Semester can
                                        also be provided.

                                    </div>

                                    {selectedFile && (

                                        <div className="mt-3">

                                            <span className="badge bg-success">

                                                {
                                                    selectedFile.name
                                                }

                                            </span>

                                        </div>

                                    )}

                                    <div className="mt-3">

                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={
                                                handlePreviewExcel
                                            }
                                            disabled={
                                                !selectedFile ||
                                                previewLoading ||
                                                importing
                                            }
                                        >

                                            {previewLoading
                                                ? "Validating..."
                                                : "Preview Excel"}

                                        </button>

                                    </div>

                                </div>

                                {/* PREVIEW */}

                                {previewData && (

                                    <>

                                        {/* COUNTS */}

                                        <div className="row g-3 mb-4">

                                            <div className="col-md-3">

                                                <div className="card border-0 bg-light">

                                                    <div className="card-body">

                                                        <small className="text-muted">
                                                            Total Rows
                                                        </small>

                                                        <h4 className="fw-bold mb-0">

                                                            {
                                                                previewData.totalRows
                                                            }

                                                        </h4>

                                                    </div>

                                                </div>

                                            </div>

                                            <div className="col-md-3">

                                                <div className="card border-0 bg-success-subtle">

                                                    <div className="card-body">

                                                        <small className="text-success">
                                                            Valid
                                                        </small>

                                                        <h4 className="fw-bold mb-0 text-success">

                                                            {
                                                                previewData.validCount
                                                            }

                                                        </h4>

                                                    </div>

                                                </div>

                                            </div>

                                            <div className="col-md-3">

                                                <div className="card border-0 bg-warning-subtle">

                                                    <div className="card-body">

                                                        <small className="text-warning-emphasis">
                                                            Invalid
                                                        </small>

                                                        <h4 className="fw-bold mb-0">

                                                            {
                                                                previewData.invalidCount
                                                            }

                                                        </h4>

                                                    </div>

                                                </div>

                                            </div>

                                            <div className="col-md-3">

                                                <div className="card border-0 bg-danger-subtle">

                                                    <div className="card-body">

                                                        <small className="text-danger">
                                                            Duplicate
                                                        </small>

                                                        <h4 className="fw-bold mb-0 text-danger">

                                                            {
                                                                previewData.duplicateCount
                                                            }

                                                        </h4>

                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                        {/* VALID STUDENTS */}

                                        {previewData.validStudents?.length >
                                            0 && (

                                            <div className="mb-4">

                                                <h6 className="fw-bold">
                                                    Valid Students
                                                </h6>

                                                <div className="table-responsive border rounded">

                                                    <table className="table table-sm table-hover mb-0">

                                                        <thead className="table-light">

                                                            <tr>

                                                                <th>
                                                                    Row
                                                                </th>

                                                                <th>
                                                                    USN
                                                                </th>

                                                                <th>
                                                                    Name
                                                                </th>

                                                                <th>
                                                                    Email
                                                                </th>

                                                                <th>
                                                                    Phone
                                                                </th>

                                                            </tr>

                                                        </thead>

                                                        <tbody>

                                                            {previewData.validStudents.map(
                                                                (
                                                                    student
                                                                ) => (

                                                                    <tr
                                                                        key={`${student.rowNumber}-${student.usn}`}
                                                                    >

                                                                        <td>
                                                                            {
                                                                                student.rowNumber
                                                                            }
                                                                        </td>

                                                                        <td>
                                                                            {
                                                                                student.usn
                                                                            }
                                                                        </td>

                                                                        <td>

                                                                            {
                                                                                student.firstName
                                                                            }{" "}

                                                                            {
                                                                                student.lastName
                                                                            }

                                                                        </td>

                                                                        <td>
                                                                            {
                                                                                student.email
                                                                            }
                                                                        </td>

                                                                        <td>

                                                                            {
                                                                                student.phone ||
                                                                                "-"
                                                                            }

                                                                        </td>

                                                                    </tr>

                                                                )
                                                            )}

                                                        </tbody>

                                                    </table>

                                                </div>

                                            </div>

                                        )}

                                        {/* INVALID */}

                                        {previewData.invalidRows?.length >
                                            0 && (

                                            <div className="mb-4">

                                                <h6 className="fw-bold text-warning">
                                                    Invalid Rows
                                                </h6>

                                                <div className="table-responsive border rounded">

                                                    <table className="table table-sm mb-0">

                                                        <thead className="table-warning">

                                                            <tr>

                                                                <th>
                                                                    Row
                                                                </th>

                                                                <th>
                                                                    USN
                                                                </th>

                                                                <th>
                                                                    Errors
                                                                </th>

                                                            </tr>

                                                        </thead>

                                                        <tbody>

                                                            {previewData.invalidRows.map(
                                                                (
                                                                    row
                                                                ) => (

                                                                    <tr
                                                                        key={`invalid-${row.row}`}
                                                                    >

                                                                        <td>
                                                                            {
                                                                                row.row
                                                                            }
                                                                        </td>

                                                                        <td>
                                                                            {
                                                                                row.usn ||
                                                                                "-"
                                                                            }
                                                                        </td>

                                                                        <td>

                                                                            {
                                                                                row.errors?.join(
                                                                                    ", "
                                                                                )
                                                                            }

                                                                        </td>

                                                                    </tr>

                                                                )
                                                            )}

                                                        </tbody>

                                                    </table>

                                                </div>

                                            </div>

                                        )}

                                        {/* DUPLICATES */}

                                        {previewData.duplicateRows?.length >
                                            0 && (

                                            <div className="mb-4">

                                                <h6 className="fw-bold text-danger">
                                                    Duplicate Rows
                                                </h6>

                                                <div className="table-responsive border rounded">

                                                    <table className="table table-sm mb-0">

                                                        <thead className="table-danger">

                                                            <tr>

                                                                <th>
                                                                    Row
                                                                </th>

                                                                <th>
                                                                    USN
                                                                </th>

                                                                <th>
                                                                    Email
                                                                </th>

                                                                <th>
                                                                    Errors
                                                                </th>

                                                            </tr>

                                                        </thead>

                                                        <tbody>

                                                            {previewData.duplicateRows.map(
                                                                (
                                                                    row
                                                                ) => (

                                                                    <tr
                                                                        key={`duplicate-${row.rowNumber}-${row.usn}`}
                                                                    >

                                                                        <td>
                                                                            {
                                                                                row.rowNumber
                                                                            }
                                                                        </td>

                                                                        <td>
                                                                            {
                                                                                row.usn
                                                                            }
                                                                        </td>

                                                                        <td>
                                                                            {
                                                                                row.email
                                                                            }
                                                                        </td>

                                                                        <td>

                                                                            {
                                                                                row.errors?.join(
                                                                                    ", "
                                                                                )
                                                                            }

                                                                        </td>

                                                                    </tr>

                                                                )
                                                            )}

                                                        </tbody>

                                                    </table>

                                                </div>

                                            </div>

                                        )}

                                    </>

                                )}

                            </div>

                            {/* FOOTER */}

                            <div className="modal-footer">

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={
                                        closeUploadModal
                                    }
                                    disabled={
                                        previewLoading ||
                                        importing
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={
                                        handleImportExcel
                                    }
                                    disabled={
                                        !previewData ||
                                        previewData.validCount ===
                                            0 ||
                                        importing ||
                                        previewLoading
                                    }
                                >

                                    {importing
                                        ? "Importing..."
                                        : "Import Students"}

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Students;