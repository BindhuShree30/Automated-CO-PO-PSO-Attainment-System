import React, { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "react-toastify";
import {
  Save,
  CheckCircle,
  FileEarmarkExcel,
  Upload,
  PencilSquare,
} from "react-bootstrap-icons";
import * as XLSX from "xlsx";
import {
  useDirectMarks,
  useSaveDirectMarks,
} from "../../hooks/useStudentQuestionMarks";

export default function DirectMarksEntry({
  assessment,
  courseOffering,
  registrations = [],
}) {
  // Allow faculty to adjust/enter max marks dynamically
  const [maxMarks, setMaxMarks] = useState(
    Number(assessment?.maxMarks) > 0 ? Number(assessment?.maxMarks) : 100
  );
  const [isEditingMax, setIsEditingMax] = useState(false);

  const [marksData, setMarksData] = useState({});
  const inputRefs = useRef([]);

  // Fetch saved marks
  const { data: savedMarks = [], isLoading } = useDirectMarks(assessment?.id);
  const saveMutation = useSaveDirectMarks();

  // Keep maxMarks in sync when switching assessments
  useEffect(() => {
    if (assessment?.maxMarks !== undefined && assessment?.maxMarks !== null) {
      setMaxMarks(Number(assessment.maxMarks));
    }
  }, [assessment?.id, assessment?.maxMarks]);

  // Load existing direct marks
  useEffect(() => {
    if (savedMarks && savedMarks.length > 0) {
      const stateMap = {};
      savedMarks.forEach((m) => {
        stateMap[m.studentId] = {
          marksObtained: m.isAbsent ? "" : m.marksObtained ?? "",
          isAbsent: Boolean(m.isAbsent),
        };
      });
      setMarksData(stateMap);
    } else {
      setMarksData({});
    }
  }, [savedMarks]);

  const handleMarkChange = (studentId, value) => {
    if (value === "") {
      setMarksData((prev) => ({
        ...prev,
        [studentId]: { ...prev[studentId], marksObtained: "", isAbsent: false },
      }));
      return;
    }
    const num = Number(value);
    if (isNaN(num) || num < 0) return;
    if (num > maxMarks) {
      toast.warning(`Marks cannot exceed maximum marks (${maxMarks})`);
      return;
    }
    setMarksData((prev) => ({
      ...prev,
      [studentId]: { marksObtained: num, isAbsent: false },
    }));
  };

  const handleAbsentToggle = (studentId, isChecked) => {
    setMarksData((prev) => ({
      ...prev,
      [studentId]: {
        marksObtained: isChecked ? 0 : "",
        isAbsent: isChecked,
      },
    }));
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      if (inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  // Support pasting vertical column of marks copied from Excel
  const handlePasteMarks = (e, startIdx) => {
    const pasteData = e.clipboardData.getData("text");
    if (!pasteData) return;
    const lines = pasteData
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length <= 1) return;

    e.preventDefault();
    const updated = { ...marksData };
    lines.forEach((lineVal, offset) => {
      const targetStudent = registrations[startIdx + offset];
      if (!targetStudent) return;
      const sId = targetStudent.student?.id || targetStudent.studentId;
      const isAbs = lineVal.toUpperCase() === "AB";
      const num = Number(lineVal);

      if (isAbs) {
        updated[sId] = { marksObtained: 0, isAbsent: true };
      } else if (!isNaN(num) && num >= 0 && num <= maxMarks) {
        updated[sId] = { marksObtained: num, isAbsent: false };
      }
    });
    setMarksData(updated);
    toast.info(`Pasted marks for ${lines.length} students.`);
  };

  const stats = useMemo(() => {
    let entered = 0;
    let absent = 0;
    registrations.forEach((r) => {
      const sId = r.student?.id || r.studentId;
      const row = marksData[sId];
      if (row?.isAbsent) {
        absent++;
        entered++;
      } else if (row?.marksObtained !== "" && row?.marksObtained !== undefined) {
        entered++;
      }
    });
    return {
      total: registrations.length,
      entered,
      pending: registrations.length - entered,
      absent,
    };
  }, [registrations, marksData]);

  const handleSave = async () => {
    const payload = registrations.map((r) => {
      const sId = r.student?.id || r.studentId;
      const row = marksData[sId] || {};
      return {
        studentId: sId,
        marksObtained: row.isAbsent ? 0 : Number(row.marksObtained || 0),
        isAbsent: Boolean(row.isAbsent),
      };
    });

    try {
      await saveMutation.mutateAsync({
        assessmentId: assessment.id,
        marks: payload,
      });
      toast.success("Marks saved successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save marks.");
    }
  };

  const handleDownloadExcel = () => {
    const data = registrations.map((r) => {
      const s = r.student || {};
      const row = marksData[s.id || r.studentId] || {};
      return {
        USN: s.usn || "",
        "Student Name": `${s.firstName || ""} ${s.lastName || ""}`.trim(),
        [`Marks / ${maxMarks}`]: row.isAbsent ? "AB" : row.marksObtained ?? "",
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Marks");
    XLSX.writeFile(
      wb,
      `${courseOffering?.course?.code || "Course"}_${assessment?.name}_DirectMarks.xlsx`
    );
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: "array" });
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      const studentMap = new Map();
      registrations.forEach((r) => {
        const u = (r.student?.usn || "").trim().toUpperCase();
        if (u) studentMap.set(u, r.student?.id || r.studentId);
      });

      const updated = { ...marksData };
      let count = 0;
      rows.forEach((row) => {
        const usn = String(row.USN || "").trim().toUpperCase();
        const sId = studentMap.get(usn);
        if (!sId) return;

        const valKey = Object.keys(row).find((k) =>
          k.toLowerCase().includes("mark")
        );
        const rawVal = valKey ? row[valKey] : null;
        if (rawVal === undefined || rawVal === null || rawVal === "") return;

        const isAbs = String(rawVal).toUpperCase() === "AB";
        const num = Number(rawVal);
        if (isAbs) {
          updated[sId] = { marksObtained: 0, isAbsent: true };
          count++;
        } else if (!isNaN(num)) {
          updated[sId] = {
            marksObtained: Math.min(Math.max(0, num), maxMarks),
            isAbsent: false,
          };
          count++;
        }
      });
      setMarksData(updated);
      toast.success(
        `Imported marks for ${count} students. Click Save to persist.`
      );
      e.target.value = "";
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="card border-0 shadow-sm mt-3">
      {/* Assessment Header Strip with Editable Max Marks */}
      <div className="card-header bg-white py-3 d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className="badge bg-success-subtle text-success fs-6">
            Direct Marks Entry
          </span>
          <span className="fw-bold fs-5">{assessment?.name}</span>
          <span className="text-muted">| Type: {assessment?.type}</span>

          {/* FACULTY EDITABLE MAX MARKS FIELD */}
          <div className="d-inline-flex align-items-center ms-2 bg-light px-2 py-1 rounded border">
            <span className="small fw-semibold me-2">Max Marks:</span>
            {isEditingMax ? (
              <input
                type="number"
                className="form-control form-control-sm text-center"
                style={{ width: "75px" }}
                value={maxMarks}
                min="1"
                onChange={(e) => setMaxMarks(Number(e.target.value))}
                onBlur={() => setIsEditingMax(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setIsEditingMax(false);
                }}
                autoFocus
              />
            ) : (
              <span
                className="fw-bold text-primary cursor-pointer d-flex align-items-center gap-1"
                onClick={() => setIsEditingMax(true)}
                title="Click to edit Max Marks"
              >
                {maxMarks} <PencilSquare size={13} className="text-muted" />
              </span>
            )}
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          <span className="badge bg-secondary">Total: {stats.total}</span>
          <span className="badge bg-primary">Entered: {stats.entered}</span>
          <span className="badge bg-warning text-dark">
            Pending: {stats.pending}
          </span>
          <span className="badge bg-danger">Absent: {stats.absent}</span>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-success btn-sm d-flex align-items-center gap-1"
            onClick={handleDownloadExcel}
          >
            <FileEarmarkExcel /> Excel Template
          </button>
          <label className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1 mb-0 cursor-pointer">
            <Upload /> Upload Excel
            <input
              type="file"
              accept=".xlsx,.xls"
              hidden
              onChange={handleExcelUpload}
            />
          </label>
          <button
            className="btn btn-primary btn-sm d-flex align-items-center gap-1"
            onClick={handleSave}
            disabled={saveMutation.isPending}
          >
            <Save /> {saveMutation.isPending ? "Saving..." : "Save Marks"}
          </button>
        </div>
      </div>

      {/* Direct Marks Table */}
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0 text-center">
          <thead className="table-light">
            <tr>
              <th style={{ width: "60px" }}>#</th>
              <th className="text-start" style={{ width: "160px" }}>
                USN
              </th>
              <th className="text-start">Student Name</th>
              <th style={{ width: "190px" }}>Obtained Marks / {maxMarks}</th>
              <th style={{ width: "100px" }}>Absent</th>
              <th style={{ width: "120px" }}>Percentage</th>
              <th style={{ width: "120px" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="7" className="py-4 text-muted">
                  Loading direct marks...
                </td>
              </tr>
            ) : registrations.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-4 text-muted">
                  No registered students found.
                </td>
              </tr>
            ) : (
              registrations.map((r, idx) => {
                const s = r.student || {};
                const sId = s.id || r.studentId;
                const row = marksData[sId] || {
                  marksObtained: "",
                  isAbsent: false,
                };
                const marksVal = row.marksObtained;
                const hasValue =
                  marksVal !== "" && marksVal !== undefined && !row.isAbsent;
                const pct = hasValue
                  ? ((Number(marksVal) / maxMarks) * 100).toFixed(1)
                  : "-";

                return (
                  <tr key={sId}>
                    <td>{idx + 1}</td>
                    <td className="text-start fw-semibold">{s.usn || "-"}</td>
                    <td className="text-start">
                      {s.firstName} {s.lastName}
                    </td>
                    <td>
                      <input
                        ref={(el) => (inputRefs.current[idx] = el)}
                        type="number"
                        className="form-control text-center mx-auto"
                        style={{ maxWidth: "120px" }}
                        min="0"
                        max={maxMarks}
                        step="0.5"
                        disabled={row.isAbsent}
                        value={row.isAbsent ? "" : row.marksObtained}
                        placeholder={row.isAbsent ? "ABSENT" : "0"}
                        onChange={(e) => handleMarkChange(sId, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                        onPaste={(e) => handlePasteMarks(e, idx)}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={row.isAbsent}
                        onChange={(e) =>
                          handleAbsentToggle(sId, e.target.checked)
                        }
                      />
                    </td>
                    <td className="fw-semibold">
                      {pct !== "-" ? `${pct}%` : "-"}
                    </td>
                    <td>
                      {row.isAbsent ? (
                        <span className="badge bg-danger">Absent</span>
                      ) : hasValue ? (
                        <span className="badge bg-success-subtle text-success">
                          <CheckCircle className="me-1" /> Entered
                        </span>
                      ) : (
                        <span className="badge bg-secondary-subtle text-secondary">
                          Pending
                        </span>
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
  );
}