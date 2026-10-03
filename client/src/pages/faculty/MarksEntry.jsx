import { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import {
  Save,
  PencilSquare,
  Table,
  Printer,
  FileEarmarkExcel,
  FileEarmarkPdf,
  Upload as UploadIcon,
} from "react-bootstrap-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { useMyCourseOfferings } from "../../hooks/useCourseOfferings";
import { useRegistrationsByCourseOffering } from "../../hooks/useCourseRegistrations";
import {
  useAssessmentQuestions,
  useStudentAssessmentMarks,
  useSaveStudentMarks,
} from "../../hooks/useStudentQuestionMarks";

import {
  getAssessmentsByCourseOffering,
  getMarksByAssessment,
} from "../../services/studentQuestionMarkService";

// Import Direct Marks Entry Component
import DirectMarksEntry from "./DirectMarksEntry";

// Default OR selections (Q1 vs Q2, Q3 vs Q4, Q5 vs Q6)
const DEFAULT_SELECTED_PARTS = Object.freeze({ part1: 1, part2: 3, part3: 5 });

// Helper to extract numeric prefix: "Q1(a)" -> 1, "Q2" -> 2
const getMainNumber = (qNum) => {
  const match = String(qNum || "").trim().match(/^Q?\s*(\d+)/i);
  return match ? Number(match[1]) : null;
};

// Deduces student chosen OR parts from existing question marks
const detectStudentSelectedParts = (allQuestions, savedMarks) => {
  if (!savedMarks || savedMarks.length === 0 || !allQuestions || allQuestions.length === 0) {
    return DEFAULT_SELECTED_PARTS;
  }

  const savedQuestionIdSet = new Set(
    savedMarks.map(
      (m) =>
        m.assessmentQuestionId ||
        m.assessment_question_id ||
        m.assessmentQuestion?.id ||
        m.AssessmentQuestionId
    )
  );

  const matchedQuestions = allQuestions.filter((q) =>
    savedQuestionIdSet.has(q.id)
  );

  const detected = { ...DEFAULT_SELECTED_PARTS };

  for (const q of matchedQuestions) {
    const mainNum = getMainNumber(q.questionNumber);
    if (mainNum === 1 || mainNum === 2) detected.part1 = mainNum;
    if (mainNum === 3 || mainNum === 4) detected.part2 = mainNum;
    if (mainNum === 5 || mainNum === 6) detected.part3 = mainNum;
  }

  return detected;
};

// Robust header cleaner that strips "[Max: 7]", "(max 10)", "Q", spaces, and symbols
const cleanQuestionCode = (str) => {
  return String(str || "")
    .replace(/\[.*?\]/g, "")
    .replace(/\(.*max.*?\)/gi, "")
    .replace(/max\s*:\s*\d+/gi, "")
    .toLowerCase()
    .replace(/^q/i, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
};

function MarksEntry() {
  const [activeTab, setActiveTab] = useState("entry"); // 'entry' | 'all'
  const queryClient = useQueryClient();

  const [selectedCourseOfferingId, setSelectedCourseOfferingId] = useState("");
  const [selectedAssessmentId, setSelectedAssessmentId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const fileInputRef = useRef(null);

  const [selectedParts, setSelectedParts] = useState(DEFAULT_SELECTED_PARTS);
  const [marksState, setMarksState] = useState({});

  // 1. Course offerings assigned to logged-in faculty
  const { data: courseOfferings = [] } = useMyCourseOfferings();

  useEffect(() => {
    if (courseOfferings.length > 0 && !selectedCourseOfferingId) {
      setSelectedCourseOfferingId(courseOfferings[0].id);
    }
  }, [courseOfferings.length, selectedCourseOfferingId]);

  // 2. Fetch Assessments dynamically for chosen course offering
  const { data: assessments = [], isLoading: assessmentsLoading } = useQuery({
    queryKey: ["assessments", "courseOffering", selectedCourseOfferingId],
    enabled: Boolean(selectedCourseOfferingId),
    queryFn: async () => {
      const res = await getAssessmentsByCourseOffering(selectedCourseOfferingId);
      return res?.data?.data || res?.data || [];
    },
  });

  // Guarded assessment auto-selection
  useEffect(() => {
    if (assessments.length > 0) {
      const stillValid = assessments.some((a) => a.id === selectedAssessmentId);
      if (!stillValid) {
        setSelectedAssessmentId(assessments[0].id);
      }
    } else {
      if (selectedAssessmentId !== "") {
        setSelectedAssessmentId("");
      }
    }
  }, [assessments, selectedAssessmentId]);

  // 3. Registered students sorted by USN
  const { data: registrations = [], isLoading: registrationsLoading } =
    useRegistrationsByCourseOffering(selectedCourseOfferingId);

  const sortedRegistrations = useMemo(() => {
    if (!registrations || registrations.length === 0) return [];
    return [...registrations].sort((a, b) => {
      const usnA = (a.student?.usn || a.student?.USN || "").trim();
      const usnB = (b.student?.usn || b.student?.USN || "").trim();
      return usnA.localeCompare(usnB, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });
  }, [registrations]);

  // Guarded student auto-selection
  useEffect(() => {
    if (sortedRegistrations.length > 0) {
      const validStudent = sortedRegistrations.some(
        (r) =>
          (r.student?.id || r.studentId || r.student_id || r.id) === selectedStudentId
      );
      if (!validStudent) {
        const firstId =
          sortedRegistrations[0].student?.id ||
          sortedRegistrations[0].studentId ||
          sortedRegistrations[0].student_id ||
          "";
        if (firstId) setSelectedStudentId(firstId);
      }
    } else {
      if (selectedStudentId !== "") {
        setSelectedStudentId("");
      }
    }
  }, [sortedRegistrations, selectedStudentId]);

  const currentOffering = useMemo(() => {
    return courseOfferings.find((c) => c.id === selectedCourseOfferingId);
  }, [courseOfferings, selectedCourseOfferingId]);

  const currentAssessment = useMemo(() => {
    return assessments.find((a) => a.id === selectedAssessmentId);
  }, [assessments, selectedAssessmentId]);

  // Detect whether assessment should use Direct Marks or Question-Wise
  const isDirectMarksMode = useMemo(() => {
    if (!currentAssessment) return false;
    if (currentAssessment.entryMode === "DIRECT_MARKS") return true;
    if (currentAssessment.entryMode === "QUESTION_WISE") return false;

    const t = String(currentAssessment.type || "").toUpperCase();
    return ["QUIZ", "ASSIGNMENT", "SEE", "LAB", "PROJECT", "SEMINAR", "MOOC"].includes(t);
  }, [currentAssessment]);

  // 4. Questions configured for assessment
  const { data: questions = [], isLoading: questionsLoading } =
    useAssessmentQuestions(selectedAssessmentId);

  const sortedAllQuestions = useMemo(() => {
    return [...questions]
      .filter((q) => q.status !== false)
      .sort((a, b) =>
        (a.questionNumber || "").localeCompare(b.questionNumber || "", undefined, {
          numeric: true,
        })
      );
  }, [questions]);

  // 5. Saved marks for the active student (Single Entry Mode)
  const { data: existingMarks = [] } = useStudentAssessmentMarks(
    selectedAssessmentId,
    selectedStudentId
  );

  // 6. Saved marks for all students (Kept always enabled for Question-Wise assessments)
  const {
    data: allMarksRaw = [],
    isLoading: allMarksLoading,
    refetch: refetchAllMarks,
  } = useQuery({
    queryKey: ["allAssessmentMarks", selectedAssessmentId],
    enabled: Boolean(selectedAssessmentId) && !isDirectMarksMode,
    queryFn: async () => {
      const res = await getMarksByAssessment(selectedAssessmentId);
      const list = res?.data?.data || res?.data || res || [];
      return Array.isArray(list) ? list : [];
    },
  });

  // Bulletproof marks lookup matching all Sequelize naming variations
  const marksLookup = useMemo(() => {
    const map = new Map();
    if (!Array.isArray(allMarksRaw)) return map;

    allMarksRaw.forEach((m) => {
      const sId =
        m.studentId ||
        m.student_id ||
        m.student?.id ||
        m.StudentId;

      const qId =
        m.assessmentQuestionId ||
        m.assessment_question_id ||
        m.assessmentQuestion?.id ||
        m.AssessmentQuestionId;

      if (sId && qId) {
        map.set(`${sId}_${qId}`, m);
      }
    });

    return map;
  }, [allMarksRaw]);

  const saveMarksMutation = useSaveStudentMarks();

  useEffect(() => {
    if (existingMarks.length > 0 && sortedAllQuestions.length > 0) {
      const detected = detectStudentSelectedParts(sortedAllQuestions, existingMarks);
      setSelectedParts((prev) => {
        if (
          prev.part1 === detected.part1 &&
          prev.part2 === detected.part2 &&
          prev.part3 === detected.part3
        ) {
          return prev;
        }
        return detected;
      });
    } else {
      setSelectedParts((prev) => {
        if (
          prev.part1 === DEFAULT_SELECTED_PARTS.part1 &&
          prev.part2 === DEFAULT_SELECTED_PARTS.part2 &&
          prev.part3 === DEFAULT_SELECTED_PARTS.part3
        ) {
          return prev;
        }
        return DEFAULT_SELECTED_PARTS;
      });
    }
  }, [selectedStudentId, existingMarks, sortedAllQuestions]);

  const visibleQuestions = useMemo(() => {
    const chosenSet = new Set([
      selectedParts.part1,
      selectedParts.part2,
      selectedParts.part3,
    ]);

    return sortedAllQuestions.filter((q) =>
      chosenSet.has(getMainNumber(q.questionNumber))
    );
  }, [sortedAllQuestions, selectedParts]);

  useEffect(() => {
    const nextState = {};
    visibleQuestions.forEach((q) => {
      const saved = existingMarks.find(
        (m) =>
          (m.assessmentQuestionId ||
            m.assessment_question_id ||
            m.assessmentQuestion?.id ||
            m.AssessmentQuestionId) === q.id
      );
      if (saved) {
        nextState[q.id] = {
          marksObtained: saved.marksObtained ?? saved.marks_obtained,
          isAbsent: Boolean(saved.isAbsent ?? saved.is_absent),
          isAttempted: Boolean(saved.isAttempted ?? saved.is_attempted ?? true),
        };
      } else {
        nextState[q.id] = {
          marksObtained: "",
          isAbsent: false,
          isAttempted: true,
        };
      }
    });
    setMarksState(nextState);
  }, [visibleQuestions, existingMarks]);

  const handleMarkChange = (questionId, value, maxMarks) => {
    const num = Number(value);
    if (num > maxMarks) {
      toast.warning(`Maximum marks for this sub-question is ${maxMarks}`);
      return;
    }
    setMarksState((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        marksObtained: value,
        isAttempted: value !== "" && num >= 0,
      },
    }));
  };

  const handleAbsentToggle = (questionId, isAbsent) => {
    setMarksState((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        isAbsent,
        isAttempted: !isAbsent,
        marksObtained: isAbsent ? 0 : "",
      },
    }));
  };

  const totalObtained = useMemo(() => {
    return Object.values(marksState).reduce((acc, curr) => {
      return acc + (Number(curr?.marksObtained) || 0);
    }, 0);
  }, [marksState]);

  const handleSaveMarks = async () => {
    if (!selectedAssessmentId || !selectedStudentId) {
      toast.error("Please select an assessment and student.");
      return;
    }

    const payloadMarks = visibleQuestions.map((q) => {
      const row = marksState[q.id] || {};
      const isAbsent = Boolean(row.isAbsent);
      const val = row.marksObtained;
      const numVal = isAbsent || val === "" || val === undefined ? 0 : Number(val);

      return {
        assessmentQuestionId: q.id,
        marksObtained: numVal,
        isAbsent,
        isAttempted: !isAbsent && val !== "" && val !== undefined,
      };
    });

    try {
      await saveMarksMutation.mutateAsync({
        assessmentId: selectedAssessmentId,
        studentId: selectedStudentId,
        payload: {
          selectedQuestions: selectedParts,
          marks: payloadMarks,
        },
      });
      toast.success("Marks saved successfully!");
      queryClient.invalidateQueries({
        queryKey: ["studentMarks", selectedAssessmentId, selectedStudentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["allAssessmentMarks", selectedAssessmentId],
      });
      refetchAllMarks();
    } catch (err) {
      const serverMessage =
        err?.response?.data?.message || "Failed to save marks.";
      toast.error(serverMessage);
    }
  };

  // =========================================================
  // EXCEL: DOWNLOAD TEMPLATE
  // =========================================================
  const handleDownloadExcel = () => {
    if (!selectedAssessmentId || sortedRegistrations.length === 0) {
      toast.error("Select a course offering and assessment first.");
      return;
    }

    const headers = ["USN", "Student Name"];
    sortedAllQuestions.forEach((q) => {
      headers.push(`${q.questionNumber} [Max: ${q.maxMarks}]`);
    });

    const rows = sortedRegistrations.map((r) => {
      const s = r.student || {};
      const sId = s.id || r.studentId || r.student_id || r.id;
      const rowObj = {
        USN: s.usn || s.USN || "",
        "Student Name": `${s.firstName || ""} ${s.lastName || ""}`.trim() || s.name || "",
      };

      sortedAllQuestions.forEach((q) => {
        const mark = marksLookup.get(`${sId}_${q.id}`);
        const colKey = `${q.questionNumber} [Max: ${q.maxMarks}]`;
        const val = mark?.marksObtained ?? mark?.marks_obtained;
        const isAbs = mark?.isAbsent ?? mark?.is_absent;

        if (isAbs) {
          rowObj[colKey] = "AB";
        } else {
          rowObj[colKey] = val !== undefined && val !== null ? val : "";
        }
      });
      return rowObj;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Marks");

    const fileName = `${currentOffering?.course?.code || "Course"}_${
      currentAssessment?.name || "Assessment"
    }_Marks.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // =========================================================
  // EXCEL: ROBUST QUESTION-WISE BULK UPLOAD HANDLER
  // =========================================================
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName =
          workbook.SheetNames.find(
            (n) =>
              n.toUpperCase().includes("IA") ||
              n.toUpperCase().includes("TEST") ||
              n.toUpperCase().includes("MARKS")
          ) || workbook.SheetNames[0];

        const sheet = workbook.Sheets[sheetName];
        const rawGrid = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

        if (!rawGrid || rawGrid.length === 0) {
          toast.error("Spreadsheet is empty.");
          return;
        }

        // 1. Locate Header Row containing USN
        let headerRowIdx = rawGrid.findIndex((row) =>
          row.some((cell) => {
            const val = String(cell || "").trim().toUpperCase();
            return val === "USN" || val === "ROLL NO" || val.includes("USN");
          })
        );
        if (headerRowIdx === -1) headerRowIdx = 0;

        const headerRow = rawGrid[headerRowIdx].map((c) => String(c || "").trim());
        const usnColIdx = headerRow.findIndex((c) => {
          const val = c.toUpperCase();
          return val === "USN" || val === "ROLL NO" || val.includes("USN");
        });

        if (usnColIdx === -1) {
          toast.error("Could not find a 'USN' column header in this spreadsheet.");
          return;
        }

        // 2. Map Columns to Configured Questions
        const positionalTargetMap = {
          3: "1a",  // Col D
          4: "1b",  // Col E
          5: "1c",  // Col F
          6: "2a",  // Col G
          7: "2b",  // Col H
          8: "2c",  // Col I
          9: "3a",  // Col J
          10: "3b", // Col K
          12: "4a", // Col M
          13: "4b", // Col N
          15: "5",  // Col P
          18: "6",  // Col S
        };

        const isStandardLayout =
          headerRow.length >= 16 &&
          headerRow.some((h) => cleanQuestionCode(h) === "1a") &&
          headerRow.some((h) => cleanQuestionCode(h) === "2a");

        const mappedColIndices = new Map();

        sortedAllQuestions.forEach((q) => {
          const targetClean = cleanQuestionCode(q.questionNumber);
          let foundColIdx = -1;

          foundColIdx = headerRow.findIndex((colTitle, idx) => {
            if (idx === usnColIdx || !colTitle) return false;
            const cClean = cleanQuestionCode(colTitle);
            return (
              cClean === targetClean ||
              (targetClean === "5" && (cClean === "5a" || cClean === "5")) ||
              (targetClean === "6" && (cClean === "6a" || cClean === "6"))
            );
          });

          if (foundColIdx === -1 && isStandardLayout) {
            for (const [colIdxStr, code] of Object.entries(positionalTargetMap)) {
              if (
                code === targetClean ||
                (targetClean === "5" && code === "5") ||
                (targetClean === "6" && code === "6")
              ) {
                foundColIdx = Number(colIdxStr);
                break;
              }
            }
          }

          if (foundColIdx !== -1) {
            mappedColIndices.set(q.id, { colIndex: foundColIdx, question: q });
          }
        });

        if (mappedColIndices.size === 0) {
          toast.error("Could not match any columns to the configured questions (Q1, Q2, etc.).");
          return;
        }

        // 3. Build Student Lookup Map (USN -> studentId)
        const studentMap = new Map();
        sortedRegistrations.forEach((r) => {
          const s = r.student || {};
          const u = String(s.usn || s.USN || "").trim().toUpperCase();
          const sId = s.id || r.studentId || r.student_id || r.id;
          if (u && sId) studentMap.set(u, sId);
        });

        const recordsToSave = [];

        // 4. Process Every Student Row
        for (let r = headerRowIdx + 1; r < rawGrid.length; r++) {
          const row = rawGrid[r];
          const rawUsn = String(row[usnColIdx] || "").trim().toUpperCase();
          if (!rawUsn || !/\d/.test(rawUsn)) continue;

          const studentId = studentMap.get(rawUsn);
          if (!studentId) continue;

          const studentParsedMarks = [];
          mappedColIndices.forEach(({ colIndex, question }) => {
            const val = row[colIndex];
            const isAbsent = String(val).trim().toUpperCase() === "AB";
            const hasVal = val !== undefined && val !== null && String(val).trim() !== "";
            const numVal = isAbsent ? 0 : Number(val);

            if (hasVal && !isAbsent && !isNaN(numVal) && numVal >= 0) {
              studentParsedMarks.push({
                assessmentQuestionId: question.id,
                marksObtained: Math.min(Math.max(0, numVal), question.maxMarks),
                isAbsent: false,
                isAttempted: true,
              });
            }
          });

          const chosenParts = detectStudentSelectedParts(sortedAllQuestions, studentParsedMarks);
          const chosenSet = new Set([chosenParts.part1, chosenParts.part2, chosenParts.part3]);

          const relevantQuestions = sortedAllQuestions.filter((q) =>
            chosenSet.has(getMainNumber(q.questionNumber))
          );

          const finalMarksList = [];
          const seenQuestionIds = new Set();

          relevantQuestions.forEach((q) => {
            if (seenQuestionIds.has(q.id)) return;
            seenQuestionIds.add(q.id);

            const colInfo = mappedColIndices.get(q.id);
            const val = colInfo ? row[colInfo.colIndex] : "";
            const isAbsent = String(val).trim().toUpperCase() === "AB";
            const hasVal = val !== undefined && val !== null && String(val).trim() !== "";
            const num = Number(val);

            finalMarksList.push({
              assessmentQuestionId: q.id,
              marksObtained:
                hasVal && !isAbsent && !isNaN(num)
                  ? Math.min(Math.max(0, num), q.maxMarks)
                  : 0,
              isAbsent: isAbsent,
              isAttempted: hasVal && !isAbsent && !isNaN(num) && num > 0,
            });
          });

          if (finalMarksList.length > 0) {
            recordsToSave.push({
              studentId,
              selectedParts: chosenParts,
              marks: finalMarksList,
            });
          }
        }

        if (recordsToSave.length === 0) {
          toast.warning("No matching registered students found in this Excel sheet.");
          return;
        }

        toast.info(`Uploading marks for ${recordsToSave.length} students...`);
        let savedCount = 0;
        let failCount = 0;

        const CHUNK_SIZE = 5;
        for (let i = 0; i < recordsToSave.length; i += CHUNK_SIZE) {
          const chunk = recordsToSave.slice(i, i + CHUNK_SIZE);
          const results = await Promise.allSettled(
            chunk.map((rec) =>
              saveMarksMutation.mutateAsync({
                assessmentId: selectedAssessmentId,
                studentId: rec.studentId,
                payload: {
                  selectedQuestions: rec.selectedParts,
                  marks: rec.marks,
                },
              })
            )
          );

          results.forEach((res) => {
            if (res.status === "fulfilled") {
              savedCount++;
            } else {
              failCount++;
              console.error("Single student save failed:", res.reason);
            }
          });
        }

        if (savedCount > 0) {
          toast.success(`Successfully uploaded marks for ${savedCount} students!`);
          if (failCount > 0) {
            toast.warning(`${failCount} records failed. Check browser console.`);
          }

          // Invalidate and force refetch immediately
          await queryClient.invalidateQueries({
            queryKey: ["allAssessmentMarks", selectedAssessmentId],
          });
          await queryClient.invalidateQueries({
            queryKey: ["studentMarks", selectedAssessmentId],
          });
          await refetchAllMarks();
        } else {
          toast.error("Failed to save marks. Check server logs.");
        }
      } catch (err) {
        console.error("Excel upload parsing error:", err);
        toast.error("Failed to parse Excel file.");
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // =========================================================
  // PDF: EXPORT LEDGER
  // =========================================================
  const handleExportPDF = () => {
    if (!selectedAssessmentId || sortedRegistrations.length === 0) {
      toast.error("Select course offering and assessment first.");
      return;
    }

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING", 148, 12, { align: "center" });

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Continuous Internal Evaluation (CIE) Marks Statement", 148, 18, { align: "center" });

    doc.setFontSize(9);
    doc.text(`Course: ${currentOffering?.course?.code || ""} - ${currentOffering?.course?.name || ""}`, 14, 25);
    doc.text(`Assessment: ${currentAssessment?.name || ""} (Max Marks: ${currentAssessment?.maxMarks || ""})`, 148, 25, { align: "center" });
    doc.text(`Section: ${currentOffering?.section || "A"}`, 282, 25, { align: "right" });

    const headRow1 = [
      { content: "#", rowSpan: 2, styles: { halign: "center", valign: "middle" } },
      { content: "USN", rowSpan: 2, styles: { halign: "left", valign: "middle" } },
      { content: "Student Name", rowSpan: 2, styles: { halign: "left", valign: "middle" } },
      ...sortedAllQuestions.map((q) => ({
        content: `${q.questionNumber}\n[${q.maxMarks}m]`,
        styles: { halign: "center", valign: "middle" },
      })),
      { content: "Total", rowSpan: 2, styles: { halign: "center", valign: "middle" } },
    ];

    const headRow2 = sortedAllQuestions.map((q) => ({
      content: q.courseOutcome?.code || "CO",
      styles: { halign: "center", valign: "middle" },
    }));

    const tableBody = sortedRegistrations.map((r, index) => {
      const student = r.student || {};
      const sId = student.id || r.studentId || r.student_id || r.id;
      let total = 0;
      let hasAttempted = false;

      const marksCols = sortedAllQuestions.map((q) => {
        const mark = marksLookup.get(`${sId}_${q.id}`);
        if (!mark) return "-";
        const isAbs = mark.isAbsent ?? mark.is_absent;
        if (isAbs) return "AB";
        const val = mark.marksObtained ?? mark.marks_obtained;
        if (val === undefined || val === null || val === "") return "-";

        hasAttempted = true;
        total += Number(val || 0);
        return String(val);
      });

      return [
        index + 1,
        student.usn || student.USN || "",
        `${student.firstName || ""} ${student.lastName || ""}`.trim() || student.name || "",
        ...marksCols,
        hasAttempted ? total : "-",
      ];
    });

    autoTable(doc, {
      startY: 29,
      head: [headRow1, headRow2],
      body: tableBody,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 1.5, halign: "center" },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 26, halign: "left" },
        2: { cellWidth: 42, halign: "left" },
      },
      didDrawPage: () => {
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.line(14, pageHeight - 16, 60, pageHeight - 16);
        doc.text("Course Instructor", 37, pageHeight - 12, { align: "center" });

        doc.line(125, pageHeight - 16, 175, pageHeight - 16);
        doc.text("Module Coordinator", 150, pageHeight - 12, { align: "center" });

        doc.line(235, pageHeight - 16, 282, pageHeight - 16);
        doc.text("Head of Department (HOD)", 258, pageHeight - 12, { align: "center" });
      },
    });

    const pdfName = `${currentOffering?.course?.code || "Course"}_${
      currentAssessment?.name || "Assessment"
    }_Ledger.pdf`;
    doc.save(pdfName);
  };

  return (
    <div className="container-fluid p-4">
      {/* HEADER & TOOLBAR */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 d-print-none gap-2">
        <div>
          <h2 className="fw-bold mb-1">Student Marks Management</h2>
          <p className="text-muted mb-0">
            {isDirectMarksMode
              ? "Direct student-wise overall marks entry."
              : "Record question-level marks, upload Excel spreadsheets, or export official statements."}
          </p>
        </div>

        {/* Action toolbar for Question-Wise mode */}
        {!isDirectMarksMode && (
          <div className="d-flex flex-wrap align-items-center gap-2">
            <div className="btn-group shadow-sm">
              <button
                type="button"
                className={`btn ${
                  activeTab === "entry" ? "btn-primary" : "btn-outline-primary"
                } d-inline-flex align-items-center gap-2`}
                onClick={() => setActiveTab("entry")}
              >
                <PencilSquare /> Enter Marks
              </button>
              <button
                type="button"
                className={`btn ${
                  activeTab === "all" ? "btn-primary" : "btn-outline-primary"
                } d-inline-flex align-items-center gap-2`}
                onClick={() => setActiveTab("all")}
              >
                <Table /> View All Marks
              </button>
            </div>

            <button
              type="button"
              className="btn btn-outline-success d-inline-flex align-items-center gap-2 shadow-sm"
              onClick={handleDownloadExcel}
              disabled={!selectedAssessmentId || sortedRegistrations.length === 0}
              title="Download blank template or existing marks sheet"
            >
              <FileEarmarkExcel /> Excel Template
            </button>

            <label
              className="btn btn-outline-primary d-inline-flex align-items-center gap-2 shadow-sm mb-0 cursor-pointer"
              title="Upload filled marks spreadsheet"
            >
              <UploadIcon /> Upload Excel
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                style={{ display: "none" }}
                onChange={handleFileUpload}
                disabled={!selectedAssessmentId}
              />
            </label>

            <button
              type="button"
              className="btn btn-outline-danger d-inline-flex align-items-center gap-2 shadow-sm"
              onClick={handleExportPDF}
              disabled={!selectedAssessmentId || sortedRegistrations.length === 0}
            >
              <FileEarmarkPdf /> Export PDF
            </button>

            <button
              type="button"
              className="btn btn-outline-dark d-inline-flex align-items-center gap-2 shadow-sm"
              onClick={() => window.print()}
              disabled={sortedRegistrations.length === 0}
            >
              <Printer /> Print
            </button>
          </div>
        )}
      </div>

      {/* FILTER DROPDOWNS */}
      <div className="card border-0 shadow-sm mb-4 d-print-none">
        <div className="card-body">
          <div className="row g-3">
            <div className={!isDirectMarksMode && activeTab === "entry" ? "col-md-4" : "col-md-6"}>
              <label className="form-label fw-semibold">Course Offering</label>
              <select
                className="form-select"
                value={selectedCourseOfferingId}
                onChange={(e) => {
                  setSelectedCourseOfferingId(e.target.value);
                  setSelectedAssessmentId("");
                  setSelectedStudentId("");
                }}
              >
                <option value="">Select course offering</option>
                {courseOfferings.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.course?.code} - {c.course?.name} ({c.section || "A"})
                  </option>
                ))}
              </select>
            </div>

            <div className={!isDirectMarksMode && activeTab === "entry" ? "col-md-4" : "col-md-6"}>
              <label className="form-label fw-semibold">Assessment</label>
              <select
                className="form-select"
                value={selectedAssessmentId}
                onChange={(e) => setSelectedAssessmentId(e.target.value)}
                disabled={!selectedCourseOfferingId || assessmentsLoading}
              >
                {assessmentsLoading ? (
                  <option value="">Loading assessments...</option>
                ) : assessments.length === 0 ? (
                  <option value="">No assessments configured</option>
                ) : (
                  assessments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} (Max: {a.maxMarks}) {a.entryMode === "DIRECT_MARKS" ? "— [Direct]" : ""}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Student dropdown ONLY needed in Question-Wise mode */}
            {!isDirectMarksMode && activeTab === "entry" && (
              <div className="col-md-4">
                <label className="form-label fw-semibold">Student</label>
                <select
                  className="form-select"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  disabled={
                    !selectedCourseOfferingId ||
                    registrationsLoading ||
                    sortedRegistrations.length === 0
                  }
                >
                  {registrationsLoading ? (
                    <option value="">Loading students...</option>
                  ) : sortedRegistrations.length === 0 ? (
                    <option value="">No registered students</option>
                  ) : (
                    sortedRegistrations.map((r) => {
                      const student = r.student || {};
                      const usn = student.usn || student.USN || "-";
                      const name =
                        [student.firstName, student.lastName]
                          .filter(Boolean)
                          .join(" ") ||
                        student.name ||
                        "";

                      return (
                        <option
                          key={student.id || r.id}
                          value={student.id || r.studentId || r.student_id || r.id}
                        >
                          {usn} - {name}
                        </option>
                      );
                    })
                  )}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DYNAMIC MODE SWITCHER */}
      {selectedAssessmentId && (
        isDirectMarksMode ? (
          <DirectMarksEntry
            assessment={currentAssessment}
            courseOffering={currentOffering}
            registrations={sortedRegistrations}
          />
        ) : (
          <>
            {activeTab === "entry" && selectedStudentId && (
              <>
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-header bg-white py-3">
                    <h5 className="fw-bold mb-0">
                      Select Attempted Questions (OR Options)
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Part 1 (20 Marks)</label>
                        <div className="btn-group w-100">
                          <button
                            type="button"
                            className={`btn ${
                              selectedParts.part1 === 1
                                ? "btn-primary"
                                : "btn-outline-primary"
                            }`}
                            onClick={() =>
                              setSelectedParts((p) => ({ ...p, part1: 1 }))
                            }
                          >
                            Question 1
                          </button>
                          <button
                            type="button"
                            className={`btn ${
                              selectedParts.part1 === 2
                                ? "btn-primary"
                                : "btn-outline-primary"
                            }`}
                            onClick={() =>
                              setSelectedParts((p) => ({ ...p, part1: 2 }))
                            }
                          >
                            Question 2
                          </button>
                        </div>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Part 2 (20 Marks)</label>
                        <div className="btn-group w-100">
                          <button
                            type="button"
                            className={`btn ${
                              selectedParts.part2 === 3
                                ? "btn-primary"
                                : "btn-outline-primary"
                            }`}
                            onClick={() =>
                              setSelectedParts((p) => ({ ...p, part2: 3 }))
                            }
                          >
                            Question 3
                          </button>
                          <button
                            type="button"
                            className={`btn ${
                              selectedParts.part2 === 4
                                ? "btn-primary"
                                : "btn-outline-primary"
                            }`}
                            onClick={() =>
                              setSelectedParts((p) => ({ ...p, part2: 4 }))
                            }
                          >
                            Question 4
                          </button>
                        </div>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Part 3 (10 Marks)</label>
                        <div className="btn-group w-100">
                          <button
                            type="button"
                            className={`btn ${
                              selectedParts.part3 === 5
                                ? "btn-primary"
                                : "btn-outline-primary"
                            }`}
                            onClick={() =>
                              setSelectedParts((p) => ({ ...p, part3: 5 }))
                            }
                          >
                            Question 5
                          </button>
                          <button
                            type="button"
                            className={`btn ${
                              selectedParts.part3 === 6
                                ? "btn-primary"
                                : "btn-outline-primary"
                            }`}
                            onClick={() =>
                              setSelectedParts((p) => ({ ...p, part3: 6 }))
                            }
                          >
                            Question 6
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold mb-0">Sub-Questions & Obtained Marks</h5>
                    <span className="badge bg-dark fs-6">
                      Total Obtained: {totalObtained} /{" "}
                      {currentAssessment?.maxMarks || 50}
                    </span>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Question</th>
                            <th>CO Code</th>
                            <th>Description</th>
                            <th className="text-center">Max Marks</th>
                            <th style={{ width: "160px" }}>Obtained Marks</th>
                            <th className="text-center">Absent</th>
                          </tr>
                        </thead>
                        <tbody>
                          {questionsLoading ? (
                            <tr>
                              <td colSpan="6" className="text-center py-4">
                                Loading questions...
                              </td>
                            </tr>
                          ) : visibleQuestions.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="text-center py-4 text-muted">
                                No active questions configured for the selected parts.
                              </td>
                            </tr>
                          ) : (
                            visibleQuestions.map((q) => {
                              const rowState = marksState[q.id] || {};
                              return (
                                <tr key={q.id}>
                                  <td className="fw-bold">{q.questionNumber}</td>
                                  <td>
                                    <span className="badge bg-info text-dark">
                                      {q.courseOutcome?.code || "CO1"}
                                    </span>
                                  </td>
                                  <td className="text-muted small">
                                    {q.description || "-"}
                                  </td>
                                  <td className="text-center fw-semibold">
                                    {q.maxMarks}
                                  </td>
                                  <td>
                                    <input
                                      type="number"
                                      className="form-control"
                                      min="0"
                                      max={q.maxMarks}
                                      disabled={rowState.isAbsent}
                                      value={rowState.marksObtained ?? ""}
                                      onChange={(e) =>
                                        handleMarkChange(
                                          q.id,
                                          e.target.value,
                                          q.maxMarks
                                        )
                                      }
                                    />
                                  </td>
                                  <td className="text-center">
                                    <input
                                      type="checkbox"
                                      className="form-check-input"
                                      checked={Boolean(rowState.isAbsent)}
                                      onChange={(e) =>
                                        handleAbsentToggle(
                                          q.id,
                                          e.target.checked
                                        )
                                      }
                                    />
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="card-footer bg-white text-end py-3">
                    <button
                      type="button"
                      className="btn btn-primary px-4 d-inline-flex align-items-center gap-2"
                      disabled={
                        saveMarksMutation.isPending || visibleQuestions.length === 0
                      }
                      onClick={handleSaveMarks}
                    >
                      <Save />
                      {saveMarksMutation.isPending
                        ? "Saving..."
                        : "Save Student Marks"}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* TAB 2: CONSOLIDATED MARKS LEDGER (Question-Wise) */}
            {activeTab === "all" && (
              <div className="card border-0 shadow-sm printable-area">
                <div className="card-body p-4">
                  <div className="d-none d-print-block text-center border-bottom pb-3 mb-4">
                    <h3 className="fw-bold mb-1">
                      DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING
                    </h3>
                    <h5 className="fw-semibold text-secondary mb-2">
                      Continuous Internal Evaluation (CIE) Marks Statement
                    </h5>
                    <div className="row small mt-3">
                      <div className="col-4 text-start">
                        <strong>Course:</strong> {currentOffering?.course?.code} -{" "}
                        {currentOffering?.course?.name}
                      </div>
                      <div className="col-4 text-center">
                        <strong>Assessment:</strong> {currentAssessment?.name} (Max:{" "}
                        {currentAssessment?.maxMarks})
                      </div>
                      <div className="col-4 text-end">
                        <strong>Section:</strong> {currentOffering?.section || "A"}
                      </div>
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-bordered table-hover align-middle mb-0 text-center">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: "45px" }} rowSpan="3">#</th>
                          <th style={{ width: "135px" }} rowSpan="3" className="text-start">USN</th>
                          <th rowSpan="3" className="text-start">Student Name</th>
                          <th colSpan={sortedAllQuestions.length}>Questions & Associated COs</th>
                          <th rowSpan="3" style={{ width: "80px" }}>Total</th>
                        </tr>
                        <tr>
                          {sortedAllQuestions.map((q) => (
                            <th key={q.id} className="small py-1">
                              {q.courseOutcome?.code || "CO"}
                            </th>
                          ))}
                        </tr>
                        <tr>
                          {sortedAllQuestions.map((q) => (
                            <th key={q.id} className="small text-muted py-1">
                              {q.questionNumber}
                              <br />
                              <span className="badge bg-secondary-subtle text-dark border">
                                [{q.maxMarks}m]
                              </span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {allMarksLoading ? (
                          <tr>
                            <td colSpan={sortedAllQuestions.length + 4} className="py-4 text-muted">
                              Loading marks ledger...
                            </td>
                          </tr>
                        ) : sortedRegistrations.length === 0 ? (
                          <tr>
                            <td colSpan={sortedAllQuestions.length + 4} className="py-4 text-muted">
                              No registered students found.
                            </td>
                          </tr>
                        ) : (
                          sortedRegistrations.map((r, idx) => {
                            const student = r.student || {};
                            const sId = student.id || r.studentId || r.student_id || r.id;
                            let totalObtainedMarks = 0;
                            let hasAttemptedAny = false;

                            return (
                              <tr key={sId || idx}>
                                <td>{idx + 1}</td>
                                <td className="fw-semibold text-start text-nowrap">
                                  {student.usn || student.USN}
                                </td>
                                <td className="text-start text-nowrap">
                                  {student.firstName} {student.lastName}
                                </td>

                                {sortedAllQuestions.map((q) => {
                                  const mark = marksLookup.get(`${sId}_${q.id}`);

                                  if (!mark) {
                                    return (
                                      <td key={q.id} className="text-muted small">
                                        -
                                      </td>
                                    );
                                  }

                                  const isAbs = mark.isAbsent ?? mark.is_absent;
                                  if (isAbs) {
                                    return (
                                      <td key={q.id} className="text-danger fw-bold small">
                                        AB
                                      </td>
                                    );
                                  }

                                  const val = mark.marksObtained ?? mark.marks_obtained;
                                  if (val === undefined || val === null || val === "") {
                                    return (
                                      <td key={q.id} className="text-muted small">
                                        -
                                      </td>
                                    );
                                  }

                                  hasAttemptedAny = true;
                                  totalObtainedMarks += Number(val || 0);

                                  return (
                                    <td key={q.id} className="fw-semibold">
                                      {val}
                                    </td>
                                  );
                                })}

                                <td className="fw-bold bg-light">
                                  {hasAttemptedAny ? totalObtainedMarks : "-"}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="d-none d-print-flex justify-content-between mt-5 pt-5 px-3">
                    <div className="text-center">
                      <div className="border-top border-dark pt-1" style={{ width: "200px" }}>
                        Course Instructor
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="border-top border-dark pt-1" style={{ width: "200px" }}>
                        Module Coordinator
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="border-top border-dark pt-1" style={{ width: "200px" }}>
                        Head of Department (HOD)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )
      )}

      {/* PRINT STYLES */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
          body {
            background: white !important;
            color: black !important;
          }
          aside, nav, .d-print-none {
            display: none !important;
          }
          main {
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            width: 100% !important;
          }
          .printable-area {
            box-shadow: none !important;
            border: none !important;
          }
          .table {
            font-size: 11px;
            border-color: #333 !important;
          }
          .table th, .table td {
            padding: 4px 6px !important;
            border-color: #666 !important;
          }
        }
      `}</style>
    </div>
  );
}

export default MarksEntry;