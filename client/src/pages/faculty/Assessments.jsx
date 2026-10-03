import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const INITIAL_FORM = {
    courseOfferingId: "",
    name: "",
    type: "CIE",
    maxMarks: "",
    weightage: "",
    assessmentDate: "",
    status: true,
};

function getPayload(response) {
    return response?.data?.data ?? response?.data ?? [];
}

function getErrorMessage(error) {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.response?.data?.data?.message ||
        "Something went wrong."
    );
}

function formatDate(dateValue) {
    if (!dateValue) return "-";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export default function Assessments() {
    const navigate = useNavigate();

    const [courseOfferings, setCourseOfferings] = useState([]);
    const [assessments, setAssessments] = useState([]);

    const [selectedCourseOfferingId, setSelectedCourseOfferingId] =
        useState("");

    const [form, setForm] = useState(INITIAL_FORM);

    const [editingAssessmentId, setEditingAssessmentId] =
        useState(null);

    const [viewingAssessment, setViewingAssessment] =
        useState(null);

    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingAssessments, setLoadingAssessments] = useState(false);
    const [loadingView, setLoadingView] = useState(false);

    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ============================================================
    // LOAD FACULTY COURSE OFFERINGS
    // ============================================================

    const loadCourseOfferings = async () => {
        try {
            setLoadingCourses(true);
            setError("");

            const response = await api.get(
                "/course-offerings/my-courses"
            );

            const payload = getPayload(response);

            let courses = [];

            if (Array.isArray(payload)) {
                courses = payload;
            } else if (
                Array.isArray(payload?.courseOfferings)
            ) {
                courses = payload.courseOfferings;
            } else if (Array.isArray(payload?.data)) {
                courses = payload.data;
            }

            setCourseOfferings(courses);

            if (
                courses.length > 0 &&
                !selectedCourseOfferingId
            ) {
                setSelectedCourseOfferingId(
                    courses[0].id
                );
            }
        } catch (err) {
            console.error(
                "Load course offerings error:",
                err
            );

            setError(getErrorMessage(err));
            setCourseOfferings([]);
        } finally {
            setLoadingCourses(false);
        }
    };

    // ============================================================
    // LOAD ASSESSMENTS
    // ============================================================

    const loadAssessments = async (courseOfferingId) => {
        if (!courseOfferingId) {
            setAssessments([]);
            return;
        }

        try {
            setLoadingAssessments(true);
            setError("");

            const response = await api.get(
                `/assessments/course-offering/${courseOfferingId}`
            );

            const payload = getPayload(response);

            let rows = [];

            if (Array.isArray(payload)) {
                rows = payload;
            } else if (
                Array.isArray(payload?.assessments)
            ) {
                rows = payload.assessments;
            } else if (Array.isArray(payload?.data)) {
                rows = payload.data;
            }

            setAssessments(rows);
        } catch (err) {
            console.error(
                "Load assessments error:",
                err
            );

            setError(getErrorMessage(err));
            setAssessments([]);
        } finally {
            setLoadingAssessments(false);
        }
    };

    useEffect(() => {
        loadCourseOfferings();
    }, []);

    useEffect(() => {
        if (selectedCourseOfferingId) {
            loadAssessments(
                selectedCourseOfferingId
            );
        }
    }, [selectedCourseOfferingId]);

    // ============================================================
    // SELECTED COURSE
    // ============================================================

    const selectedCourseOffering = useMemo(() => {
        return courseOfferings.find(
            (item) =>
                item.id === selectedCourseOfferingId
        );
    }, [
        courseOfferings,
        selectedCourseOfferingId,
    ]);

    // ============================================================
    // FORM CHANGE
    // ============================================================

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // ============================================================
    // RESET FORM
    // ============================================================

    const resetForm = ({
        clearMessages = false,
    } = {}) => {
        setForm({
            ...INITIAL_FORM,
            courseOfferingId:
                selectedCourseOfferingId || "",
        });

        setEditingAssessmentId(null);

        if (clearMessages) {
            setError("");
            setSuccess("");
        }
    };

    // ============================================================
    // CREATE NEW
    // ============================================================

    const handleCreateNew = () => {
        resetForm({
            clearMessages: true,
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // ============================================================
    // EDIT
    // ============================================================

    const handleEdit = async (assessment) => {
        try {
            setError("");
            setSuccess("");

            setEditingAssessmentId(
                assessment.id
            );

            setForm({
                courseOfferingId:
                    assessment.courseOfferingId ||
                    selectedCourseOfferingId ||
                    "",

                name:
                    assessment.name || "",

                type:
                    assessment.type || "CIE",

                maxMarks:
                    assessment.maxMarks ??
                    "",

                weightage:
                    assessment.weightage ??
                    "",

                assessmentDate:
                    assessment.assessmentDate
                        ? String(
                              assessment.assessmentDate
                          ).slice(0, 10)
                        : "",

                status:
                    assessment.status ===
                    undefined
                        ? true
                        : Boolean(
                              assessment.status
                          ),
            });

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        } catch (err) {
            console.error(
                "Edit assessment error:",
                err
            );

            setError(
                getErrorMessage(err)
            );
        }
    };

    // ============================================================
    // VIEW
    // ============================================================

    const handleView = async (assessment) => {
        try {
            setLoadingView(true);
            setError("");

            /*
             * First use the assessment already
             * loaded in the list.
             *
             * This avoids depending on a separate
             * GET /assessments/:id endpoint.
             */
            setViewingAssessment(assessment);
        } catch (err) {
            console.error(
                "View assessment error:",
                err
            );

            setError(
                getErrorMessage(err)
            );
        } finally {
            setLoadingView(false);
        }
    };

    // ============================================================
    // SAVE
    // ============================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        const courseOfferingId =
            form.courseOfferingId ||
            selectedCourseOfferingId;

        if (!courseOfferingId) {
            setError(
                "Please select a course offering."
            );
            return;
        }

        if (!form.name.trim()) {
            setError(
                "Assessment name is required."
            );
            return;
        }

        if (!form.type) {
            setError(
                "Assessment type is required."
            );
            return;
        }

        if (
            form.maxMarks === "" ||
            Number(form.maxMarks) <= 0
        ) {
            setError(
                "Max marks must be greater than 0."
            );
            return;
        }

        if (
            form.weightage !== "" &&
            Number(form.weightage) < 0
        ) {
            setError(
                "Weightage cannot be negative."
            );
            return;
        }

        const payload = {
            courseOfferingId,

            name: form.name.trim(),

            type: form.type,

            maxMarks: Number(
                form.maxMarks
            ),

            weightage:
                form.weightage === ""
                    ? null
                    : Number(
                          form.weightage
                      ),

            assessmentDate:
                form.assessmentDate || null,

            status: Boolean(
                form.status
            ),
        };

        try {
            setSaving(true);

            if (editingAssessmentId) {
                await api.put(
                    `/assessments/${editingAssessmentId}`,
                    payload
                );

                setSuccess(
                    "Assessment updated successfully."
                );
            } else {
                await api.post(
                    "/assessments",
                    payload
                );

                setSuccess(
                    "Assessment created successfully."
                );
            }

            await loadAssessments(
                courseOfferingId
            );

            setSelectedCourseOfferingId(
                courseOfferingId
            );

            /*
             * Reset only the form.
             * Do NOT clear success message.
             */
            setForm({
                ...INITIAL_FORM,
                courseOfferingId:
                    courseOfferingId,
            });

            setEditingAssessmentId(null);

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        } catch (err) {
            console.error(
                "Save assessment error:",
                err
            );

            setError(
                getErrorMessage(err)
            );
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // DELETE
    // ============================================================

    const handleDelete = async (assessmentId) => {
        const confirmed =
            window.confirm(
                "Are you sure you want to delete this assessment?"
            );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(assessmentId);
            setError("");
            setSuccess("");

            await api.delete(
                `/assessments/${assessmentId}`
            );

            setSuccess(
                "Assessment deleted successfully."
            );

            await loadAssessments(
                selectedCourseOfferingId
            );
        } catch (err) {
            console.error(
                "Delete assessment error:",
                err
            );

            setError(
                getErrorMessage(err)
            );
        } finally {
            setDeletingId(null);
        }
    };

    // ============================================================
    // MAP QUESTIONS
    // ============================================================

    const handleMapQuestions = (
        assessmentId
    ) => {
        navigate(
            `/faculty/question-mapping/${assessmentId}`
        );
    };

    // ============================================================
    // MARKS ENTRY
    // ============================================================

    const handleMarksEntry = (
        assessmentId
    ) => {
        navigate(
            `/faculty/marks?assessmentId=${assessmentId}`
        );
    };

    return (
        <div
            style={{
                padding: "24px",
                maxWidth: "1400px",
                margin: "0 auto",
            }}
        >
            {/* ========================================================
                HEADER
            ======================================================== */}

            <div
                style={{
                    display: "flex",
                    justifyContent:
                        "space-between",
                    alignItems: "center",
                    gap: "16px",
                    marginBottom: "24px",
                    flexWrap: "wrap",
                }}
            >
                <div>
                    <h1
                        style={{
                            margin: 0,
                            fontSize: "28px",
                            fontWeight: 700,
                        }}
                    >
                        Assessments
                    </h1>

                    <p
                        style={{
                            marginTop: "6px",
                            marginBottom: 0,
                            color: "#666",
                        }}
                    >
                        Create and manage
                        assessments for your
                        course offerings.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={
                        handleCreateNew
                    }
                    style={
                        styles.primaryButton
                    }
                >
                    + Create Assessment
                </button>
            </div>

            {/* ========================================================
                ALERTS
            ======================================================== */}

            {error && (
                <div
                    style={
                        styles.errorAlert
                    }
                >
                    {error}
                </div>
            )}

            {success && (
                <div
                    style={
                        styles.successAlert
                    }
                >
                    {success}
                </div>
            )}

            {/* ========================================================
                COURSE OFFERING
            ======================================================== */}

            <div
                style={styles.card}
            >
                <div
                    style={
                        styles.sectionTitle
                    }
                >
                    Select Course Offering
                </div>

                {loadingCourses ? (
                    <p>
                        Loading your
                        courses...
                    </p>
                ) : courseOfferings.length ===
                  0 ? (
                    <div
                        style={
                            styles.emptyBox
                        }
                    >
                        No course offerings
                        are assigned to you.
                    </div>
                ) : (
                    <select
                        value={
                            selectedCourseOfferingId
                        }
                        onChange={(event) => {
                            const value =
                                event.target
                                    .value;

                            setSelectedCourseOfferingId(
                                value
                            );

                            setForm(
                                (previous) => ({
                                    ...previous,
                                    courseOfferingId:
                                        value,
                                })
                            );

                            setEditingAssessmentId(
                                null
                            );

                            setViewingAssessment(
                                null
                            );
                        }}
                        style={
                            styles.input
                        }
                    >
                        <option value="">
                            Select course
                            offering
                        </option>

                        {courseOfferings.map(
                            (offering) => (
                                <option
                                    key={
                                        offering.id
                                    }
                                    value={
                                        offering.id
                                    }
                                >
                                    {offering.course
                                        ?.code ||
                                        offering.courseCode ||
                                        offering.code ||
                                        "Course"}{" "}
                                    -{" "}
                                    {offering.course
                                        ?.name ||
                                        offering.courseName ||
                                        offering.name ||
                                        "Course Offering"}{" "}
                                    {offering.section
                                        ? `- Section ${offering.section}`
                                        : ""}
                                </option>
                            )
                        )}
                    </select>
                )}
            </div>

            {/* ========================================================
                SELECTED COURSE INFO
            ======================================================== */}

            {selectedCourseOffering && (
                <div
                    style={
                        styles.infoCard
                    }
                >
                    <div>
                        <span
                            style={
                                styles.infoLabel
                            }
                        >
                            Course
                        </span>

                        <strong>
                            {selectedCourseOffering
                                .course
                                ?.code ||
                                selectedCourseOffering.courseCode ||
                                selectedCourseOffering.code ||
                                "-"}
                        </strong>
                    </div>

                    <div>
                        <span
                            style={
                                styles.infoLabel
                            }
                        >
                            Name
                        </span>

                        <strong>
                            {selectedCourseOffering
                                .course
                                ?.name ||
                                selectedCourseOffering.courseName ||
                                selectedCourseOffering.name ||
                                "-"}
                        </strong>
                    </div>

                    <div>
                        <span
                            style={
                                styles.infoLabel
                            }
                        >
                            Section
                        </span>

                        <strong>
                            {selectedCourseOffering.section ||
                                "-"}
                        </strong>
                    </div>
                </div>
            )}

            {/* ========================================================
                CREATE / EDIT FORM
            ======================================================== */}

            <div
                style={styles.card}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent:
                            "space-between",
                        alignItems: "center",
                        marginBottom: "18px",
                        gap: "10px",
                    }}
                >
                    <div
                        style={
                            styles.sectionTitle
                        }
                    >
                        {editingAssessmentId
                            ? "Edit Assessment"
                            : "Create Assessment"}
                    </div>

                    {editingAssessmentId && (
                        <button
                            type="button"
                            onClick={() =>
                                resetForm({
                                    clearMessages:
                                        true,
                                })
                            }
                            style={
                                styles.secondaryButton
                            }
                        >
                            Cancel Edit
                        </button>
                    )}
                </div>

                <form
                    onSubmit={
                        handleSubmit
                    }
                >
                    <div
                        style={
                            styles.formGrid
                        }
                    >
                        {/* NAME */}

                        <div
                            style={
                                styles.field
                            }
                        >
                            <label
                                style={
                                    styles.label
                                }
                            >
                                Assessment Name *
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={
                                    form.name
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Example: IA1"
                                style={
                                    styles.input
                                }
                            />
                        </div>

                        {/* TYPE */}

                        <div
                            style={
                                styles.field
                            }
                        >
                            <label
                                style={
                                    styles.label
                                }
                            >
                                Assessment Type *
                            </label>

                            <select
                                name="type"
                                value={
                                    form.type
                                }
                                onChange={
                                    handleChange
                                }
                                style={
                                    styles.input
                                }
                            >
                                <option value="CIE">
                                    CIE
                                </option>

                                <option value="SEE">
                                    SEE
                                </option>

                                <option value="ASSIGNMENT">
                                    ASSIGNMENT
                                </option>

                                <option value="QUIZ">
                                    QUIZ
                                </option>

                                <option value="LAB">
                                    LAB
                                </option>

                                <option value="PROJECT">
                                    PROJECT
                                </option>
                            </select>
                        </div>

                        {/* MAX MARKS */}

                        <div
                            style={
                                styles.field
                            }
                        >
                            <label
                                style={
                                    styles.label
                                }
                            >
                                Maximum Marks *
                            </label>

                            <input
                                type="number"
                                name="maxMarks"
                                value={
                                    form.maxMarks
                                }
                                onChange={
                                    handleChange
                                }
                                min="1"
                                step="0.01"
                                placeholder="50"
                                style={
                                    styles.input
                                }
                            />
                        </div>

                        {/* WEIGHTAGE */}

                        <div
                            style={
                                styles.field
                            }
                        >
                            <label
                                style={
                                    styles.label
                                }
                            >
                                Weightage
                            </label>

                            <input
                                type="number"
                                name="weightage"
                                value={
                                    form.weightage
                                }
                                onChange={
                                    handleChange
                                }
                                min="0"
                                step="0.01"
                                placeholder="20"
                                style={
                                    styles.input
                                }
                            />
                        </div>

                        {/* DATE */}

                        <div
                            style={
                                styles.field
                            }
                        >
                            <label
                                style={
                                    styles.label
                                }
                            >
                                Assessment Date
                            </label>

                            <input
                                type="date"
                                name="assessmentDate"
                                value={
                                    form.assessmentDate
                                }
                                onChange={
                                    handleChange
                                }
                                style={
                                    styles.input
                                }
                            />
                        </div>

                        {/* STATUS */}

                        <div
                            style={
                                styles.field
                            }
                        >
                            <label
                                style={
                                    styles.label
                                }
                            >
                                Status
                            </label>

                            <select
                                name="status"
                                value={
                                    form.status
                                        ? "true"
                                        : "false"
                                }
                                onChange={(
                                    event
                                ) => {
                                    setForm(
                                        (
                                            previous
                                        ) => ({
                                            ...previous,
                                            status:
                                                event
                                                    .target
                                                    .value ===
                                                "true",
                                        })
                                    );
                                }}
                                style={
                                    styles.input
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

                    <div
                        style={{
                            marginTop:
                                "20px",
                            display:
                                "flex",
                            gap: "10px",
                        }}
                    >
                        <button
                            type="submit"
                            disabled={
                                saving
                            }
                            style={{
                                ...styles.primaryButton,
                                opacity:
                                    saving
                                        ? 0.7
                                        : 1,
                            }}
                        >
                            {saving
                                ? "Saving..."
                                : editingAssessmentId
                                ? "Update Assessment"
                                : "Create Assessment"}
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                resetForm({
                                    clearMessages:
                                        true,
                                })
                            }
                            style={
                                styles.secondaryButton
                            }
                        >
                            Clear
                        </button>
                    </div>
                </form>
            </div>

            {/* ========================================================
                ASSESSMENT LIST
            ======================================================== */}

            <div
                style={styles.card}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent:
                            "space-between",
                        alignItems: "center",
                        marginBottom:
                            "18px",
                    }}
                >
                    <div
                        style={
                            styles.sectionTitle
                        }
                    >
                        Assessment List
                    </div>

                    <div
                        style={
                            styles.countBadge
                        }
                    >
                        {assessments.length}{" "}
                        Assessment
                        {assessments.length !==
                        1
                            ? "s"
                            : ""}
                    </div>
                </div>

                {loadingAssessments ? (
                    <div
                        style={
                            styles.emptyBox
                        }
                    >
                        Loading assessments...
                    </div>
                ) : assessments.length ===
                  0 ? (
                    <div
                        style={
                            styles.emptyBox
                        }
                    >
                        No assessments found
                        for this course
                        offering.
                    </div>
                ) : (
                    <div
                        style={
                            styles.tableWrapper
                        }
                    >
                        <table
                            style={
                                styles.table
                            }
                        >
                            <thead>
                                <tr>
                                    <th
                                        style={
                                            styles.th
                                        }
                                    >
                                        Sl. No.
                                    </th>

                                    <th
                                        style={
                                            styles.th
                                        }
                                    >
                                        Assessment
                                    </th>

                                    <th
                                        style={
                                            styles.th
                                        }
                                    >
                                        Type
                                    </th>

                                    <th
                                        style={
                                            styles.th
                                        }
                                    >
                                        Max Marks
                                    </th>

                                    <th
                                        style={
                                            styles.th
                                        }
                                    >
                                        Weightage
                                    </th>

                                    <th
                                        style={
                                            styles.th
                                        }
                                    >
                                        Date
                                    </th>

                                    <th
                                        style={
                                            styles.th
                                        }
                                    >
                                        Status
                                    </th>

                                    <th
                                        style={
                                            styles.th
                                        }
                                    >
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {assessments.map(
                                    (
                                        assessment,
                                        index
                                    ) => (
                                        <tr
                                            key={
                                                assessment.id
                                            }
                                        >
                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                {index +
                                                    1}
                                            </td>

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                <strong>
                                                    {
                                                        assessment.name
                                                    }
                                                </strong>
                                            </td>

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                <span
                                                    style={
                                                        styles.typeBadge
                                                    }
                                                >
                                                    {
                                                        assessment.type
                                                    }
                                                </span>
                                            </td>

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                {
                                                    assessment.maxMarks
                                                }
                                            </td>

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                {assessment.weightage ??
                                                    "-"}
                                            </td>

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                {formatDate(
                                                    assessment.assessmentDate
                                                )}
                                            </td>

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                <span
                                                    style={
                                                        assessment.status
                                                            ? styles.activeBadge
                                                            : styles.inactiveBadge
                                                    }
                                                >
                                                    {assessment.status
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </td>

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                <div
                                                    style={{
                                                        display:
                                                            "flex",
                                                        gap: "7px",
                                                        flexWrap:
                                                            "wrap",
                                                    }}
                                                >
                                                    {/* VIEW */}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleView(
                                                                assessment
                                                            )
                                                        }
                                                        style={
                                                            styles.viewButton
                                                        }
                                                    >
                                                        View
                                                    </button>

                                                    {/* EDIT */}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleEdit(
                                                                assessment
                                                            )
                                                        }
                                                        style={
                                                            styles.smallButton
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    {/* MAP QUESTIONS */}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleMapQuestions(
                                                                assessment.id
                                                            )
                                                        }
                                                        style={
                                                            styles.mapButton
                                                        }
                                                    >
                                                        Map Questions
                                                    </button>

                                                    {/* MARKS */}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleMarksEntry(
                                                                assessment.id
                                                            )
                                                        }
                                                        style={
                                                            styles.marksButton
                                                        }
                                                    >
                                                        Marks Entry
                                                    </button>

                                                    {/* DELETE */}

                                                    <button
                                                        type="button"
                                                        disabled={
                                                            deletingId ===
                                                            assessment.id
                                                        }
                                                        onClick={() =>
                                                            handleDelete(
                                                                assessment.id
                                                            )
                                                        }
                                                        style={
                                                            styles.deleteButton
                                                        }
                                                    >
                                                        {deletingId ===
                                                        assessment.id
                                                            ? "Deleting..."
                                                            : "Delete"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ========================================================
                VIEW MODAL
            ======================================================== */}

            {viewingAssessment && (
                <div
                    style={
                        styles.modalOverlay
                    }
                    onClick={() =>
                        setViewingAssessment(
                            null
                        )
                    }
                >
                    <div
                        style={
                            styles.modal
                        }
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div
                            style={
                                styles.modalHeader
                            }
                        >
                            <div>
                                <h3
                                    style={{
                                        margin: 0,
                                    }}
                                >
                                    Assessment Details
                                </h3>

                                <p
                                    style={{
                                        margin:
                                            "5px 0 0",
                                        color:
                                            "#64748b",
                                        fontSize:
                                            "13px",
                                    }}
                                >
                                    View only
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setViewingAssessment(
                                        null
                                    )
                                }
                                style={
                                    styles.closeButton
                                }
                            >
                                ×
                            </button>
                        </div>

                        <div
                            style={
                                styles.detailsGrid
                            }
                        >
                            <div
                                style={
                                    styles.detailItem
                                }
                            >
                                <span
                                    style={
                                        styles.detailLabel
                                    }
                                >
                                    Assessment Name
                                </span>

                                <strong>
                                    {
                                        viewingAssessment.name
                                    }
                                </strong>
                            </div>

                            <div
                                style={
                                    styles.detailItem
                                }
                            >
                                <span
                                    style={
                                        styles.detailLabel
                                    }
                                >
                                    Type
                                </span>

                                <strong>
                                    {
                                        viewingAssessment.type
                                    }
                                </strong>
                            </div>

                            <div
                                style={
                                    styles.detailItem
                                }
                            >
                                <span
                                    style={
                                        styles.detailLabel
                                    }
                                >
                                    Maximum Marks
                                </span>

                                <strong>
                                    {
                                        viewingAssessment.maxMarks
                                    }
                                </strong>
                            </div>

                            <div
                                style={
                                    styles.detailItem
                                }
                            >
                                <span
                                    style={
                                        styles.detailLabel
                                    }
                                >
                                    Weightage
                                </span>

                                <strong>
                                    {viewingAssessment.weightage ??
                                        "-"}
                                </strong>
                            </div>

                            <div
                                style={
                                    styles.detailItem
                                }
                            >
                                <span
                                    style={
                                        styles.detailLabel
                                    }
                                >
                                    Assessment Date
                                </span>

                                <strong>
                                    {formatDate(
                                        viewingAssessment.assessmentDate
                                    )}
                                </strong>
                            </div>

                            <div
                                style={
                                    styles.detailItem
                                }
                            >
                                <span
                                    style={
                                        styles.detailLabel
                                    }
                                >
                                    Status
                                </span>

                                <strong>
                                    {viewingAssessment.status
                                        ? "Active"
                                        : "Inactive"}
                                </strong>
                            </div>
                        </div>

                        <div
                            style={
                                styles.modalFooter
                            }
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    setViewingAssessment(
                                        null
                                    )
                                }
                                style={
                                    styles.secondaryButton
                                }
                            >
                                Close
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setViewingAssessment(
                                        null
                                    );

                                    handleEdit(
                                        viewingAssessment
                                    );
                                }}
                                style={
                                    styles.primaryButton
                                }
                            >
                                Edit Assessment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ================================================================
// STYLES
// ================================================================

const styles = {
    card: {
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "22px",
        marginBottom: "20px",
        boxShadow:
            "0 2px 8px rgba(0, 0, 0, 0.04)",
    },

    infoCard: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "18px",
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "18px 20px",
        marginBottom: "20px",
    },

    infoLabel: {
        display: "block",
        fontSize: "12px",
        color: "#64748b",
        marginBottom: "4px",
    },

    sectionTitle: {
        fontSize: "18px",
        fontWeight: 700,
        color: "#111827",
    },

    formGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "18px",
    },

    field: {
        display: "flex",
        flexDirection: "column",
        gap: "7px",
    },

    label: {
        fontSize: "14px",
        fontWeight: 600,
        color: "#374151",
    },

    input: {
        width: "100%",
        minHeight: "42px",
        padding: "9px 12px",
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        fontSize: "14px",
        outline: "none",
        boxSizing: "border-box",
        background: "#fff",
    },

    primaryButton: {
        border: "none",
        borderRadius: "8px",
        background: "#2563eb",
        color: "#ffffff",
        padding: "10px 16px",
        fontSize: "14px",
        fontWeight: 600,
        cursor: "pointer",
    },

    secondaryButton: {
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        background: "#ffffff",
        color: "#374151",
        padding: "10px 16px",
        fontSize: "14px",
        fontWeight: 600,
        cursor: "pointer",
    },

    viewButton: {
        border: "1px solid #0891b2",
        borderRadius: "6px",
        background: "#ecfeff",
        color: "#0e7490",
        padding: "7px 10px",
        fontSize: "12px",
        fontWeight: 600,
        cursor: "pointer",
    },

    smallButton: {
        border: "1px solid #2563eb",
        borderRadius: "6px",
        background: "#ffffff",
        color: "#2563eb",
        padding: "7px 10px",
        fontSize: "12px",
        fontWeight: 600,
        cursor: "pointer",
    },

    mapButton: {
        border: "none",
        borderRadius: "6px",
        background: "#7c3aed",
        color: "#ffffff",
        padding: "7px 10px",
        fontSize: "12px",
        fontWeight: 600,
        cursor: "pointer",
    },

    marksButton: {
        border: "none",
        borderRadius: "6px",
        background: "#059669",
        color: "#ffffff",
        padding: "7px 10px",
        fontSize: "12px",
        fontWeight: 600,
        cursor: "pointer",
    },

    deleteButton: {
        border: "none",
        borderRadius: "6px",
        background: "#dc2626",
        color: "#ffffff",
        padding: "7px 10px",
        fontSize: "12px",
        fontWeight: 600,
        cursor: "pointer",
    },

    countBadge: {
        background: "#eff6ff",
        color: "#1d4ed8",
        borderRadius: "999px",
        padding: "5px 10px",
        fontSize: "12px",
        fontWeight: 600,
    },

    typeBadge: {
        display: "inline-block",
        background: "#f3f4f6",
        color: "#374151",
        borderRadius: "999px",
        padding: "4px 8px",
        fontSize: "11px",
        fontWeight: 700,
    },

    activeBadge: {
        display: "inline-block",
        background: "#dcfce7",
        color: "#166534",
        borderRadius: "999px",
        padding: "4px 8px",
        fontSize: "11px",
        fontWeight: 700,
    },

    inactiveBadge: {
        display: "inline-block",
        background: "#fee2e2",
        color: "#991b1b",
        borderRadius: "999px",
        padding: "4px 8px",
        fontSize: "11px",
        fontWeight: 700,
    },

    tableWrapper: {
        width: "100%",
        overflowX: "auto",
    },

    table: {
        width: "100%",
        borderCollapse: "collapse",
        minWidth: "1200px",
    },

    th: {
        textAlign: "left",
        padding: "12px",
        background: "#f8fafc",
        borderBottom:
            "1px solid #e5e7eb",
        fontSize: "13px",
        color: "#374151",
    },

    td: {
        padding: "12px",
        borderBottom:
            "1px solid #f1f5f9",
        fontSize: "13px",
        color: "#374151",
        verticalAlign: "middle",
    },

    emptyBox: {
        padding: "30px",
        textAlign: "center",
        background: "#f8fafc",
        borderRadius: "8px",
        color: "#64748b",
        border:
            "1px dashed #cbd5e1",
    },

    errorAlert: {
        background: "#fef2f2",
        color: "#991b1b",
        border:
            "1px solid #fecaca",
        padding: "12px 14px",
        borderRadius: "8px",
        marginBottom: "18px",
        fontSize: "14px",
    },

    successAlert: {
        background: "#f0fdf4",
        color: "#166534",
        border:
            "1px solid #bbf7d0",
        padding: "12px 14px",
        borderRadius: "8px",
        marginBottom: "18px",
        fontSize: "14px",
    },

    modalOverlay: {
        position: "fixed",
        inset: 0,
        background:
            "rgba(15, 23, 42, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        zIndex: 9999,
    },

    modal: {
        width: "100%",
        maxWidth: "700px",
        background: "#ffffff",
        borderRadius: "14px",
        boxShadow:
            "0 20px 60px rgba(0,0,0,0.2)",
        overflow: "hidden",
    },

    modalHeader: {
        display: "flex",
        justifyContent:
            "space-between",
        alignItems: "center",
        padding: "20px 22px",
        borderBottom:
            "1px solid #e5e7eb",
    },

    closeButton: {
        border: "none",
        background: "transparent",
        fontSize: "30px",
        lineHeight: 1,
        color: "#64748b",
        cursor: "pointer",
    },

    detailsGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
        gap: "16px",
        padding: "22px",
    },

    detailItem: {
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        padding: "14px",
        background: "#f8fafc",
        borderRadius: "8px",
        border:
            "1px solid #e2e8f0",
    },

    detailLabel: {
        fontSize: "12px",
        color: "#64748b",
        fontWeight: 600,
    },

    modalFooter: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        padding: "18px 22px",
        borderTop:
            "1px solid #e5e7eb",
    },
};