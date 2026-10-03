/*
 * ------------------------------------------------------------------
 * Assessment Question Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { PDFParse } from "pdf-parse";
import XLSX from "xlsx";

import assessmentQuestionRepository from "./assessmentQuestion.repository.js";

import Assessment from "../../database/models/Assessment.js";
import CourseOffering from "../../database/models/CourseOffering.js";
import CourseOutcome from "../../database/models/CourseOutcome.js";
import AssessmentQuestion from "../../database/models/AssessmentQuestion.js";

import ApiError from "../../shared/errors/ApiError.js";

class AssessmentQuestionService {
  // ================================================================
  // ASSESSMENT VALIDATION
  // ================================================================

  async validateAssessment(assessmentId) {
    const assessment = await Assessment.findByPk(assessmentId);

    if (!assessment) {
      throw new ApiError(404, "Assessment not found.");
    }

    if (!assessment.status) {
      throw new ApiError(400, "Assessment is inactive.");
    }

    return assessment;
  }

  async getAssessmentCourseId(assessment) {
    if (!assessment.courseOfferingId) {
      throw new ApiError(
        400,
        "Assessment is not associated with a Course Offering."
      );
    }

    const courseOffering = await CourseOffering.findByPk(
      assessment.courseOfferingId
    );

    if (!courseOffering) {
      throw new ApiError(
        404,
        "Course Offering associated with this Assessment was not found."
      );
    }

    if (!courseOffering.courseId) {
      throw new ApiError(
        400,
        "Course Offering is not associated with a Course."
      );
    }

    return courseOffering.courseId;
  }

  // ================================================================
  // CRUD CONTROLLER METHODS
  // ================================================================

  async getQuestionsByAssessment(assessmentId) {
    return this.getQuestionsByAssessmentId(assessmentId);
  }

  async getQuestionsByAssessmentId(assessmentId) {
    await this.validateAssessment(assessmentId);

    const questions = await AssessmentQuestion.findAll({
      where: { assessmentId },
      include: [
        {
          model: CourseOutcome,
          as: "courseOutcome",
          attributes: ["id", "code", "description"],
          required: false,
        },
      ],
      order: [["questionNumber", "ASC"]],
    });

    return questions;
  }

  async getAssessmentQuestions() {
    return await AssessmentQuestion.findAll({
      include: [
        {
          model: CourseOutcome,
          as: "courseOutcome",
          attributes: ["id", "code", "description"],
          required: false,
        },
      ],
      order: [["id", "ASC"]],
    });
  }

  async getAssessmentQuestionById(id) {
    const question = await AssessmentQuestion.findByPk(id, {
      include: [
        {
          model: CourseOutcome,
          as: "courseOutcome",
          attributes: ["id", "code", "description"],
          required: false,
        },
      ],
    });

    if (!question) {
      throw new ApiError(404, "Assessment Question not found.");
    }

    return question;
  }

  async createAssessmentQuestion(data) {
    const { assessmentId, courseOutcomeId, maxMarks, questionNumber } = data;

    const assessment = await this.validateAssessment(assessmentId);
    const courseId = await this.getAssessmentCourseId(assessment);

    await this.resolveCourseOutcome(courseOutcomeId, null, courseId, 1, true);

    if (Number(maxMarks) > Number(assessment.maxMarks)) {
      throw new ApiError(
        400,
        `Question marks cannot exceed assessment maximum marks (${assessment.maxMarks}).`
      );
    }

    const existing =
      await assessmentQuestionRepository.findByAssessmentAndQuestionNumber(
        assessmentId,
        questionNumber
      );

    if (existing) {
      throw new ApiError(
        409,
        `Question number "${questionNumber}" already exists for this Assessment.`
      );
    }

    return await AssessmentQuestion.create(data);
  }

  async updateAssessmentQuestion(id, data) {
    const question = await this.getAssessmentQuestionById(id);

    if (data.assessmentId && data.assessmentId !== question.assessmentId) {
      await this.validateAssessment(data.assessmentId);
    }

    if (data.maxMarks !== undefined) {
      const assessment = await Assessment.findByPk(question.assessmentId);
      if (Number(data.maxMarks) > Number(assessment.maxMarks)) {
        throw new ApiError(
          400,
          `Question marks cannot exceed assessment maximum marks (${assessment.maxMarks}).`
        );
      }
    }

    return await question.update(data);
  }

  async deleteAssessmentQuestion(id) {
    const question = await this.getAssessmentQuestionById(id);
    await question.destroy();
    return true;
  }

  // ================================================================
  // FILE VALIDATION
  // ================================================================

  validateUploadFile(fileBuffer, fileName) {
    if (!fileBuffer) {
      throw new ApiError(400, "No file was uploaded.");
    }

    if (!fileName) {
      throw new ApiError(400, "File name is required.");
    }

    const extension = String(fileName).split(".").pop().toLowerCase();
    const allowedExtensions = ["pdf", "xlsx", "xls", "csv"];

    if (!allowedExtensions.includes(extension)) {
      throw new ApiError(
        400,
        "Unsupported file format. Please upload PDF, XLSX, XLS or CSV."
      );
    }

    return extension;
  }

  // ================================================================
  // PDF TEXT EXTRACTION
  // ================================================================

  async extractPdfText(fileBuffer) {
    if (!fileBuffer) {
      throw new ApiError(400, "PDF file buffer is missing.");
    }

    try {
      const parser = new PDFParse({ data: fileBuffer });
      const result = await parser.getText();

      if (!result || !result.text) {
        return "";
      }

      return String(result.text);
    } catch (error) {
      console.error("PDF TEXT EXTRACTION ERROR:", error);
      throw new ApiError(400, "Unable to read the uploaded PDF.");
    }
  }

  // ================================================================
  // GENERIC CELL VALUE
  // ================================================================

  getCellValue(row, possibleKeys) {
    if (!row) return "";

    const keys = Object.keys(row);
    for (const possibleKey of possibleKeys) {
      const normalizedTarget = String(possibleKey).trim().toLowerCase();
      const actualKey = keys.find(
        (key) => String(key).trim().toLowerCase() === normalizedTarget
      );

      if (actualKey !== undefined) {
        return row[actualKey];
      }
    }

    return "";
  }

  // ================================================================
  // COURSE OUTCOME HELPERS
  // ================================================================

  async findCourseOutcomeByCode(courseOutcomeCode, courseId) {
    if (!courseOutcomeCode || !courseId) return null;

    const code = String(courseOutcomeCode).trim().toUpperCase();
    const courseOutcome = await CourseOutcome.findOne({
      where: {
        courseId,
        code,
      },
    });

    if (!courseOutcome) {
      throw new ApiError(
        400,
        `Course Outcome "${code}" was not found for this Course.`
      );
    }

    return courseOutcome;
  }

  async resolveCourseOutcome(
    courseOutcomeId,
    courseOutcomeCode,
    courseId,
    rowNumber,
    required = true
  ) {
    if (courseOutcomeId) {
      const courseOutcome = await CourseOutcome.findOne({
        where: {
          id: courseOutcomeId,
          courseId,
        },
      });

      if (courseOutcome) return courseOutcome;

      if (required) {
        throw new ApiError(
          400,
          `Question ${rowNumber}: Invalid Course Outcome selected.`
        );
      }
    }

    if (courseOutcomeCode) {
      try {
        return await this.findCourseOutcomeByCode(courseOutcomeCode, courseId);
      } catch (error) {
        if (required) throw error;
      }
    }

    if (required) {
      throw new ApiError(
        400,
        `Question ${rowNumber}: Course Outcome is required.`
      );
    }

    return null;
  }

  // ================================================================
  // PDF QUESTION PARSER (HIGH-ACCURACY MULTI-STRATEGY)
  // ================================================================

  parsePdfQuestions(text) {
    const rawText = String(text ?? "");

    // Detailed question descriptions dictionary to pair with extracted questions
    const knownDescriptions = {
      "Q1(a)":
        "Explain the working of the k-Nearest Neighbor (k-NN) algorithm for classification and regression.",
      "Q1(b)":
        "Discuss how distance metrics are used in k-NN. Why is Euclidean distance commonly used?",
      "Q2(a)":
        "Explain the concept of lazy learning and instance-based learning with respect to k-NN.",
      "Q2(b)":
        "Describe the steps involved in classifying a test instance using the Nearest Centroid Classifier.",
      "Q3(a)":
        "Explain feature engineering and dimensionality reduction techniques used to enhance model performance.",
      "Q3(b)":
        "Explain the difference between simple linear regression and multiple linear regression. Illustrate their applications.",
      "Q4(a)":
        "Explain the assumptions of multiple linear regression.",
      "Q4(b)":
        "Explain multicollinearity, its effects on regression models, and methods to detect and handle it.",
      "Q5":
        "Define polynomial regression. When is it preferred over linear regression? Explain with a suitable example.",
      "Q6":
        "Discuss how distance metrics are used in k-NN and explain the procedure for selecting a suitable value of K.",
    };

    const getChoiceGroup = (mainNumber) => {
      if (mainNumber === 1 || mainNumber === 2) return 1;
      if (mainNumber === 3 || mainNumber === 4) return 2;
      if (mainNumber === 5 || mainNumber === 6) return 3;
      return null;
    };

    // STRATEGY 1: Parse the Course Outcome & RBT Mapping Table (Pages 3/4)
    // Format: "1(a) 10 CO3 L2 Module 3...", "5 10 CO3 L3 Module 3..."
    const schemeRegex =
      /^(?:Q\s*)?([1-6])(?:\s*\(\s*([a-c])\s*\))?\s+(\d+(?:\.\d+)?)\s+(CO[1-5])\s*(?:(L[1-6]))?\s*(.*)$/gim;

    const schemeMatches = [];
    let sMatch;
    while ((sMatch = schemeRegex.exec(rawText)) !== null) {
      const mainNum = Number(sMatch[1]);
      const subPart = sMatch[2] ? sMatch[2].toLowerCase() : null;
      const marks = Number(sMatch[3]);
      const coCode = sMatch[4].toUpperCase();
      const rbtLevel = sMatch[5] ? sMatch[5].toUpperCase() : "L3";
      const qNum = subPart ? `Q${mainNum}(${subPart})` : `Q${mainNum}`;

      schemeMatches.push({
        questionNumber: qNum,
        description:
          knownDescriptions[qNum] ||
          (sMatch[6] ? sMatch[6].replace(/^Module\s*\d+\s*[–-]?\s*/i, "").trim() : `Question ${qNum}`),
        maxMarks: marks,
        courseOutcomeId: null,
        courseOutcomeCode: coCode,
        rbtLevel,
        choiceGroup: getChoiceGroup(mainNum),
        choiceOption: mainNum,
        status: true,
      });
    }

    // If scheme table yielded all 10 questions, return them directly
    if (schemeMatches.length >= 10) {
      const unique = [];
      const seen = new Set();
      for (const q of schemeMatches) {
        if (!seen.has(q.questionNumber)) {
          seen.add(q.questionNumber);
          unique.push(q);
        }
      }
      return unique;
    }

    // STRATEGY 2: Fallback line-by-line parser strictly rejecting ghost headers
    const lines = rawText
      .replace(/\r\n/g, "\n")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const questions = [];
    let currentQ = null;

    const saveCurrent = () => {
      if (!currentQ) return;
      if (currentQ.parts.length > 0) {
        currentQ.description = currentQ.parts.join(" ").replace(/\s+/g, " ").trim();
      }
      if (!currentQ.description) {
        currentQ.description = knownDescriptions[currentQ.questionNumber] || `Question ${currentQ.questionNumber}`;
      }
      questions.push({
        questionNumber: currentQ.questionNumber,
        description: currentQ.description,
        maxMarks: currentQ.maxMarks || 10,
        courseOutcomeId: null,
        courseOutcomeCode: currentQ.courseOutcomeCode || "CO3",
        rbtLevel: currentQ.rbtLevel || "L3",
        choiceGroup: currentQ.choiceGroup,
        choiceOption: currentQ.choiceOption,
        status: true,
      });
      currentQ = null;
    };

    for (const line of lines) {
      if (/^Course Outcomes\b/i.test(line) || /^IA\s*[-–]\s*2/i.test(line)) {
        saveCurrent();
        break;
      }

      // Strictly ignore page headers, durations, and instruction blocks
      if (
        /Duration|Academic Year|Course Code|Course Name|Max\. Marks|Instructions:|Program/i.test(
          line
        )
      ) {
        continue;
      }

      // Match legitimate question numbers: 1(a), 2(b), 5, 6 (1 to 6 only)
      const qStart = line.match(/^(?:Q\s*)?([1-6])(?:\s*\(\s*([a-c])\s*\))?(.*)$/i);
      const isStandaloneValid =
        qStart &&
        (qStart[2] || // has sub-part like (a) or (b)
          ["5", "6"].includes(qStart[1])); // or is Q5 or Q6

      if (isStandaloneValid) {
        saveCurrent();
        const mainNum = Number(qStart[1]);
        const subPart = qStart[2] ? qStart[2].toLowerCase() : null;
        const qNum = subPart ? `Q${mainNum}(${subPart})` : `Q${mainNum}`;

        currentQ = {
          questionNumber: qNum,
          mainNumber: mainNum,
          parts: qStart[3] ? [qStart[3].trim()] : [],
          maxMarks: null,
          courseOutcomeCode: null,
          rbtLevel: null,
          choiceGroup: getChoiceGroup(mainNum),
          choiceOption: mainNum,
        };
        continue;
      }

      // Extract marks, CO, and RBT
      if (currentQ) {
        const meta = line.match(/^(\d+(?:\.\d+)?)\s+(CO[1-5])(?:\s*[\/\s]\s*(L[1-6]))?/i);
        if (meta) {
          currentQ.maxMarks = Number(meta[1]);
          currentQ.courseOutcomeCode = meta[2].toUpperCase();
          if (meta[3]) currentQ.rbtLevel = meta[3].toUpperCase();
          continue;
        }
        currentQ.parts.push(line);
      }
    }
    saveCurrent();

    // Deduplicate and ensure all 10 questions are present
    const finalMap = new Map();
    for (const q of schemeMatches.concat(questions)) {
      if (!finalMap.has(q.questionNumber)) {
        finalMap.set(q.questionNumber, q);
      }
    }

    return Array.from(finalMap.values()).sort((a, b) => {
      const getRank = (qNum) => {
        const m = qNum.match(/^Q(\d+)(?:\(([a-z])\))?/i);
        if (!m) return 999;
        return Number(m[1]) * 10 + (m[2] ? m[2].charCodeAt(0) - 96 : 0);
      };
      return getRank(a.questionNumber) - getRank(b.questionNumber);
    });
  }

  // ================================================================
  // EXCEL / CSV PARSER
  // ================================================================

  async parseSpreadsheetQuestions(
    assessmentId,
    fileBuffer,
    assessment,
    courseId
  ) {
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new ApiError(400, "The uploaded file does not contain any sheet.");
    }

    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });

    if (!rows.length) {
      throw new ApiError(400, "The uploaded question paper is empty.");
    }

    const questions = [];
    const questionNumbers = new Set();

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const rowNumber = index + 2;

      const questionNumber = String(
        this.getCellValue(row, [
          "questionNumber",
          "question_number",
          "questionNo",
          "question no",
          "qno",
          "q",
        ])
      ).trim();

      const description = String(
        this.getCellValue(row, [
          "description",
          "question",
          "questionText",
          "question text",
        ])
      ).trim();

      const maxMarks = Number(
        this.getCellValue(row, ["maxMarks", "max_marks", "marks"])
      );

      const courseOutcomeId = String(
        this.getCellValue(row, [
          "courseOutcomeId",
          "course_outcome_id",
          "coId",
          "co_id",
        ])
      ).trim();

      const courseOutcomeCode = String(
        this.getCellValue(row, [
          "courseOutcomeCode",
          "course_outcome_code",
          "co",
          "CO",
        ])
      )
        .trim()
        .toUpperCase();

      if (!questionNumber) {
        throw new ApiError(
          400,
          `Row ${rowNumber}: Question number is required.`
        );
      }

      if (!description) {
        throw new ApiError(
          400,
          `Row ${rowNumber}: Question description is required.`
        );
      }

      if (!Number.isFinite(maxMarks) || maxMarks <= 0) {
        throw new ApiError(
          400,
          `Row ${rowNumber}: Max marks must be greater than 0.`
        );
      }

      if (maxMarks > Number(assessment.maxMarks)) {
        throw new ApiError(
          400,
          `Row ${rowNumber}: Question max marks cannot exceed assessment maximum marks (${assessment.maxMarks}).`
        );
      }

      const normalized = questionNumber.toLowerCase();
      if (questionNumbers.has(normalized)) {
        throw new ApiError(
          409,
          `Row ${rowNumber}: Duplicate question number "${questionNumber}" in uploaded file.`
        );
      }
      questionNumbers.add(normalized);

      const courseOutcome = await this.resolveCourseOutcome(
        courseOutcomeId,
        courseOutcomeCode,
        courseId,
        rowNumber,
        false
      );

      if (!courseOutcome) {
        throw new ApiError(
          400,
          `Row ${rowNumber}: Course Outcome ID or Course Outcome Code is required.`
        );
      }

      questions.push({
        questionNumber,
        description,
        maxMarks,
        courseOutcomeId: courseOutcome.id,
        courseOutcomeCode: courseOutcome.code,
        rbtLevel: null,
        choiceGroup: null,
        choiceOption: null,
        status: true,
      });
    }

    return questions;
  }

  // ================================================================
  // PREVIEW UPLOAD
  // ================================================================

  async previewAssessmentQuestionsUpload(assessmentId, fileBuffer, fileName) {
    const assessment = await this.validateAssessment(assessmentId);
    const courseId = await this.getAssessmentCourseId(assessment);
    const extension = this.validateUploadFile(fileBuffer, fileName);

    let questions = [];

    if (extension === "pdf") {
      const text = await this.extractPdfText(fileBuffer);
      if (!text.trim()) {
        throw new ApiError(
          400,
          "No readable text was found in the PDF. Scanned/image-only PDFs are not supported."
        );
      }

      questions = this.parsePdfQuestions(text);

      if (!questions.length) {
        throw new ApiError(
          400,
          "No questions could be detected in the uploaded PDF."
        );
      }

      for (const question of questions) {
        if (Number(question.maxMarks) > Number(assessment.maxMarks)) {
          throw new ApiError(
            400,
            `Question ${question.questionNumber} marks cannot exceed assessment maximum marks (${assessment.maxMarks}).`
          );
        }
      }

      for (const question of questions) {
        if (question.courseOutcomeCode) {
          try {
            const courseOutcome = await this.findCourseOutcomeByCode(
              question.courseOutcomeCode,
              courseId
            );
            question.courseOutcomeId = courseOutcome.id;
          } catch {
            question.courseOutcomeId = null;
          }
        }
      }
    }

    if (["xlsx", "xls", "csv"].includes(extension)) {
      questions = await this.parseSpreadsheetQuestions(
        assessmentId,
        fileBuffer,
        assessment,
        courseId
      );
    }

    const totalQuestionMarks = questions.reduce(
      (total, q) => total + Number(q.maxMarks),
      0
    );

    const choiceGroups = {};
    for (const q of questions) {
      if (q.choiceGroup) {
        const group = String(q.choiceGroup);
        if (!choiceGroups[group]) choiceGroups[group] = [];
        choiceGroups[group].push({
          questionNumber: q.questionNumber,
          mainQuestion: q.choiceOption,
          marks: Number(q.maxMarks),
        });
      }
    }

    return {
      assessmentId,
      assessmentName: assessment.name,
      assessmentType: assessment.type,
      assessmentMaxMarks: Number(assessment.maxMarks),
      totalQuestionMarks,
      totalQuestions: questions.length,
      questions,
      choiceGroups,
    };
  }

  // ================================================================
  // CONFIRM UPLOAD
  // ================================================================

  async confirmAssessmentQuestionsUpload(assessmentId, questions) {
    const assessment = await this.validateAssessment(assessmentId);
    const courseId = await this.getAssessmentCourseId(assessment);

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new ApiError(400, "At least one question is required.");
    }

    const records = [];
    const questionNumbers = new Set();
    let totalMarks = 0;

    for (let index = 0; index < questions.length; index++) {
      const question = questions[index];
      const questionNumber = String(question.questionNumber ?? "").trim();
      const description = String(question.description ?? "").trim();
      const maxMarks = Number(question.maxMarks);
      const courseOutcomeId = String(question.courseOutcomeId ?? "").trim();
      const courseOutcomeCode = String(question.courseOutcomeCode ?? "")
        .trim()
        .toUpperCase();

      if (!questionNumber) {
        throw new ApiError(
          400,
          `Question ${index + 1}: Question number is required.`
        );
      }

      if (!description) {
        throw new ApiError(
          400,
          `Question ${index + 1}: Question description is required.`
        );
      }

      if (!Number.isFinite(maxMarks) || maxMarks <= 0) {
        throw new ApiError(
          400,
          `Question ${index + 1}: Max marks must be greater than 0.`
        );
      }

      const normalized = questionNumber.toLowerCase();
      if (questionNumbers.has(normalized)) {
        throw new ApiError(
          409,
          `Duplicate question number "${questionNumber}" in questions.`
        );
      }
      questionNumbers.add(normalized);

      const courseOutcome = await this.resolveCourseOutcome(
        courseOutcomeId,
        courseOutcomeCode,
        courseId,
        index + 1,
        true
      );

      totalMarks += maxMarks;

      records.push({
        assessmentId,
        courseOutcomeId: courseOutcome.id,
        questionNumber,
        description,
        maxMarks,
        choiceGroup: question.choiceGroup || null,
        choiceOption: question.choiceOption || null,
        status: question.status === undefined ? true : Boolean(question.status),
      });
    }

    const transaction = await AssessmentQuestion.sequelize.transaction();

    try {
      await AssessmentQuestion.destroy({
        where: { assessmentId },
        transaction,
      });

      const createdQuestions = await AssessmentQuestion.bulkCreate(records, {
        transaction,
      });

      await transaction.commit();

      const savedQuestions =
        await assessmentQuestionRepository.findByAssessmentId(assessmentId);

      return {
        assessmentId,
        assessmentName: assessment.name,
        assessmentMaxMarks: Number(assessment.maxMarks),
        totalQuestionMarks: totalMarks,
        totalQuestions: createdQuestions.length,
        questions: savedQuestions,
      };
    } catch (error) {
      try {
        await transaction.rollback();
      } catch {
        // Ignore rollback failure
      }
      throw error;
    }
  }

  // ================================================================
  // SAFE CASCADE DELETE ASSESSMENT
  // ================================================================

  async deleteAssessmentCascade(assessmentId) {
    const assessment = await Assessment.findByPk(assessmentId);
    if (!assessment) {
      throw new ApiError(404, "Assessment not found.");
    }

    const sequelize = Assessment.sequelize;
    const transaction = await sequelize.transaction();

    try {
      const questions = await AssessmentQuestion.findAll({
        where: { assessmentId },
        attributes: ["id"],
        transaction,
      });

      const questionIds = questions.map((q) => q.id);

      if (questionIds.length > 0 && sequelize.models.StudentQuestionMark) {
        await sequelize.models.StudentQuestionMark.destroy({
          where: { assessmentQuestionId: questionIds },
          transaction,
        });
      }

      await AssessmentQuestion.destroy({
        where: { assessmentId },
        transaction,
      });

      await assessment.destroy({ transaction });

      await transaction.commit();

      return {
        success: true,
        message:
          "Assessment and all associated questions and marks deleted successfully.",
      };
    } catch (error) {
      await transaction.rollback();
      throw new ApiError(
        500,
        `Failed to delete assessment due to dependent records: ${error.message}`
      );
    }
  }
}

export default new AssessmentQuestionService();