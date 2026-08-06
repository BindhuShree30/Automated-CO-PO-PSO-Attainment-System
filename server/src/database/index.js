/**
 * ------------------------------------------------------------------
 * Database Index
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import sequelize from "./connection.js";

// Import ALL models
import User from "./models/User.js";
import Department from "./models/Department.js";
import Program from "./models/Program.js";
import Course from "./models/Course.js";
import Faculty from "./models/Faculty.js";
import Student from "./models/Student.js";
import CourseOutcome from "./models/CourseOutcome.js";
import AcademicYear from "./models/AcademicYear.js";
import Batch from "./models/Batch.js";
import Semester from "./models/Semester.js";
import CourseOffering from "./models/CourseOffering.js";
import Assessment from "./models/Assessment.js";
import AssessmentQuestion from "./models/AssessmentQuestion.js";
import COAttainment from "./models/COAttainment.js";
import ProgramOutcome from "./models/ProgramOutcome.js";
import StudentQuestionMark from "./models/StudentQuestionMark.js";
import Enrollment from "./models/Enrollment.js";
import CourseRegistration from "./models/CourseRegistration.js";
import COPOMapping from "./models/COPOMapping.js";
import POAttainment from "./models/POAttainment.js";
import ProgramSpecificOutcome from "./models/ProgramSpecificOutcome.js";
import CoPsoMapping from "./models/CoPsoMapping.js";
/**
 * ------------------------------------------------------------------
 * Program and Batch Associations
 * ------------------------------------------------------------------
 */

Program.hasMany(Batch, {
  foreignKey: "programId",
  as: "batches",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

Batch.belongsTo(Program, {
  foreignKey: "programId",
  as: "program",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * ------------------------------------------------------------------
 * Student Associations
 * ------------------------------------------------------------------
 */

Program.hasMany(Student, {
  foreignKey: "programId",
  as: "students",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

Student.belongsTo(Program, {
  foreignKey: "programId",
  as: "program",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * ------------------------------------------------------------------
 * Course Outcome Associations
 * ------------------------------------------------------------------
 */

Course.hasMany(CourseOutcome, {
  foreignKey: "courseId",
  as: "courseOutcomes",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

CourseOutcome.belongsTo(Course, {
  foreignKey: "courseId",
  as: "course",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * ------------------------------------------------------------------
 * Semester Associations
 * ------------------------------------------------------------------
 */

Batch.hasMany(Semester, {
  foreignKey: "batchId",
  as: "semesters",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

Semester.belongsTo(Batch, {
  foreignKey: "batchId",
  as: "batch",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

AcademicYear.hasMany(Semester, {
  foreignKey: "academicYearId",
  as: "semesters",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

Semester.belongsTo(AcademicYear, {
  foreignKey: "academicYearId",
  as: "academicYear",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * ------------------------------------------------------------------
 * Course Offering Associations
 * ------------------------------------------------------------------
 */

Course.hasMany(CourseOffering, {
  foreignKey: "courseId",
  as: "courseOfferings",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

CourseOffering.belongsTo(Course, {
  foreignKey: "courseId",
  as: "course",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

Batch.hasMany(CourseOffering, {
  foreignKey: "batchId",
  as: "courseOfferings",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

CourseOffering.belongsTo(Batch, {
  foreignKey: "batchId",
  as: "batch",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

Semester.hasMany(CourseOffering, {
  foreignKey: "semesterId",
  as: "courseOfferings",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

CourseOffering.belongsTo(Semester, {
  foreignKey: "semesterId",
  as: "semester",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

Faculty.hasMany(CourseOffering, {
  foreignKey: "facultyId",
  as: "courseOfferings",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

CourseOffering.belongsTo(Faculty, {
  foreignKey: "facultyId",
  as: "faculty",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * ------------------------------------------------------------------
 * Assessment Associations
 * ------------------------------------------------------------------
 */

CourseOffering.hasMany(Assessment, {
  foreignKey: "courseOfferingId",
  as: "assessments",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

Assessment.belongsTo(CourseOffering, {
  foreignKey: "courseOfferingId",
  as: "courseOffering",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * ------------------------------------------------------------------
 * Assessment Question Associations
 * ------------------------------------------------------------------
 */

Assessment.hasMany(AssessmentQuestion, {
  foreignKey: "assessmentId",
  as: "questions",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

AssessmentQuestion.belongsTo(Assessment, {
  foreignKey: "assessmentId",
  as: "assessment",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

CourseOutcome.hasMany(AssessmentQuestion, {
  foreignKey: "courseOutcomeId",
  as: "assessmentQuestions",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

AssessmentQuestion.belongsTo(CourseOutcome, {
  foreignKey: "courseOutcomeId",
  as: "courseOutcome",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});
/**
 * ------------------------------------------------------------------
 * CO Attainment Associations
 * ------------------------------------------------------------------
 */

// Course Offering → CO Attainments
CourseOffering.hasMany(COAttainment, {
  foreignKey: "courseOfferingId",
  as: "coAttainments",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

// CO Attainment → Course Offering
COAttainment.belongsTo(CourseOffering, {
  foreignKey: "courseOfferingId",
  as: "courseOffering",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

// Course Outcome → CO Attainments
CourseOutcome.hasMany(COAttainment, {
  foreignKey: "courseOutcomeId",
  as: "coAttainments",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

// CO Attainment → Course Outcome
COAttainment.belongsTo(CourseOutcome, {
  foreignKey: "courseOutcomeId",
  as: "courseOutcome",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});
Program.hasMany(ProgramOutcome, {
  foreignKey: "programId",
  as: "programOutcomes",
});

ProgramOutcome.belongsTo(Program, {
  foreignKey: "programId",
  as: "program",
});

/**
 * ------------------------------------------------------------------
 * CO-PO Mapping Associations
 * ------------------------------------------------------------------
 */

CourseOutcome.hasMany(COPOMapping, {
  foreignKey: "courseOutcomeId",
  as: "poMappings",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

COPOMapping.belongsTo(CourseOutcome, {
  foreignKey: "courseOutcomeId",
  as: "courseOutcome",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

ProgramOutcome.hasMany(COPOMapping, {
  foreignKey: "programOutcomeId",
  as: "coMappings",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

COPOMapping.belongsTo(ProgramOutcome, {
  foreignKey: "programOutcomeId",
  as: "programOutcome",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

CourseOffering.hasMany(POAttainment, {
  foreignKey: "courseOfferingId",
  as: "poAttainments",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

POAttainment.belongsTo(CourseOffering, {
  foreignKey: "courseOfferingId",
  as: "courseOffering",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

ProgramOutcome.hasMany(POAttainment, {
  foreignKey: "programOutcomeId",
  as: "poAttainments",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

POAttainment.belongsTo(ProgramOutcome, {
  foreignKey: "programOutcomeId",
  as: "programOutcome",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});
// ==============================
// CO - PSO Mapping Associations
// ==============================

CourseOutcome.hasMany(CoPsoMapping, {
  foreignKey: "courseOutcomeId",
  as: "coPsoMappings",
});

CoPsoMapping.belongsTo(CourseOutcome, {
  foreignKey: "courseOutcomeId",
  as: "courseOutcome",
});

ProgramSpecificOutcome.hasMany(CoPsoMapping, {
  foreignKey: "programSpecificOutcomeId",
  as: "coPsoMappings",
});

CoPsoMapping.belongsTo(ProgramSpecificOutcome, {
  foreignKey: "programSpecificOutcomeId",
  as: "programSpecificOutcome",
});

/**
 * 
 * ------------------------------------------------------------------
 * Student Question Mark Associations
 * ------------------------------------------------------------------
 */

// Student → Student Question Marks
Student.hasMany(StudentQuestionMark, {
  foreignKey: "studentId",
  as: "questionMarks",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

// Student Question Mark → Student
StudentQuestionMark.belongsTo(Student, {
  foreignKey: "studentId",
  as: "student",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

// Assessment Question → Student Question Marks
AssessmentQuestion.hasMany(StudentQuestionMark, {
  foreignKey: "assessmentQuestionId",
  as: "studentMarks",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

// Student Question Mark → Assessment Question
StudentQuestionMark.belongsTo(AssessmentQuestion, {
  foreignKey: "assessmentQuestionId",
  as: "assessmentQuestion",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});
/**
 * ------------------------------------------------------------------
 * Enrollment Associations
 * ------------------------------------------------------------------
 */

Student.hasMany(Enrollment, {
  foreignKey: "studentId",
  as: "enrollments",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

Enrollment.belongsTo(Student, {
  foreignKey: "studentId",
  as: "student",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

Batch.hasMany(Enrollment, {
  foreignKey: "batchId",
  as: "enrollments",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

Enrollment.belongsTo(Batch, {
  foreignKey: "batchId",
  as: "batch",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * ------------------------------------------------------------------
 * Course Registration Associations
 * ------------------------------------------------------------------
 */

Student.hasMany(CourseRegistration, {
  foreignKey: "studentId",
  as: "courseRegistrations",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

CourseRegistration.belongsTo(Student, {
  foreignKey: "studentId",
  as: "student",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

CourseOffering.hasMany(CourseRegistration, {
  foreignKey: "courseOfferingId",
  as: "courseRegistrations",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

CourseRegistration.belongsTo(CourseOffering, {
  foreignKey: "courseOfferingId",
  as: "courseOffering",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});
/**
 * ------------------------------------------------------------------
 * Program Specific Outcome Associations
 * ------------------------------------------------------------------
 */

Program.hasMany(ProgramSpecificOutcome, {
  foreignKey: "programId",
  as: "programSpecificOutcomes",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

ProgramSpecificOutcome.belongsTo(Program, {
  foreignKey: "programId",
  as: "program",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});
/**
 * ------------------------------------------------------------------
 * Program ↔ Course Associations
 * ------------------------------------------------------------------
 */

Program.hasMany(Course, {
  foreignKey: "programId",
  as: "courses",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

Course.belongsTo(Program, {
  foreignKey: "programId",
  as: "program",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});
/**
 * ------------------------------------------------------------------
 * Database Connection
 * ------------------------------------------------------------------
 */

const connectDatabase = async () => {
  try {
    await sequelize.authenticate();

    console.log("✅ Database connected successfully.");

    /**
     * TEMPORARY FOR DEVELOPMENT
     *
     * Replace sequelize.sync() with Sequelize migrations
     * before production deployment.
     */
    await sequelize.sync();

    console.log("✅ Database synchronized successfully.");
  } catch (error) {
    console.error("❌ Failed to connect to database.");
    console.error(error);

    process.exit(1);
  }
};

/**
 * ------------------------------------------------------------------
 * Exports
 * ------------------------------------------------------------------
 */

export {
  sequelize,
  User,
  Department,
  Program,
  Course,
  Faculty,
  Student,
  CourseOutcome,
  AcademicYear,
  Batch,
  Semester,
  CourseOffering,
  Assessment,
  AssessmentQuestion,
  COAttainment,
  ProgramOutcome,
  COPOMapping,
  StudentQuestionMark,
  Enrollment,
  CourseRegistration,
  POAttainment,
  ProgramSpecificOutcome,
  CoPsoMapping,
  connectDatabase,
};