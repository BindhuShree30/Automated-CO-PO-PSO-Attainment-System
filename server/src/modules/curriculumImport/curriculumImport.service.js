/**
 * ------------------------------------------------------------------
 * Curriculum Import Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Responsibilities:
 *
 * 1. Read uploaded curriculum Excel files
 * 2. Extract semester-wise curriculum rows
 * 3. Normalize and validate imported rows
 * 4. Match imported courses against existing course master
 * 5. Create preview rows for HOD review
 * 6. Allow HOD to edit preview rows during REVIEW
 * 7. Delete curriculum imports and their preview rows
 *
 * Workflow:
 *
 * Upload
 *    ↓
 * Parse Excel
 *    ↓
 * Normalize
 *    ↓
 * Validate
 *    ↓
 * Match Existing Courses
 *    ↓
 * Save Import + Rows
 *    ↓
 * REVIEW
 *    ↓
 * HOD Edit
 *    ↓
 * Revalidate + Rematch
 *
 * Courses are NOT created here.
 * Courses are created only during the future Confirm step.
 *
 * ------------------------------------------------------------------
 */

import ExcelJS from "exceljs";

import sequelize from "../../database/connection.js";

import Curriculum from "../../database/models/Curriculum.js";
import CurriculumImport from "../../database/models/CurriculumImport.js";
import CurriculumImportRow from "../../database/models/CurriculumImportRow.js";
import Course from "../../database/models/Course.js";

import curriculumImportRepository from "./curriculumImport.repository.js";

import ApiError from "../../shared/errors/ApiError.js";

/**
 * ==================================================================
 * IMPORT STATUS
 * ==================================================================
 */

export const IMPORT_STATUS = Object.freeze({
  UPLOADED: "UPLOADED",
  PROCESSING: "PROCESSING",
  EXTRACTED: "EXTRACTED",
  REVIEW: "REVIEW",
  CONFIRMED: "CONFIRMED",
  FAILED: "FAILED",
});

/**
 * ==================================================================
 * ROW STATUS
 * ==================================================================
 */

export const ROW_STATUS = Object.freeze({
  PENDING: "PENDING",
  MATCHED: "MATCHED",
  NEW_COURSE: "NEW_COURSE",
  CODE_NAME_MISMATCH: "CODE_NAME_MISMATCH",
  NAME_MATCH_REVIEW: "NAME_MATCH_REVIEW",
  INVALID: "INVALID",
});

/**
 * ==================================================================
 * HELPERS
 * ==================================================================
 */

/**
 * ------------------------------------------------------------------
 * Normalize text for comparisons
 * ------------------------------------------------------------------
 */

const normalizeText = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
};

/**
 * ------------------------------------------------------------------
 * Normalize course code
 * ------------------------------------------------------------------
 */

const normalizeCourseCode = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
};

/**
 * ------------------------------------------------------------------
 * Normalize Excel header names
 * ------------------------------------------------------------------
 */

const normalizeHeader = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/_/g, "")
    .replace(/-/g, "");
};

/**
 * ------------------------------------------------------------------
 * Convert various Excel cell values to strings/numbers
 * ------------------------------------------------------------------
 */

const getCellValue = (cell) => {
  if (
    cell === null ||
    cell === undefined
  ) {
    return "";
  }

  if (
    typeof cell === "object" &&
    cell !== null
  ) {
    if (
      Object.prototype.hasOwnProperty.call(
        cell,
        "text"
      )
    ) {
      return cell.text;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        cell,
        "result"
      )
    ) {
      return cell.result;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        cell,
        "richText"
      )
    ) {
      return cell.richText
        .map((item) => item.text || "")
        .join("");
    }
  }

  return cell;
};

/**
 * ------------------------------------------------------------------
 * Parse credits safely
 * ------------------------------------------------------------------
 */

const parseCredits = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const numericValue = Number(
    String(value)
      .trim()
      .replace(/,/g, "")
  );

  if (Number.isNaN(numericValue)) {
    return null;
  }

  return numericValue;
};

/**
 * ------------------------------------------------------------------
 * Parse semester safely
 * ------------------------------------------------------------------
 *
 * Handles:
 *
 * 1
 * "1"
 * "Sem 1"
 * "Semester 1"
 * "SEMESTER-1"
 * "Semester: 1"
 * ------------------------------------------------------------------
 */

const parseSemester = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const text = String(value).trim();

  const match = text.match(
    /(?:semester|sem)[\s\-:]*(\d+)/i
  );

  if (match) {
    return Number(match[1]);
  }

  const numeric = Number(text);

  if (!Number.isNaN(numeric)) {
    return numeric;
  }

  return null;
};

/**
 * ------------------------------------------------------------------
 * Parse compulsory flag
 * ------------------------------------------------------------------
 */

const parseBoolean = (
  value,
  defaultValue = true
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  const normalized = normalizeText(value);

  if (
    [
      "true",
      "yes",
      "y",
      "1",
      "compulsory",
      "mandatory",
    ].includes(normalized)
  ) {
    return true;
  }

  if (
    [
      "false",
      "no",
      "n",
      "0",
      "elective",
      "optional",
    ].includes(normalized)
  ) {
    return false;
  }

  return defaultValue;
};

/**
 * ==================================================================
 * HEADER ALIASES
 * ==================================================================
 */

const HEADER_ALIASES = {
  semester: [
    "semester",
    "sem",
    "semesterno",
    "semesternumber",
  ],

  courseCode: [
    "coursecode",
    "code",
    "subjectcode",
    "subjectid",
    "courseid",
  ],

  courseName: [
    "coursename",
    "name",
    "subjectname",
    "subject",
    "title",
  ],

  credits: [
    "credits",
    "credit",
    "creditvalue",
    "creditpoints",
  ],

  courseType: [
    "coursetype",
    "type",
    "category",
  ],

  electiveGroup: [
    "electivegroup",
    "elective",
    "group",
    "electivecategory",
  ],

  compulsory: [
    "iscompulsory",
    "compulsory",
    "mandatory",
    "isrequired",
    "required",
  ],

  sequence: [
    "sequence",
    "sequenceno",
    "seq",
    "serial",
    "sno",
    "slno",
  ],
};

/**
 * ------------------------------------------------------------------
 * Find internal field name from normalized header
 * ------------------------------------------------------------------
 */

const resolveHeader = (normalizedValue) => {
  for (
    const [field, aliases] of Object.entries(
      HEADER_ALIASES
    )
  ) {
    if (
      aliases.includes(normalizedValue)
    ) {
      return field;
    }
  }

  return null;
};

/**
 * ==================================================================
 * PARSE EXCEL
 * ==================================================================
 */

const parseExcel = async (fileBuffer) => {
  if (!fileBuffer) {
    throw new ApiError(
      400,
      "Uploaded Excel file buffer is missing."
    );
  }

  const workbook = new ExcelJS.Workbook();

  try {
    await workbook.xlsx.load(fileBuffer);
  } catch (error) {
    throw new ApiError(
      400,
      `Unable to read Excel file: ${error.message}`
    );
  }

  if (
    !workbook.worksheets ||
    workbook.worksheets.length === 0
  ) {
    throw new ApiError(
      400,
      "Excel file does not contain any worksheet."
    );
  }

  const extractedRows = [];

  /**
   * --------------------------------------------------------------
   * Process every worksheet
   * --------------------------------------------------------------
   */

  for (
    let worksheetIndex = 0;
    worksheetIndex <
    workbook.worksheets.length;
    worksheetIndex += 1
  ) {
    const worksheet =
      workbook.worksheets[worksheetIndex];

    if (!worksheet) {
      continue;
    }

    /**
     * ------------------------------------------------------------
     * Find first meaningful row.
     * This becomes the header row.
     * ------------------------------------------------------------
     */

    let headerRow = null;
    let headerRowNumber = null;

    for (
      let rowNumber = 1;
      rowNumber <= worksheet.rowCount;
      rowNumber += 1
    ) {
      const row =
        worksheet.getRow(rowNumber);

      const values = row.values || [];

      const hasValue = values.some(
        (value) =>
          value !== null &&
          value !== undefined &&
          String(value).trim() !== ""
      );

      if (hasValue) {
        headerRow = row;
        headerRowNumber = rowNumber;
        break;
      }
    }

    if (!headerRow) {
      continue;
    }

    /**
     * ------------------------------------------------------------
     * Build header map
     * ------------------------------------------------------------
     */

    const headerMap = {};

    headerRow.eachCell(
      {
        includeEmpty: false,
      },
      (cell, columnNumber) => {
        const rawHeader =
          getCellValue(cell.value);

        const normalized =
          normalizeHeader(rawHeader);

        const field =
          resolveHeader(normalized);

        if (field) {
          headerMap[field] = columnNumber;
        }
      }
    );

    /**
     * ------------------------------------------------------------
     * Course name is mandatory
     * ------------------------------------------------------------
     */

    if (!headerMap.courseName) {
      throw new ApiError(
        400,
        `Worksheet "${worksheet.name}" does not contain a Course Name column.`
      );
    }

    /**
     * ------------------------------------------------------------
     * Semester is mandatory
     * ------------------------------------------------------------
     */

    if (!headerMap.semester) {
      throw new ApiError(
        400,
        `Worksheet "${worksheet.name}" does not contain a Semester column.`
      );
    }

    /**
     * ------------------------------------------------------------
     * Read rows after header
     * ------------------------------------------------------------
     */

    for (
      let rowNumber = headerRowNumber + 1;
      rowNumber <= worksheet.rowCount;
      rowNumber += 1
    ) {
      const row =
        worksheet.getRow(rowNumber);

      const getMappedValue = (field) => {
        const columnNumber =
          headerMap[field];

        if (!columnNumber) {
          return "";
        }

        const cell =
          row.getCell(columnNumber);

        return getCellValue(cell.value);
      };

      const rawCourseName =
        getMappedValue("courseName");

      const rawSemester =
        getMappedValue("semester");

      const rawCourseCode =
        getMappedValue("courseCode");

      const rawCredits =
        getMappedValue("credits");

      const rawCourseType =
        getMappedValue("courseType");

      const rawElectiveGroup =
        getMappedValue("electiveGroup");

      const rawCompulsory =
        getMappedValue("compulsory");

      const rawSequence =
        getMappedValue("sequence");

      const entireRowIsEmpty = [
        rawCourseName,
        rawSemester,
        rawCourseCode,
        rawCredits,
        rawCourseType,
        rawElectiveGroup,
        rawCompulsory,
        rawSequence,
      ].every(
        (value) =>
          value === null ||
          value === undefined ||
          String(value).trim() === ""
      );

      if (entireRowIsEmpty) {
        continue;
      }

      let sequenceNo = Number(
        rawSequence
      );

      if (
        Number.isNaN(sequenceNo) ||
        sequenceNo <= 0
      ) {
        sequenceNo = null;
      }

      extractedRows.push({
        sourceRowNumber: rowNumber,

        worksheetName:
          worksheet.name,

        semesterNumber:
          parseSemester(rawSemester),

        courseCode:
          normalizeCourseCode(
            rawCourseCode
          ) || null,

        courseName:
          String(
            rawCourseName || ""
          ).trim(),

        credits:
          parseCredits(rawCredits),

        courseType:
          rawCourseType
            ? String(
                rawCourseType
              ).trim()
            : null,

        electiveGroup:
          rawElectiveGroup
            ? String(
                rawElectiveGroup
              ).trim()
            : null,

        isCompulsory:
          parseBoolean(
            rawCompulsory,
            true
          ),

        sequenceNo,
      });
    }
  }

  if (extractedRows.length === 0) {
    throw new ApiError(
      400,
      "No curriculum data rows were found in the Excel file."
    );
  }

  return extractedRows;
};

/**
 * ==================================================================
 * COURSE MATCHING
 * ==================================================================
 *
 * Matching policy:
 *
 * 1. Exact course code + exact course name
 *      → MATCHED
 *
 * 2. Exact course code but different course name
 *      → CODE_NAME_MISMATCH
 *
 * 3. No code match, exact course name + same semester
 *      → NAME_MATCH_REVIEW
 *
 * 4. Otherwise
 *      → NEW_COURSE
 *
 * Important:
 *
 * We NEVER automatically match only by course name
 * when the semester is different.
 *
 * ------------------------------------------------------------------
 */

const matchExistingCourse = async (row) => {
  const courseCode =
    normalizeCourseCode(
      row.courseCode
    );

  const courseName =
    normalizeText(
      row.courseName
    );

  /**
   * --------------------------------------------------------------
   * 1. Exact Course Code
   * --------------------------------------------------------------
   */

  if (courseCode) {
    const courseByCode =
      await Course.findOne({
        where: {
          code: courseCode,
        },
      });

    if (courseByCode) {
      const existingName =
        normalizeText(
          courseByCode.name
        );

      /**
       * Exact code + exact name
       */

      if (
        existingName === courseName
      ) {
        return {
          matchedCourseId:
            courseByCode.id,

          rowStatus:
            ROW_STATUS.MATCHED,

          validationMessage: null,
        };
      }

      /**
       * Exact code but different name
       */

      return {
        matchedCourseId: null,

        rowStatus:
          ROW_STATUS.CODE_NAME_MISMATCH,

        validationMessage:
          `Course code ${courseCode} already exists as "${courseByCode.name}", but the imported course name is "${row.courseName}". HOD review required.`,
      };
    }
  }

  /**
   * --------------------------------------------------------------
   * 2. Exact Course Name + Same Semester
   * --------------------------------------------------------------
   */

  if (courseName) {
    const coursesByName =
      await Course.findAll({
        where: {
          status: true,
        },
      });

    const sameName =
      coursesByName.filter(
        (course) =>
          normalizeText(
            course.name
          ) === courseName
      );

    if (sameName.length > 0) {
      const sameSemester =
        sameName.find(
          (course) =>
            Number(
              course.semester
            ) ===
            Number(
              row.semesterNumber
            )
        );

      if (sameSemester) {
        return {
          matchedCourseId:
            sameSemester.id,

          rowStatus:
            ROW_STATUS.NAME_MATCH_REVIEW,

          validationMessage:
            `Existing course "${sameSemester.name}" matches by name and semester. HOD review required before linking.`,
        };
      }

      return {
        matchedCourseId: null,

        rowStatus:
          ROW_STATUS.NEW_COURSE,

        validationMessage:
          "A course with the same name exists, but its semester differs. A new curriculum course link requires HOD review.",
      };
    }
  }

  /**
   * --------------------------------------------------------------
   * 3. No Match
   * --------------------------------------------------------------
   */

  return {
    matchedCourseId: null,

    rowStatus:
      ROW_STATUS.NEW_COURSE,

    validationMessage:
      "No existing course matched. HOD review required.",
  };
};

/**
 * ==================================================================
 * NORMALIZE CURRICULUM ROW
 * ==================================================================
 */

const normalizeCurriculumRow = async (row) => {
  const normalized = {
    sourceRowNumber:
      row.sourceRowNumber,

    semesterNumber:
      row.semesterNumber,

    courseCode:
      row.courseCode,

    courseName:
      row.courseName,

    credits:
      row.credits,

    courseType:
      row.courseType,

    electiveGroup:
      row.electiveGroup,

    isCompulsory:
      row.isCompulsory,

    sequenceNo:
      row.sequenceNo,
  };

  /**
   * ------------------------------------------------------------
   * Validate semester
   * ------------------------------------------------------------
   */

  if (
    !normalized.semesterNumber ||
    !Number.isInteger(
      Number(
        normalized.semesterNumber
      )
    ) ||
    Number(
      normalized.semesterNumber
    ) < 1 ||
    Number(
      normalized.semesterNumber
    ) > 8
  ) {
    return {
      ...normalized,

      semesterNumber:
        normalized.semesterNumber ||
        null,

      matchedCourseId: null,

      rowStatus:
        ROW_STATUS.INVALID,

      validationMessage:
        "Semester must be a number from 1 to 8.",
    };
  }

  /**
   * ------------------------------------------------------------
   * Validate course name
   * ------------------------------------------------------------
   */

  if (
    !normalized.courseName ||
    normalizeText(
      normalized.courseName
    ) === ""
  ) {
    return {
      ...normalized,

      matchedCourseId: null,

      rowStatus:
        ROW_STATUS.INVALID,

      validationMessage:
        "Course name is required.",
    };
  }

  /**
   * ------------------------------------------------------------
   * Validate course code
   * ------------------------------------------------------------
   */

  if (
    normalized.courseCode &&
    normalized.courseCode.length > 20
  ) {
    return {
      ...normalized,

      matchedCourseId: null,

      rowStatus:
        ROW_STATUS.INVALID,

      validationMessage:
        "Course code cannot exceed 20 characters.",
    };
  }

  /**
   * ------------------------------------------------------------
   * Validate credits
   * ------------------------------------------------------------
   */

  if (
    normalized.credits !== null &&
    Number(normalized.credits) < 0
  ) {
    return {
      ...normalized,

      matchedCourseId: null,

      rowStatus:
        ROW_STATUS.INVALID,

      validationMessage:
        "Credits cannot be negative.",
    };
  }

  /**
   * ------------------------------------------------------------
   * Find safe existing match
   * ------------------------------------------------------------
   */

  const match =
    await matchExistingCourse(
      normalized
    );

  return {
    ...normalized,

    semesterNumber:
      Number(
        normalized.semesterNumber
      ),

    credits:
      normalized.credits !== null &&
      normalized.credits !== undefined
        ? Number(
            normalized.credits
          )
        : null,

    sequenceNo:
      normalized.sequenceNo || 1,

    matchedCourseId:
      match.matchedCourseId,

    rowStatus:
      match.rowStatus,

    validationMessage:
      match.validationMessage,
  };
};

/**
 * ==================================================================
 * CREATE IMPORT PREVIEW
 * ==================================================================
 */

const createImportPreview = async ({
  curriculumId,
  uploadedBy,
  file,
}) => {
  /**
   * --------------------------------------------------------------
   * Validate uploaded file
   * --------------------------------------------------------------
   */

  if (!file) {
    throw new ApiError(
      400,
      "Curriculum Excel file is required."
    );
  }

  if (!file.buffer) {
    throw new ApiError(
      400,
      "Uploaded curriculum file could not be read."
    );
  }

  /**
   * --------------------------------------------------------------
   * Validate curriculum
   * --------------------------------------------------------------
   */

  const curriculum =
    await Curriculum.findOne({
      where: {
        id: curriculumId,
        status: true,
      },
    });

  if (!curriculum) {
    throw new ApiError(
      404,
      "Curriculum not found or inactive."
    );
  }

  /**
   * --------------------------------------------------------------
   * Start transaction
   * --------------------------------------------------------------
   */

  const transaction =
    await sequelize.transaction();

  let importRecord = null;

  try {
    /**
     * ------------------------------------------------------------
     * Create import record
     * ------------------------------------------------------------
     */

    importRecord =
      await curriculumImportRepository.createImport(
        {
          curriculumId,

          fileName:
            file.originalname,

          filePath:
            file.path ||
            file.filePath ||
            `pending/${file.originalname}`,

          fileType:
            file.originalname
              .split(".")
              .pop()
              .toLowerCase(),

          extractionStatus:
            IMPORT_STATUS.PROCESSING,

          uploadedBy,
        },
        {
          transaction,
        }
      );

    /**
     * ------------------------------------------------------------
     * Parse Excel
     * ------------------------------------------------------------
     */

    const rawRows =
      await parseExcel(
        file.buffer
      );

    /**
     * ------------------------------------------------------------
     * Normalize all rows
     * ------------------------------------------------------------
     */

    const normalizedRows = [];

    for (
      const rawRow of rawRows
    ) {
      const normalizedRow =
        await normalizeCurriculumRow(
          rawRow
        );

      normalizedRows.push(
        normalizedRow
      );
    }

    /**
     * ------------------------------------------------------------
     * Save extracted rows
     * ------------------------------------------------------------
     */

    const rowsToCreate =
      normalizedRows.map(
        (row) => ({
          importId:
            importRecord.id,

          sourceRowNumber:
            row.sourceRowNumber,

          semesterNumber:
            row.semesterNumber,

          courseCode:
            row.courseCode,

          courseName:
            row.courseName,

          credits:
            row.credits,

          courseType:
            row.courseType,

          electiveGroup:
            row.electiveGroup,

          isCompulsory:
            row.isCompulsory,

          sequenceNo:
            row.sequenceNo,

          matchedCourseId:
            row.matchedCourseId,

          rowStatus:
            row.rowStatus,

          validationMessage:
            row.validationMessage,
        })
      );

    await curriculumImportRepository.bulkCreateImportRows(
      rowsToCreate,
      {
        transaction,
      }
    );

    /**
     * ------------------------------------------------------------
     * Change PROCESSING → REVIEW
     * ------------------------------------------------------------
     */

    await importRecord.update(
      {
        extractionStatus:
          IMPORT_STATUS.REVIEW,

        errorMessage: null,
      },
      {
        transaction,
      }
    );

    /**
     * ------------------------------------------------------------
     * Commit transaction
     * ------------------------------------------------------------
     */

    await transaction.commit();

    /**
     * ------------------------------------------------------------
     * Re-fetch after commit
     * ------------------------------------------------------------
     */

    const finalImport =
      await curriculumImportRepository.findImportById(
        importRecord.id
      );

    if (!finalImport) {
      throw new ApiError(
        500,
        "Curriculum import was created but could not be fetched after processing."
      );
    }

    return finalImport;
  } catch (error) {
    /**
     * ------------------------------------------------------------
     * Rollback
     * ------------------------------------------------------------
     */

    try {
      await transaction.rollback();
    } catch {
      // Ignore rollback failure.
    }

    /**
     * ------------------------------------------------------------
     * Best-effort FAILED status
     * ------------------------------------------------------------
     */

    if (importRecord?.id) {
      try {
        await curriculumImportRepository.updateImport(
          importRecord.id,
          {
            extractionStatus:
              IMPORT_STATUS.FAILED,

            errorMessage:
              error.message,
          }
        );
      } catch {
        // Ignore secondary status update failure.
      }
    }

    if (
      error instanceof ApiError
    ) {
      throw error;
    }

    throw new ApiError(
      500,
      error.message ||
        "Failed to process curriculum Excel file."
    );
  }
};

/**
 * ==================================================================
 * GET IMPORT BY ID
 * ==================================================================
 */

const getImportById = async (
  importId
) => {
  const importRecord =
    await curriculumImportRepository.findImportById(
      importId
    );

  if (!importRecord) {
    throw new ApiError(
      404,
      "Curriculum import not found."
    );
  }

  return importRecord;
};

/**
 * ==================================================================
 * GET IMPORTS BY CURRICULUM
 * ==================================================================
 */

const getImportsByCurriculumId =
  async (curriculumId) => {
    return curriculumImportRepository.findImportsByCurriculumId(
      curriculumId
    );
  };

/**
 * ==================================================================
 * GET IMPORT ROWS
 * ==================================================================
 */

const getImportRows = async (
  importId
) => {
  const importRecord =
    await curriculumImportRepository.findImportById(
      importId
    );

  if (!importRecord) {
    throw new ApiError(
      404,
      "Curriculum import not found."
    );
  }

  return curriculumImportRepository.findImportRows(
    importId
  );
};

/**
 * ==================================================================
 * EDIT IMPORT ROW
 * ==================================================================
 *
 * Allows HOD to correct imported curriculum information while
 * the import is in REVIEW status.
 *
 * Editable fields:
 *
 * - semesterNumber
 * - courseCode
 * - courseName
 * - credits
 * - courseType
 * - electiveGroup
 * - isCompulsory
 * - sequenceNo
 *
 * After editing:
 *
 * 1. Values are merged with the existing row
 * 2. Values are normalized
 * 3. Values are validated
 * 4. Existing course matching is performed again
 * 5. Row status is recalculated
 * 6. Validation message is updated
 *
 * ==================================================================
 */

const editImportRow = async (
  importId,
  rowId,
  data
) => {
  /**
   * --------------------------------------------------------------
   * Verify import
   * --------------------------------------------------------------
   */

  const importRecord =
    await curriculumImportRepository.findImportById(
      importId
    );

  if (!importRecord) {
    throw new ApiError(
      404,
      "Curriculum import not found."
    );
  }

  /**
   * --------------------------------------------------------------
   * Only REVIEW imports can be edited
   * --------------------------------------------------------------
   */

  if (
    importRecord.extractionStatus !==
    IMPORT_STATUS.REVIEW
  ) {
    throw new ApiError(
      400,
      `Curriculum import cannot be edited while its status is "${importRecord.extractionStatus}".`
    );
  }

  /**
   * --------------------------------------------------------------
   * Find import row
   * --------------------------------------------------------------
   */

  const existingRow =
    await curriculumImportRepository.findImportRowById(
      rowId
    );

  if (!existingRow) {
    throw new ApiError(
      404,
      "Curriculum import row not found."
    );
  }

  /**
   * --------------------------------------------------------------
   * Verify row belongs to import
   * --------------------------------------------------------------
   */

  if (
    String(existingRow.importId) !==
    String(importId)
  ) {
    throw new ApiError(
      400,
      "Curriculum import row does not belong to this import."
    );
  }

  /**
   * --------------------------------------------------------------
   * Merge existing values with updated values
   * --------------------------------------------------------------
   */

  const mergedRow = {
    sourceRowNumber:
      existingRow.sourceRowNumber,

    semesterNumber:
      data.semesterNumber !==
      undefined
        ? data.semesterNumber
        : existingRow.semesterNumber,

    courseCode:
      data.courseCode !==
      undefined
        ? data.courseCode
        : existingRow.courseCode,

    courseName:
      data.courseName !==
      undefined
        ? data.courseName
        : existingRow.courseName,

    credits:
      data.credits !==
      undefined
        ? data.credits
        : existingRow.credits,

    courseType:
      data.courseType !==
      undefined
        ? data.courseType
        : existingRow.courseType,

    electiveGroup:
      data.electiveGroup !==
      undefined
        ? data.electiveGroup
        : existingRow.electiveGroup,

    isCompulsory:
      data.isCompulsory !==
      undefined
        ? data.isCompulsory
        : existingRow.isCompulsory,

    sequenceNo:
      data.sequenceNo !==
      undefined
        ? data.sequenceNo
        : existingRow.sequenceNo,
  };

  /**
   * --------------------------------------------------------------
   * Normalize + validate + re-match
   * --------------------------------------------------------------
   */

  const normalizedRow =
    await normalizeCurriculumRow(
      mergedRow
    );

  /**
   * --------------------------------------------------------------
   * Update database row
   * --------------------------------------------------------------
   */

  const updatedRow =
    await curriculumImportRepository.updateImportRow(
      rowId,
      {
        semesterNumber:
          normalizedRow.semesterNumber,

        courseCode:
          normalizedRow.courseCode,

        courseName:
          normalizedRow.courseName,

        credits:
          normalizedRow.credits,

        courseType:
          normalizedRow.courseType,

        electiveGroup:
          normalizedRow.electiveGroup,

        isCompulsory:
          normalizedRow.isCompulsory,

        sequenceNo:
          normalizedRow.sequenceNo,

        matchedCourseId:
          normalizedRow.matchedCourseId,

        rowStatus:
          normalizedRow.rowStatus,

        validationMessage:
          normalizedRow.validationMessage,
      }
    );

  return updatedRow;
};

/**
 * ==================================================================
 * DELETE IMPORT
 * ==================================================================
 *
 * Deletes:
 *
 * 1. All curriculum import preview rows
 * 2. The curriculum import record
 *
 * Courses are NOT deleted.
 * Curriculum records are NOT deleted.
 *
 * HOD-only authorization is handled by the route.
 *
 * ==================================================================
 */

const deleteImport = async (
  importId
) => {
  /**
   * --------------------------------------------------------------
   * Find import
   * --------------------------------------------------------------
   */

  const importRecord =
    await CurriculumImport.findByPk(
      importId
    );

  if (!importRecord) {
    throw new ApiError(
      404,
      "Curriculum import not found."
    );
  }

  /**
   * --------------------------------------------------------------
   * Start transaction
   * --------------------------------------------------------------
   */

  const transaction =
    await sequelize.transaction();

  try {
    /**
     * ------------------------------------------------------------
     * Delete all imported preview rows first
     * ------------------------------------------------------------
     *
     * CurriculumImportRow uses:
     *
     * importId
     *
     * as the foreign key to CurriculumImport.
     * ------------------------------------------------------------
     */

    await CurriculumImportRow.destroy({
      where: {
        importId,
      },
      transaction,
    });

    /**
     * ------------------------------------------------------------
     * Delete the curriculum import itself
     * ------------------------------------------------------------
     */

    await CurriculumImport.destroy({
      where: {
        id: importId,
      },
      transaction,
    });

    /**
     * ------------------------------------------------------------
     * Commit
     * ------------------------------------------------------------
     */

    await transaction.commit();

    return true;
  } catch (error) {
    /**
     * ------------------------------------------------------------
     * Rollback
     * ------------------------------------------------------------
     */

    try {
      await transaction.rollback();
    } catch {
      // Ignore rollback failure.
    }

    if (
      error instanceof ApiError
    ) {
      throw error;
    }

    throw new ApiError(
      500,
      error.message ||
        "Failed to delete curriculum import."
    );
  }
};

/**
 * ==================================================================
 * DEFAULT EXPORT
 * ==================================================================
 */

export default {
  createImportPreview,
  getImportById,
  getImportsByCurriculumId,
  getImportRows,
  editImportRow,
  deleteImport,
};

/**
 * ==================================================================
 * NAMED EXPORTS
 * ==================================================================
 */

export {
  parseExcel,
  normalizeCurriculumRow,
  matchExistingCourse,
  normalizeText,
  normalizeCourseCode,
  createImportPreview,
  getImportById,
  getImportsByCurriculumId,
  getImportRows,
  editImportRow,
  deleteImport,
};

/**
 * ==================================================================
 * COMPATIBILITY ALIASES
 * ==================================================================
 *
 * These aliases allow controllers using the names:
 *
 * - findImportById
 * - findImportsByCurriculumId
 * - findImportRows
 *
 * to continue working.
 *
 * ==================================================================
 */

export const findImportById =
  getImportById;

export const findImportsByCurriculumId =
  getImportsByCurriculumId;

export const findImportRows =
  getImportRows;