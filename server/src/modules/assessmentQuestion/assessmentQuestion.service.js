/**
 * ------------------------------------------------------------------
 * Assessment Question Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 * Handles Assessment Question business rules.
 * ------------------------------------------------------------------
 */

import assessmentQuestionRepository from "./assessmentQuestion.repository.js";
import assessmentRepository from "../assessment/assessment.repository.js";
import coRepository from "../co/co.repository.js";

import ApiError from "../../shared/errors/ApiError.js";

class AssessmentQuestionService {
  /**
   * Validate Assessment
   */
  async validateAssessment(assessmentId) {
    const assessment =
      await assessmentRepository.findById(
        assessmentId
      );

    if (!assessment) {
      throw new ApiError(
        404,
        "Assessment not found."
      );
    }

    if (!assessment.status) {
      throw new ApiError(
        400,
        "Assessment is inactive."
      );
    }

    return assessment;
  }

  /**
   * Validate Course Outcome
   */
  async validateCourseOutcome(courseOutcomeId) {
    const courseOutcome =
      await coRepository.findById(
        courseOutcomeId
      );

    if (!courseOutcome) {
      throw new ApiError(
        404,
        "Course Outcome not found."
      );
    }

    if (!courseOutcome.status) {
      throw new ApiError(
        400,
        "Course Outcome is inactive."
      );
    }

    return courseOutcome;
  }

  /**
   * Validate Assessment and CO Course Mapping
   */
  validateCourseMapping(
    assessment,
    courseOutcome
  ) {
    const assessmentCourseId =
      assessment.courseOffering?.courseId;

    if (!assessmentCourseId) {
      throw new ApiError(
        400,
        "Assessment Course Offering information is invalid."
      );
    }

    if (
      assessmentCourseId !==
      courseOutcome.courseId
    ) {
      throw new ApiError(
        400,
        "Course Outcome does not belong to the Assessment Course."
      );
    }
  }

  /**
   * Validate Maximum Marks
   */
  validateMaxMarks(maxMarks) {
    if (
      maxMarks !== undefined &&
      Number(maxMarks) <= 0
    ) {
      throw new ApiError(
        400,
        "Question maximum marks must be greater than 0."
      );
    }
  }

  /**
   * Create Assessment Question
   */
  async createAssessmentQuestion(data) {
    const {
      assessmentId,
      courseOutcomeId,
      questionNumber,
      maxMarks,
    } = data;

    const assessment =
      await this.validateAssessment(
        assessmentId
      );

    const courseOutcome =
      await this.validateCourseOutcome(
        courseOutcomeId
      );

    /**
     * Assessment Course must match CO Course
     */
    this.validateCourseMapping(
      assessment,
      courseOutcome
    );

    /**
     * Validate Question marks
     */
    this.validateMaxMarks(maxMarks);

    /**
     * Prevent duplicate Question Number
     * within the same Assessment
     */
    const existingQuestion =
      await assessmentQuestionRepository
        .findByAssessmentAndQuestionNumber(
          assessmentId,
          questionNumber
        );

    if (existingQuestion) {
      throw new ApiError(
        409,
        "Question number already exists for this Assessment."
      );
    }

    const assessmentQuestion =
      await assessmentQuestionRepository.create(
        data
      );

    return assessmentQuestionRepository.findById(
      assessmentQuestion.id
    );
  }

  /**
   * Get All Assessment Questions
   */
  async getAssessmentQuestions() {
    return assessmentQuestionRepository.findAll();
  }

  /**
   * Get Assessment Question By ID
   */
  async getAssessmentQuestionById(id) {
    const assessmentQuestion =
      await assessmentQuestionRepository.findById(
        id
      );

    if (!assessmentQuestion) {
      throw new ApiError(
        404,
        "Assessment Question not found."
      );
    }

    return assessmentQuestion;
  }

  /**
   * Get Questions By Assessment
   */
  async getQuestionsByAssessment(assessmentId) {
    await this.validateAssessment(assessmentId);

    return assessmentQuestionRepository
      .findByAssessmentId(assessmentId);
  }

  /**
   * Get Questions By Course Outcome
   */
  async getQuestionsByCourseOutcome(
    courseOutcomeId
  ) {
    await this.validateCourseOutcome(
      courseOutcomeId
    );

    return assessmentQuestionRepository
      .findByCourseOutcomeId(courseOutcomeId);
  }

  /**
   * Update Assessment Question
   */
  async updateAssessmentQuestion(id, data) {
    const assessmentQuestion =
      await assessmentQuestionRepository.findById(
        id
      );

    if (!assessmentQuestion) {
      throw new ApiError(
        404,
        "Assessment Question not found."
      );
    }

    const finalAssessmentId =
      data.assessmentId ??
      assessmentQuestion.assessmentId;

    const finalCourseOutcomeId =
      data.courseOutcomeId ??
      assessmentQuestion.courseOutcomeId;

    const finalQuestionNumber =
      data.questionNumber ??
      assessmentQuestion.questionNumber;

    const finalMaxMarks =
      data.maxMarks ??
      assessmentQuestion.maxMarks;

    const assessment =
      await this.validateAssessment(
        finalAssessmentId
      );

    const courseOutcome =
      await this.validateCourseOutcome(
        finalCourseOutcomeId
      );

    /**
     * Validate final Assessment Course
     * and CO Course mapping
     */
    this.validateCourseMapping(
      assessment,
      courseOutcome
    );

    this.validateMaxMarks(finalMaxMarks);

    /**
     * Validate final Assessment and
     * Question Number pair
     */
    const existingQuestion =
      await assessmentQuestionRepository
        .findByAssessmentAndQuestionNumber(
          finalAssessmentId,
          finalQuestionNumber
        );

    if (
      existingQuestion &&
      existingQuestion.id !==
        assessmentQuestion.id
    ) {
      throw new ApiError(
        409,
        "Question number already exists for this Assessment."
      );
    }

    return assessmentQuestionRepository.update(
      id,
      data
    );
  }

  /**
   * Delete Assessment Question
   */
  async deleteAssessmentQuestion(id) {
    const assessmentQuestion =
      await assessmentQuestionRepository.findById(
        id
      );

    if (!assessmentQuestion) {
      throw new ApiError(
        404,
        "Assessment Question not found."
      );
    }

    await assessmentQuestionRepository.delete(id);

    return true;
  }
}

export default new AssessmentQuestionService();