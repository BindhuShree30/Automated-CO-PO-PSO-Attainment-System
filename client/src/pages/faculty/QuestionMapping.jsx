import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getQuestionsByAssessment,
  previewAssessmentQuestionUpload,
  confirmAssessmentQuestionUpload,
  getCourseOutcomesByCourse,
} from "../../services/assessmentQuestionService";

import {
  getMyCourseOfferings,
} from "../../services/courseOfferingService";

import {
  getAssessmentsByCourseOffering,
} from "../../services/assessmentService";


const QuestionMapping = () => {
  const navigate = useNavigate();

  const {
    assessmentId: routeAssessmentId,
  } = useParams();


  /* ==========================================================
     STATE
  ========================================================== */

  const [courses, setCourses] = useState([]);

  const [selectedCourse, setSelectedCourse] =
    useState("");

  const [assessments, setAssessments] =
    useState([]);

  const [selectedAssessment, setSelectedAssessment] =
    useState(routeAssessmentId || "");

  const [questions, setQuestions] =
    useState([]);

  const [previewData, setPreviewData] =
    useState(null);

  const [courseOutcomes, setCourseOutcomes] =
    useState([]);

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [
    loadingAssessments,
    setLoadingAssessments,
  ] = useState(false);

  const [
    loadingPreview,
    setLoadingPreview,
  ] = useState(false);

  const [
    loadingCOs,
    setLoadingCOs,
  ] = useState(false);

  const [
    locatingAssessment,
    setLocatingAssessment,
  ] = useState(false);

  const [
    confirming,
    setConfirming,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  /* ==========================================================
     NORMALIZE API DATA
  ========================================================== */

  const normalizeArrayResponse = (response) => {
    const payload =
      response?.data?.data ??
      response?.data ??
      response ??
      [];

    if (Array.isArray(payload)) {
      return payload;
    }

    if (Array.isArray(payload?.data)) {
      return payload.data;
    }

    if (Array.isArray(payload?.assessments)) {
      return payload.assessments;
    }

    if (Array.isArray(payload?.courseOfferings)) {
      return payload.courseOfferings;
    }

    if (Array.isArray(payload?.courseOutcomes)) {
      return payload.courseOutcomes;
    }

    if (Array.isArray(payload?.questions)) {
      return payload.questions;
    }

    return [];
  };


  /* ==========================================================
     LOAD FACULTY COURSE OFFERINGS
  ========================================================== */

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getMyCourseOfferings();

        const data =
          normalizeArrayResponse(response);

        setCourses(data);

      } catch (err) {
        console.error(
          "Failed to load courses:",
          err
        );

        setError(
          err?.response?.data?.message ||
          "Failed to load your courses."
        );

        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);


  /* ==========================================================
     AUTO FIND COURSE FOR ROUTE ASSESSMENT

     Example:
     /faculty/question-mapping/:assessmentId

     This is useful when coming from:
     Assessments → Map Questions
  ========================================================== */

  useEffect(() => {
    if (
      !routeAssessmentId ||
      !courses.length
    ) {
      return;
    }

    const locateAssessmentCourse = async () => {
      try {
        setLocatingAssessment(true);
        setError("");

        /* Already selected correctly */
        if (selectedCourse) {
          return;
        }

        for (const courseOffering of courses) {
          try {
            const response =
              await getAssessmentsByCourseOffering(
                courseOffering.id
              );

            const courseAssessments =
              normalizeArrayResponse(response);

            const foundAssessment =
              courseAssessments.find(
                (assessment) =>
                  String(assessment.id) ===
                  String(routeAssessmentId)
              );

            if (foundAssessment) {
              setSelectedCourse(
                courseOffering.id
              );

              setAssessments(
                courseAssessments
              );

              setSelectedAssessment(
                routeAssessmentId
              );

              return;
            }
          } catch (innerError) {
            console.warn(
              "Could not check course offering:",
              courseOffering.id,
              innerError
            );
          }
        }

        setError(
          "The selected assessment could not be associated with one of your course offerings."
        );

      } finally {
        setLocatingAssessment(false);
      }
    };

    locateAssessmentCourse();
  }, [
    routeAssessmentId,
    courses,
    selectedCourse,
  ]);


  /* ==========================================================
     LOAD ASSESSMENTS WHEN COURSE CHANGES
  ========================================================== */

  useEffect(() => {
    const loadAssessments = async () => {
      if (!selectedCourse) {
        setAssessments([]);
        return;
      }

      try {
        setLoadingAssessments(true);
        setError("");

        const response =
          await getAssessmentsByCourseOffering(
            selectedCourse
          );

        const data =
          normalizeArrayResponse(response);

        setAssessments(data);

        /*
         * If assessment ID came from URL,
         * keep it selected when present.
         */
        if (routeAssessmentId) {
          const exists = data.some(
            (assessment) =>
              String(assessment.id) ===
              String(routeAssessmentId)
          );

          if (exists) {
            setSelectedAssessment(
              routeAssessmentId
            );
          }
        }

      } catch (err) {
        console.error(
          "Failed to load assessments:",
          err
        );

        setAssessments([]);

        setError(
          err?.response?.data?.message ||
          "Failed to load assessments."
        );
      } finally {
        setLoadingAssessments(false);
      }
    };

    loadAssessments();
  }, [
    selectedCourse,
    routeAssessmentId,
  ]);


  /* ==========================================================
     LOAD EXISTING QUESTIONS
  ========================================================== */

  useEffect(() => {
    const loadQuestions = async () => {
      if (!selectedAssessment) {
        setQuestions([]);
        return;
      }

      try {
        const response =
          await getQuestionsByAssessment(
            selectedAssessment
          );

        const data =
          normalizeArrayResponse(response);

        setQuestions(data);

      } catch (err) {
        console.error(
          "Failed to load questions:",
          err
        );

        setQuestions([]);
      }
    };

    loadQuestions();
  }, [
    selectedAssessment,
  ]);


  /* ==========================================================
     FIND CURRENT COURSE OFFERING
  ========================================================== */

  const selectedCourseOffering = useMemo(() => {
    return courses.find(
      (courseOffering) =>
        String(courseOffering.id) ===
        String(selectedCourse)
    );
  }, [
    courses,
    selectedCourse,
  ]);


  /* ==========================================================
     COURSE ID
  ========================================================== */

  const courseIdFromOffering =
    selectedCourseOffering?.course?.id ||
    selectedCourseOffering?.courseId ||
    "";


  /* ==========================================================
     LOAD COURSE OUTCOMES
  ========================================================== */

  const loadCourseOutcomes = async (
    courseId
  ) => {
    if (!courseId) {
      setCourseOutcomes([]);
      return;
    }

    try {
      setLoadingCOs(true);
      setError("");

      const response =
        await getCourseOutcomesByCourse(
          courseId
        );

      const data =
        normalizeArrayResponse(response);

      setCourseOutcomes(data);

    } catch (err) {
      console.error(
        "Failed to load course outcomes:",
        err
      );

      setCourseOutcomes([]);

      setError(
        err?.response?.data?.message ||
        "Failed to load Course Outcomes."
      );
    } finally {
      setLoadingCOs(false);
    }
  };


  /* ==========================================================
     LOAD COs WHEN COURSE IS AVAILABLE
  ========================================================== */

  useEffect(() => {
    if (courseIdFromOffering) {
      loadCourseOutcomes(
        courseIdFromOffering
      );
    }
  }, [
    courseIdFromOffering,
  ]);


  /* ==========================================================
     HANDLE COURSE CHANGE
  ========================================================== */

  const handleCourseChange = (event) => {
    const value =
      event.target.value;

    setSelectedCourse(value);

    setSelectedAssessment("");

    setAssessments([]);

    setQuestions([]);

    setPreviewData(null);

    setSelectedFile(null);

    setCourseOutcomes([]);

    setError("");

    setSuccess("");

    navigate(
      "/faculty/question-mapping"
    );
  };


  /* ==========================================================
     HANDLE ASSESSMENT CHANGE
  ========================================================== */

  const handleAssessmentChange = (
    event
  ) => {
    const value =
      event.target.value;

    setSelectedAssessment(value);

    setPreviewData(null);

    setSelectedFile(null);

    setError("");

    setSuccess("");

    if (value) {
      navigate(
        `/faculty/question-mapping/${value}`
      );
    } else {
      navigate(
        "/faculty/question-mapping"
      );
    }
  };


  /* ==========================================================
     HANDLE FILE SELECTION
  ========================================================== */

  const handleFileChange = (event) => {
    const file =
      event.target.files?.[0] ||
      null;

    setSelectedFile(file);

    setError("");

    setSuccess("");
  };


  /* ==========================================================
     MAIN QUESTION NUMBER
  ========================================================== */

  const getMainQuestion = (
    questionNumber
  ) => {
    const value =
      String(
        questionNumber || ""
      ).trim();

    const match =
      value.match(/^Q?(\d+)/i);

    return match
      ? Number(match[1])
      : null;
  };


  /* ==========================================================
     GET OR GROUP

     This is only descriptive information.
     Faculty does NOT select an OR option here.
  ========================================================== */

  const getChoiceGroup = (
    question
  ) => {
    if (
      question?.choiceGroup
    ) {
      return Number(
        question.choiceGroup
      );
    }

    const mainQuestion =
      getMainQuestion(
        question?.questionNumber
      );

    if (
      mainQuestion === 1 ||
      mainQuestion === 2
    ) {
      return 1;
    }

    if (
      mainQuestion === 3 ||
      mainQuestion === 4
    ) {
      return 2;
    }

    if (
      mainQuestion === 5 ||
      mainQuestion === 6
    ) {
      return 3;
    }

    return null;
  };


  /* ==========================================================
     GET OR OPTION
  ========================================================== */

  const getChoiceOption = (
    question
  ) => {
    if (
      question?.choiceOption
    ) {
      return Number(
        question.choiceOption
      );
    }

    return getMainQuestion(
      question?.questionNumber
    );
  };


  /* ==========================================================
     GET GROUP LABEL
  ========================================================== */

  const getChoiceGroupLabel = (
    question
  ) => {
    const group =
      getChoiceGroup(question);

    if (group === 1) {
      return "Part 1 — Q1 OR Q2";
    }

    if (group === 2) {
      return "Part 2 — Q3 OR Q4";
    }

    if (group === 3) {
      return "Part 3 — Q5 OR Q6";
    }

    return "";
  };


  /* ==========================================================
     GROUP QUESTIONS FOR SUMMARY
  ========================================================== */

  const choiceGroups = useMemo(() => {
    const groups = {};

    const sourceQuestions =
      previewData?.questions || [];

    sourceQuestions.forEach(
      (question) => {
        const group =
          getChoiceGroup(question);

        if (!group) {
          return;
        }

        if (!groups[group]) {
          groups[group] = [];
        }

        const option =
          getChoiceOption(question);

        if (
          !groups[group].some(
            (item) =>
              item.option === option
          )
        ) {
          const optionMarks =
            sourceQuestions
              .filter(
                (item) =>
                  getChoiceGroup(item) ===
                    group &&
                  getChoiceOption(item) ===
                    option
              )
              .reduce(
                (
                  total,
                  item
                ) =>
                  total +
                  Number(
                    item.maxMarks || 0
                  ),
                0
              );

          groups[group].push({
            option,
            marks: optionMarks,
          });
        }
      }
    );

    return groups;
  }, [
    previewData,
  ]);


  /* ==========================================================
     UPDATE QUESTION FIELD
  ========================================================== */

  const updateQuestion = (
    index,
    field,
    value
  ) => {
    setPreviewData(
      (previous) => {
        if (!previous) {
          return previous;
        }

        const updatedQuestions = [
          ...previous.questions,
        ];

        updatedQuestions[index] = {
          ...updatedQuestions[index],
          [field]: value,
        };

        return {
          ...previous,
          questions:
            updatedQuestions,
        };
      }
    );
  };


  /* ==========================================================
     UPDATE COURSE OUTCOME
  ========================================================== */

  const handleCourseOutcomeChange = (
    index,
    value
  ) => {
    setPreviewData(
      (previous) => {
        if (!previous) {
          return previous;
        }

        const updatedQuestions = [
          ...previous.questions,
        ];

        const selectedCO =
          courseOutcomes.find(
            (co) =>
              String(co.id) ===
              String(value)
          );

        updatedQuestions[index] = {
          ...updatedQuestions[index],

          courseOutcomeId:
            value || null,

          courseOutcomeCode:
            selectedCO?.code || "",
        };

        return {
          ...previous,
          questions:
            updatedQuestions,
        };
      }
    );

    setError("");
  };


  /* ==========================================================
     UPLOAD AND PREVIEW
  ========================================================== */

  const handlePreviewUpload =
    async () => {
      if (!selectedAssessment) {
        setError(
          "Please select an assessment first."
        );
        return;
      }

      if (!selectedFile) {
        setError(
          "Please select a question paper file."
        );
        return;
      }

      try {
        setLoadingPreview(true);

        setError("");

        setSuccess("");

        const response =
          await previewAssessmentQuestionUpload(
            selectedAssessment,
            selectedFile
          );

        const data =
          response?.data?.data ??
          response?.data ??
          response ??
          null;

        if (
          !data ||
          !Array.isArray(
            data.questions
          ) ||
          data.questions.length === 0
        ) {
          throw new Error(
            "No questions were detected in the uploaded question paper."
          );
        }

        setPreviewData(data);

        setQuestions(
          data.questions
        );

        /*
         * Load COs for the selected course.
         */
        const courseId =
          data?.courseId ||
          courseIdFromOffering;

        if (courseId) {
          await loadCourseOutcomes(
            courseId
          );
        }

        setSuccess(
          "Question paper uploaded successfully. Review and map all candidate questions before confirming."
        );

      } catch (err) {
        console.error(
          "Question paper preview failed:",
          err
        );

        setPreviewData(null);

        setError(
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to preview the question paper."
        );

      } finally {
        setLoadingPreview(false);
      }
    };


  /* ==========================================================
     CANDIDATE TOTAL
  ========================================================== */

  const candidateQuestions =
    useMemo(() => {
      return previewData?.questions || [];
    }, [
      previewData,
    ]);


  const candidateTotalMarks =
    useMemo(() => {
      return candidateQuestions.reduce(
        (
          total,
          question
        ) =>
          total +
          Number(
            question.maxMarks || 0
          ),
        0
      );
    }, [
      candidateQuestions,
    ]);


  const assessmentMaxMarks =
    Number(
      previewData?.assessmentMaxMarks ||
      assessments.find(
        (assessment) =>
          String(assessment.id) ===
          String(selectedAssessment)
      )?.maxMarks ||
      0
    );


  /* ==========================================================
     MISSING CO MAPPING

     IMPORTANT:
     ALL candidate questions
     must have a CO.
  ========================================================== */

  const missingCourseOutcomeQuestions =
    useMemo(() => {
      return candidateQuestions.filter(
        (question) =>
          !question.courseOutcomeId
      );
    }, [
      candidateQuestions,
    ]);


  /* ==========================================================
     CLEAR PREVIEW
  ========================================================== */

  const clearPreview = () => {
    setPreviewData(null);

    setSelectedFile(null);

    setError("");

    setSuccess("");

    const fileInput =
      document.getElementById(
        "questionPaperFile"
      );

    if (fileInput) {
      fileInput.value = "";
    }
  };


  /* ==========================================================
     CONFIRM AND SAVE

     IMPORTANT:
     Save EVERY question returned by the preview.
     OR groups are descriptive metadata only at this stage.
     A student will choose/answer the applicable question later.
  ========================================================== */
  const handleConfirm = async () => {
    const candidateQuestions = Array.isArray(previewData?.questions)
      ? previewData.questions
      : [];

    if (candidateQuestions.length === 0) {
      setError("There are no questions to confirm.");
      return;
    }

    const missingQuestions = candidateQuestions.filter(
      (question) => !question.courseOutcomeId
    );

    if (missingQuestions.length > 0) {
      setError(
        `Please assign a Course Outcome to all ${missingQuestions.length} unmapped question(s) before confirming.`
      );
      return;
    }

    try {
      setConfirming(true);
      setError("");
      setSuccess("");

      // IMPORTANT: no filtering by OR group, question number, or option.
      const questionsToSave = candidateQuestions.map((question) => ({
        questionNumber: String(question.questionNumber || "").trim(),
        description: String(question.description || "").trim(),
        maxMarks: Number(question.maxMarks),
        courseOutcomeId: question.courseOutcomeId,
        courseOutcomeCode: question.courseOutcomeCode || "",
        choiceGroup:
          question.choiceGroup ?? getChoiceGroup(question),
        choiceOption:
          question.choiceOption ?? getChoiceOption(question),
        rbtLevel: question.rbtLevel || null,
        status: question.status ?? true,
      }));

      console.log("CONFIRMING ALL QUESTIONS:", questionsToSave);
      console.log("TOTAL QUESTIONS SENT:", questionsToSave.length);

      await confirmAssessmentQuestionUpload(
        selectedAssessment,
        questionsToSave
      );

      setSuccess(
        `All ${questionsToSave.length} question(s) were confirmed and saved successfully.`
      );

      const refreshedResponse = await getQuestionsByAssessment(
        selectedAssessment
      );

      const refreshedQuestions = normalizeArrayResponse(
        refreshedResponse
      );

      setQuestions(refreshedQuestions);
      setPreviewData(null);
      setSelectedFile(null);

      const fileInput = document.getElementById("questionPaperFile");
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      console.error("Failed to confirm questions:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to save the question paper."
      );
    } finally {
      setConfirming(false);
    }
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="container mt-4 mb-5">

      {/* ======================================================
          HEADER
      ====================================================== */}
      <div className="d-flex justify-content-between align-items-center mb-3">

        <div>
          <h2 className="mb-1">
            Question Paper & Question Mapping
          </h2>

          <p className="text-muted mb-0">
            Upload the question paper, review all
            candidate questions, map Course Outcomes,
            and confirm the complete question structure.
          </p>
        </div>

      </div>


      {/* ======================================================
          ALERTS
      ====================================================== */}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}


      {/* ======================================================
          COURSE + ASSESSMENT
      ====================================================== */}

      <div className="card shadow-sm mb-4">

        <div className="card-header">
          <h5 className="mb-0">
            Assessment Selection
          </h5>
        </div>

        <div className="card-body">

          {loading || locatingAssessment ? (
            <p className="mb-0">
              {locatingAssessment
                ? "Finding the assessment course..."
                : "Loading your courses..."}
            </p>
          ) : (
            <div className="row g-3">

              {/* COURSE */}
              <div className="col-md-6">

                <label className="form-label fw-semibold">
                  Select Course
                </label>

                <select
                  className="form-select"
                  value={selectedCourse}
                  onChange={
                    handleCourseChange
                  }
                >

                  <option value="">
                    -- Select Course --
                  </option>

                  {courses.map(
                    (courseOffering) => (
                      <option
                        key={
                          courseOffering.id
                        }
                        value={
                          courseOffering.id
                        }
                      >
                        {courseOffering.course?.code ||
                          courseOffering.courseCode ||
                          "-"}{" "}
                        -{" "}
                        {courseOffering.course?.name ||
                          courseOffering.courseName ||
                          "-"}
                        {courseOffering.section
                          ? ` - Section ${courseOffering.section}`
                          : ""}
                      </option>
                    )
                  )}

                </select>

              </div>


              {/* ASSESSMENT */}
              <div className="col-md-6">

                <label className="form-label fw-semibold">
                  Select Assessment
                </label>

                <select
                  className="form-select"
                  value={
                    selectedAssessment
                  }
                  onChange={
                    handleAssessmentChange
                  }
                  disabled={
                    !selectedCourse
                  }
                >

                  <option value="">
                    -- Select Assessment --
                  </option>

                  {assessments.map(
                    (assessment) => (
                      <option
                        key={
                          assessment.id
                        }
                        value={
                          assessment.id
                        }
                      >
                        {assessment.name}{" "}
                        {assessment.type
                          ? `(${assessment.type})`
                          : ""}
                      </option>
                    )
                  )}

                </select>

                {loadingAssessments && (
                  <small className="text-muted">
                    Loading assessments...
                  </small>
                )}

              </div>

            </div>
          )}

        </div>

      </div>


      {/* ======================================================
          SELECTED COURSE INFO
      ====================================================== */}

      {selectedCourseOffering && (
        <div className="card shadow-sm mb-4">

          <div className="card-body">

            <div className="row g-3">

              <div className="col-md-4">
                <small className="text-muted d-block">
                  Course Code
                </small>

                <strong>
                  {selectedCourseOffering.course?.code ||
                    selectedCourseOffering.courseCode ||
                    "-"}
                </strong>
              </div>

              <div className="col-md-4">
                <small className="text-muted d-block">
                  Course Name
                </small>

                <strong>
                  {selectedCourseOffering.course?.name ||
                    selectedCourseOffering.courseName ||
                    "-"}
                </strong>
              </div>

              <div className="col-md-4">
                <small className="text-muted d-block">
                  Section
                </small>

                <strong>
                  {
                    selectedCourseOffering.section ||
                    "-"
                  }
                </strong>
              </div>

            </div>

          </div>

        </div>
      )}


      {/* ======================================================
          UPLOAD
      ====================================================== */}

      {selectedAssessment && (
        <div className="card shadow-sm mb-4">

          <div className="card-header">
            <h5 className="mb-0">
              Upload Question Paper
            </h5>
          </div>

          <div className="card-body">

            <div className="row g-3 align-items-end">

              <div className="col-md-9">

                <label
                  className="form-label fw-semibold"
                  htmlFor="questionPaperFile"
                >
                  Question Paper
                </label>

                <input
                  id="questionPaperFile"
                  type="file"
                  className="form-control"
                  accept=".pdf,.xlsx,.xls,.csv"
                  onChange={
                    handleFileChange
                  }
                />

                <small className="text-muted">
                  Supported formats:
                  {" "}
                  PDF, XLSX, XLS, CSV
                </small>

                {selectedFile && (
                  <div className="mt-2">
                    Selected file:
                    {" "}
                    <strong>
                      {selectedFile.name}
                    </strong>
                  </div>
                )}

              </div>


              <div className="col-md-3">

                <button
                  type="button"
                  className="btn btn-primary w-100"
                  onClick={
                    handlePreviewUpload
                  }
                  disabled={
                    !selectedFile ||
                    loadingPreview
                  }
                >
                  {loadingPreview
                    ? "Processing..."
                    : "Upload & Preview"}
                </button>

              </div>

            </div>

          </div>

        </div>
      )}


      {/* ======================================================
          EXISTING QUESTIONS
      ====================================================== */}

      {!previewData &&
        selectedAssessment &&
        questions.length > 0 && (

          <div className="card shadow-sm mb-4">

            <div className="card-header d-flex justify-content-between align-items-center">

              <h5 className="mb-0">
                Existing Mapped Questions
              </h5>

              <span className="badge bg-primary">
                {questions.length} questions
              </span>

            </div>

            <div className="card-body p-0">

              <div className="table-responsive">

                <table className="table table-bordered mb-0 align-middle">

                  <thead className="table-light">

                    <tr>

                      <th
                        style={{
                          width: "10%",
                        }}
                      >
                        Question
                      </th>

                      <th
                        style={{
                          width: "12%",
                        }}
                      >
                        OR Group
                      </th>

                      <th>
                        Description
                      </th>

                      <th
                        style={{
                          width: "10%",
                        }}
                      >
                        Marks
                      </th>

                      <th
                        style={{
                          width: "12%",
                        }}
                      >
                        CO
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {questions.map(
                      (question) => (
                        <tr
                          key={
                            question.id ||
                            question.questionNumber
                          }
                        >

                          <td className="fw-semibold">
                            {
                              question.questionNumber
                            }
                          </td>

                          <td>
                            {getChoiceGroupLabel(
                              question
                            ) ? (
                              <span className="badge bg-light text-dark border">
                                {
                                  getChoiceGroupLabel(
                                    question
                                  )
                                }
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>

                          <td>
                            {
                              question.description
                            }
                          </td>

                          <td>
                            {
                              question.maxMarks
                            }
                          </td>

                          <td>
                            {
                              question.courseOutcome
                                ?.code ||
                              question.courseOutcomeCode ||
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

          </div>
        )}


      {/* ======================================================
          QUESTION PAPER PREVIEW
      ====================================================== */}

      {previewData && (
        <>

          {/* ====================================================
              PAPER SUMMARY
          ==================================================== */}

          <div className="card shadow-sm mb-4">

            <div className="card-header d-flex justify-content-between align-items-center">

              <div>

                <h5 className="mb-1">
                  Question Paper Preview
                </h5>

                <small className="text-muted">
                  {previewData.fileName}
                </small>

              </div>

              <span className="badge bg-secondary">
                {previewData.fileType}
              </span>

            </div>


            <div className="card-body">

              <div className="row g-3 mb-4">

                {/* ASSESSMENT */}
                <div className="col-md-3">

                  <div className="border rounded p-3">

                    <small className="text-muted">
                      Assessment
                    </small>

                    <div className="fw-semibold">
                      {
                        previewData.assessmentName
                      }
                    </div>

                  </div>

                </div>


                {/* TYPE */}
                <div className="col-md-3">

                  <div className="border rounded p-3">

                    <small className="text-muted">
                      Type
                    </small>

                    <div className="fw-semibold">
                      {
                        previewData.assessmentType
                      }
                    </div>

                  </div>

                </div>


                {/* CANDIDATE QUESTIONS */}
                <div className="col-md-3">

                  <div className="border rounded p-3">

                    <small className="text-muted">
                      Candidate Questions
                    </small>

                    <div className="fw-semibold">
                      {
                        candidateQuestions.length
                      }
                    </div>

                  </div>

                </div>


                {/* CANDIDATE MARKS */}
                <div className="col-md-3">

                  <div className="border rounded p-3">

                    <small className="text-muted">
                      Candidate Marks
                    </small>

                    <div className="fw-semibold">
                      {
                        candidateTotalMarks
                      }
                    </div>

                  </div>

                </div>

              </div>


              {/* IMPORTANT DESIGN NOTE */}

              <div className="alert alert-info">

                <strong>
                  Important:
                </strong>{" "}

                All candidate questions are saved during
                question mapping. The OR alternatives are
                not selected by faculty here.

                Students will choose their own OR question
                later during question-wise Marks Entry.

              </div>


              {/* ==================================================
                  QUESTION TABLE
              ================================================== */}

              <div className="table-responsive">

                <table className="table table-bordered align-middle">

                  <thead className="table-light">

                    <tr>

                      <th
                        style={{
                          width: "10%",
                        }}
                      >
                        Question
                      </th>

                      <th
                        style={{
                          width: "14%",
                        }}
                      >
                        OR Group
                      </th>

                      <th>
                        Description
                      </th>

                      <th
                        style={{
                          width: "10%",
                        }}
                      >
                        Marks
                      </th>

                      <th
                        style={{
                          width: "20%",
                        }}
                      >
                        Course Outcome
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {candidateQuestions.map(
                      (
                        question,
                        index
                      ) => {

                        const choiceGroup =
                          getChoiceGroup(
                            question
                          );

                        return (
                          <tr
                            key={
                              `${question.questionNumber}-${index}`
                            }
                          >

                            {/* QUESTION */}
                            <td>

                              <div className="fw-semibold">
                                {
                                  question.questionNumber
                                }
                              </div>

                            </td>


                            {/* OR GROUP */}
                            <td>

                              {choiceGroup ? (
                                <div>

                                  <span className="badge bg-warning text-dark mb-1">
                                    OR Group{" "}
                                    {
                                      choiceGroup
                                    }
                                  </span>

                                  <div>
                                    <small className="text-muted">
                                      {
                                        getChoiceGroupLabel(
                                          question
                                        )
                                      }
                                    </small>
                                  </div>

                                </div>
                              ) : (
                                <span className="text-muted">
                                  -
                                </span>
                              )}

                            </td>


                            {/* DESCRIPTION */}
                            <td>

                              <textarea
                                className="form-control"
                                rows="3"
                                value={
                                  question.description ||
                                  ""
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateQuestion(
                                    index,
                                    "description",
                                    event.target.value
                                  )
                                }
                              />

                            </td>


                            {/* MARKS */}
                            <td>

                              <input
                                type="number"
                                min="0"
                                className="form-control"
                                value={
                                  question.maxMarks ??
                                  ""
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateQuestion(
                                    index,
                                    "maxMarks",
                                    event.target.value
                                  )
                                }
                              />

                            </td>


                            {/* CO */}
                            <td>

                              <select
                                className={`form-select ${
                                  question.courseOutcomeId
                                    ? ""
                                    : "border-danger"
                                }`}
                                value={
                                  question.courseOutcomeId ||
                                  ""
                                }
                                onChange={(
                                  event
                                ) =>
                                  handleCourseOutcomeChange(
                                    index,
                                    event.target.value
                                  )
                                }
                                disabled={
                                  loadingCOs
                                }
                              >

                                <option value="">
                                  -- Select CO --
                                </option>

                                {courseOutcomes.map(
                                  (co) => (
                                    <option
                                      key={
                                        co.id
                                      }
                                      value={
                                        co.id
                                      }
                                    >
                                      {co.code}{" "}
                                      -{" "}
                                      {co.description}
                                    </option>
                                  )
                                )}

                              </select>


                              {question.courseOutcomeCode &&
                                !question.courseOutcomeId && (
                                  <small className="text-danger d-block mt-1">
                                    Extracted CO:
                                    {" "}
                                    {
                                      question.courseOutcomeCode
                                    }
                                  </small>
                                )}

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </div>


          {/* ====================================================
              OR STRUCTURE SUMMARY
          ==================================================== */}

          {Object.keys(
            choiceGroups
          ).length > 0 && (

            <div className="card shadow-sm mb-4">

              <div className="card-header">

                <h5 className="mb-0">
                  Question Paper OR Structure
                </h5>

              </div>


              <div className="card-body">

                <div className="alert alert-warning">

                  These are the alternatives present in
                  the question paper. Faculty does not
                  select one here.

                </div>


                {Object.keys(
                  choiceGroups
                )
                  .sort(
                    (a, b) =>
                      Number(a) -
                      Number(b)
                  )
                  .map(
                    (group) => {

                      const options =
                        choiceGroups[group];

                      return (
                        <div
                          key={group}
                          className="border rounded p-3 mb-3"
                        >

                          <div className="fw-semibold mb-2">

                            {Number(group) === 1 &&
                              "Part 1 — Q1 OR Q2"}

                            {Number(group) === 2 &&
                              "Part 2 — Q3 OR Q4"}

                            {Number(group) === 3 &&
                              "Part 3 — Q5 OR Q6"}

                          </div>


                          <div className="d-flex flex-wrap gap-3">

                            {options.map(
                              (option) => (
                                <div
                                  key={
                                    option.option
                                  }
                                  className="border rounded px-3 py-2"
                                >

                                  <strong>
                                    Q
                                    {
                                      option.option
                                    }
                                  </strong>

                                  <span className="text-muted">
                                    {" "}
                                    (
                                    {
                                      option.marks
                                    }{" "}
                                    candidate marks)
                                  </span>

                                </div>
                              )
                            )}

                          </div>

                        </div>
                      );
                    }
                  )}

              </div>

            </div>
          )}


          {/* ====================================================
              CO WARNING
          ==================================================== */}

          {missingCourseOutcomeQuestions.length >
            0 && (

            <div className="alert alert-warning">

              <strong>
                CO mapping required:
              </strong>{" "}

              {
                missingCourseOutcomeQuestions.length
              }{" "}

              candidate question(s) do not have a
              Course Outcome assigned.

            </div>
          )}


          {/* ====================================================
              FINAL SUMMARY
          ==================================================== */}

          <div className="card shadow-sm mb-4">

            <div className="card-body">

              <div className="row align-items-center">

                <div className="col-md-4">

                  <small className="text-muted">
                    Candidate Questions
                  </small>

                  <div className="fs-5 fw-semibold">
                    {
                      candidateQuestions.length
                    }
                  </div>

                </div>


                <div className="col-md-4">

                  <small className="text-muted">
                    Candidate Marks
                  </small>

                  <div className="fs-5 fw-semibold text-primary">
                    {
                      candidateTotalMarks
                    }
                  </div>

                  <small className="text-muted">
                    Student assessment maximum:
                    {" "}
                    {
                      assessmentMaxMarks ||
                      "-"
                    }
                  </small>

                </div>


                <div className="col-md-4 text-md-end">

                  <span className="badge bg-info text-dark fs-6">

                    OR alternatives handled per student

                  </span>

                </div>

              </div>

            </div>

          </div>


          {/* ====================================================
              ACTIONS
          ==================================================== */}

          <div className="d-flex justify-content-end gap-2">

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={
                clearPreview
              }
              disabled={
                confirming
              }
            >
              Clear Preview
            </button>


            <button
              type="button"
              className="btn btn-success"
              onClick={
                handleConfirm
              }
              disabled={
                confirming ||
                loadingCOs ||
                missingCourseOutcomeQuestions.length >
                  0
              }
            >

              {confirming
                ? "Saving..."
                : "Confirm & Save All Questions"}

            </button>

          </div>

        </>
      )}

    </div>
  );
};


export default QuestionMapping;