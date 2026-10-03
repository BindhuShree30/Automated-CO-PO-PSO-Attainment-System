/**
 * ------------------------------------------------------------------
 * Database Index
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Central Sequelize model registry and association configuration.
 *
 * Architecture:
 *
 * Program
 *   └── Batch
 *         └── Semester
 *
 * Department
 *   ├── Course
 *   ├── Faculty
 *   └── Student
 *
 * Course
 *   └── Course Outcome
 *
 * Course Offering
 *   ├── Course
 *   ├── Batch
 *   ├── Semester
 *   └── Faculty
 *
 * Course Offering
 *   ├── Assessments
 *   ├── CO Attainments
 *   ├── PO Attainments
 *   └── Course Registrations
 *
 * ------------------------------------------------------------------
 */

import sequelize from "./connection.js";

/**
 * ------------------------------------------------------------------
 * Import ALL Models
 * ------------------------------------------------------------------
 */

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
import FacultyAssignment from "./models/FacultyAssignment.js";
import Syllabus from "./models/Syllabus.js";
import Assessment from "./models/Assessment.js";
import AssessmentQuestion from "./models/AssessmentQuestion.js";
import StudentQuestionMark from "./models/StudentQuestionMark.js";
import StudentAssessmentMark from "./models/StudentAssessmentMark.js";
import COAttainment from "./models/COAttainment.js";
import ProgramOutcome from "./models/ProgramOutcome.js";
import COPOMapping from "./models/COPOMapping.js";
import POAttainment from "./models/POAttainment.js";
import ProgramSpecificOutcome from "./models/ProgramSpecificOutcome.js";
import CoPsoMapping from "./models/CoPsoMapping.js";
import Enrollment from "./models/Enrollment.js";
import CourseRegistration from "./models/CourseRegistration.js";
import IndustryDomain from "./models/IndustryDomain.js";
import IndustrySkill from "./models/IndustrySkill.js";
import SkillSource from "./models/SkillSource.js";

import Curriculum from "./models/Curriculum.js";
import CurriculumImport from "./models/CurriculumImport.js";
import CurriculumImportRow from "./models/CurriculumImportRow.js";

/**
 * ==================================================================
 * PROGRAM AND BATCH ASSOCIATIONS
 * ==================================================================
 */

/**
 * Program → Batches
 */
Program.hasMany(Batch, {
  foreignKey: "programId",
  as: "batches",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * Batch → Program
 */
Batch.belongsTo(Program, {
  foreignKey: "programId",
  as: "program",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * ==================================================================
 * DEPARTMENT AND STUDENT ASSOCIATIONS
 * ==================================================================
 */

/**
 * Department → Students
 */
Department.hasMany(Student, {
  foreignKey: "departmentId",
  as: "students",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

/**
 * Student → Department
 */
Student.belongsTo(Department, {
  foreignKey: "departmentId",
  as: "department",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

/**
 * ==================================================================
 * STUDENT → SEMESTER ASSOCIATIONS
 * ==================================================================
 */

/**
 * Semester → Students
 */
Semester.hasMany(Student, {
  foreignKey: "semesterId",
  as: "students",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * Student → Semester
 */
Student.belongsTo(Semester, {
  foreignKey: "semesterId",
  as: "semester",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * ==================================================================
 * CURRICULUM ASSOCIATIONS
 * ==================================================================
 */

/**
 * Program → Curriculums
 */
Program.hasMany(Curriculum, {
  foreignKey: "programId",
  as: "curriculums",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * Curriculum → Program
 */
Curriculum.belongsTo(Program, {
  foreignKey: "programId",
  as: "program",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * Batch → Curriculum
 */
Batch.belongsTo(Curriculum, {
  foreignKey: "curriculumId",
  as: "curriculum",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * Curriculum → Batches
 */
Curriculum.hasMany(Batch, {
  foreignKey: "curriculumId",
  as: "batches",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * Curriculum → Curriculum Imports
 */
Curriculum.hasMany(CurriculumImport, {
  foreignKey: "curriculumId",
  as: "imports",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

/**
 * Curriculum Import → Curriculum
 */
CurriculumImport.belongsTo(Curriculum, {
  foreignKey: "curriculumId",
  as: "curriculum",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

/**
 * Curriculum Import → Uploaded By User
 */
CurriculumImport.belongsTo(User, {
  foreignKey: "uploadedBy",
  as: "uploadedByUser",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * User → Curriculum Imports
 */
User.hasMany(CurriculumImport, {
  foreignKey: "uploadedBy",
  as: "curriculumImports",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * Curriculum Import → Import Rows
 */
CurriculumImport.hasMany(CurriculumImportRow, {
  foreignKey: "importId",
  as: "rows",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

/**
 * Import Row → Curriculum Import
 */
CurriculumImportRow.belongsTo(CurriculumImport, {
  foreignKey: "importId",
  as: "import",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

/**
 * Course → Curriculum Import Rows
 */
Course.hasMany(CurriculumImportRow, {
  foreignKey: "matchedCourseId",
  as: "curriculumImportRows",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

/**
 * Import Row → Matched Course
 */
CurriculumImportRow.belongsTo(Course, {
  foreignKey: "matchedCourseId",
  as: "matchedCourse",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

/**
 * ==================================================================
 * COURSE OUTCOME ASSOCIATIONS
 * ==================================================================
 */

/**
 * Course → Course Outcomes
 */
Course.hasMany(CourseOutcome, {
  foreignKey: "courseId",
  as: "courseOutcomes",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * Course Outcome → Course
 */
CourseOutcome.belongsTo(Course, {
  foreignKey: "courseId",
  as: "course",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * ==================================================================
 * BATCH → SEMESTER ASSOCIATIONS
 * ==================================================================
 */

/**
 * Batch → Semesters
 */
Batch.hasMany(Semester, {
  foreignKey: "batchId",
  as: "semesters",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * Semester → Batch
 */
Semester.belongsTo(Batch, {
  foreignKey: "batchId",
  as: "batch",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * ==================================================================
 * ACADEMIC YEAR → SEMESTER ASSOCIATIONS
 * ==================================================================
 */

/**
 * Academic Year → Semesters
 */
AcademicYear.hasMany(Semester, {
  foreignKey: "academicYearId",
  as: "semesters",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * Semester → Academic Year
 */
Semester.belongsTo(AcademicYear, {
  foreignKey: "academicYearId",
  as: "academicYear",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * ==================================================================
 * COURSE OFFERING ASSOCIATIONS
 * ==================================================================
 */

/**
 * Course → Course Offerings
 */
Course.hasMany(CourseOffering, {
  foreignKey: "courseId",
  as: "courseOfferings",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * Course Offering → Course
 */
CourseOffering.belongsTo(Course, {
  foreignKey: "courseId",
  as: "course",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * ------------------------------------------------------------------
 * SYLLABUS ASSOCIATIONS
 * ------------------------------------------------------------------
 */

/**
 * Course Offering → Syllabi
 */
CourseOffering.hasMany(Syllabus, {
  foreignKey: "courseOfferingId",
  as: "syllabi",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * Syllabus → Course Offering
 */
Syllabus.belongsTo(CourseOffering, {
  foreignKey: "courseOfferingId",
  as: "courseOffering",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * ------------------------------------------------------------------
 * Batch → Course Offerings
 * ------------------------------------------------------------------
 */

/**
 * Batch → Course Offerings
 */
Batch.hasMany(CourseOffering, {
  foreignKey: "batchId",
  as: "courseOfferings",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * Course Offering → Batch
 */
CourseOffering.belongsTo(Batch, {
  foreignKey: "batchId",
  as: "batch",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * ------------------------------------------------------------------
 * Semester → Course Offerings
 * ------------------------------------------------------------------
 */

/**
 * Semester → Course Offerings
 */
Semester.hasMany(CourseOffering, {
  foreignKey: "semesterId",
  as: "courseOfferings",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * Course Offering → Semester
 */
CourseOffering.belongsTo(Semester, {
  foreignKey: "semesterId",
  as: "semester",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * ------------------------------------------------------------------
 * FACULTY ASSIGNMENT ASSOCIATIONS
 * ------------------------------------------------------------------
 */

/**
 * Faculty → Faculty Assignments
 */
Faculty.hasMany(FacultyAssignment, {
  foreignKey: "facultyId",
  as: "facultyAssignments",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * Faculty Assignment → Faculty
 */
FacultyAssignment.belongsTo(Faculty, {
  foreignKey: "facultyId",
  as: "faculty",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * Course Offering → Faculty Assignments
 */
CourseOffering.hasMany(FacultyAssignment, {
  foreignKey: "courseOfferingId",
  as: "facultyAssignments",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * Faculty Assignment → Course Offering
 */
FacultyAssignment.belongsTo(CourseOffering, {
  foreignKey: "courseOfferingId",
  as: "courseOffering",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * ==================================================================
 * ASSESSMENT ASSOCIATIONS
 * ==================================================================
 */

/**
 * Course Offering → Assessments
 */
CourseOffering.hasMany(Assessment, {
  foreignKey: "courseOfferingId",
  as: "assessments",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * Assessment → Course Offering
 */
Assessment.belongsTo(CourseOffering, {
  foreignKey: "courseOfferingId",
  as: "courseOffering",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * ==================================================================
 * ASSESSMENT QUESTION ASSOCIATIONS (Question-Wise Mode: CIE/IA)
 * ==================================================================
 */

/**
 * Assessment → Questions
 */
Assessment.hasMany(AssessmentQuestion, {
  foreignKey: "assessmentId",
  as: "questions",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * Assessment Question → Assessment
 */
AssessmentQuestion.belongsTo(Assessment, {
  foreignKey: "assessmentId",
  as: "assessment",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * Course Outcome → Assessment Questions
 */
CourseOutcome.hasMany(AssessmentQuestion, {
  foreignKey: "courseOutcomeId",
  as: "assessmentQuestions",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * Assessment Question → Course Outcome
 */
AssessmentQuestion.belongsTo(CourseOutcome, {
  foreignKey: "courseOutcomeId",
  as: "courseOutcome",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * ==================================================================
 * STUDENT ASSESSMENT MARKS ASSOCIATIONS (Direct Marks: Quiz, SEE, etc.)
 * ==================================================================
 */

/**
 * Assessment → Direct Marks
 */
Assessment.hasMany(StudentAssessmentMark, {
  foreignKey: "assessmentId",
  as: "directMarks",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

/**
 * Direct Mark → Assessment
 */
StudentAssessmentMark.belongsTo(Assessment, {
  foreignKey: "assessmentId",
  as: "assessment",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

/**
 * Student → Direct Marks
 */
Student.hasMany(StudentAssessmentMark, {
  foreignKey: "studentId",
  as: "directMarks",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

/**
 * Direct Mark → Student
 */
StudentAssessmentMark.belongsTo(Student, {
  foreignKey: "studentId",
  as: "student",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

/**
 * ==================================================================
 * CO ATTAINMENT ASSOCIATIONS
 * ==================================================================
 */

/**
 * Course Offering → CO Attainments
 */
CourseOffering.hasMany(COAttainment, {
  foreignKey: "courseOfferingId",
  as: "coAttainments",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * CO Attainment → Course Offering
 */
COAttainment.belongsTo(CourseOffering, {
  foreignKey: "courseOfferingId",
  as: "courseOffering",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * Course Outcome → CO Attainments
 */
CourseOutcome.hasMany(COAttainment, {
  foreignKey: "courseOutcomeId",
  as: "coAttainments",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * CO Attainment → Course Outcome
 */
COAttainment.belongsTo(CourseOutcome, {
  foreignKey: "courseOutcomeId",
  as: "courseOutcome",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * ==================================================================
 * PROGRAM OUTCOME ASSOCIATIONS
 * ==================================================================
 */

/**
 * Program → Program Outcomes
 */
Program.hasMany(ProgramOutcome, {
  foreignKey: "programId",
  as: "programOutcomes",
});

/**
 * Program Outcome → Program
 */
ProgramOutcome.belongsTo(Program, {
  foreignKey: "programId",
  as: "program",
});

/**
 * ==================================================================
 * CO–PO MAPPING ASSOCIATIONS
 * ==================================================================
 */

/**
 * Course Outcome → CO-PO Mappings
 */
CourseOutcome.hasMany(COPOMapping, {
  foreignKey: "courseOutcomeId",
  as: "poMappings",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * CO-PO Mapping → Course Outcome
 */
COPOMapping.belongsTo(CourseOutcome, {
  foreignKey: "courseOutcomeId",
  as: "courseOutcome",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * Program Outcome → CO-PO Mappings
 */
ProgramOutcome.hasMany(COPOMapping, {
  foreignKey: "programOutcomeId",
  as: "coMappings",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * CO-PO Mapping → Program Outcome
 */
COPOMapping.belongsTo(ProgramOutcome, {
  foreignKey: "programOutcomeId",
  as: "programOutcome",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * ==================================================================
 * PO ATTAINMENT ASSOCIATIONS
 * ==================================================================
 */

/**
 * Course Offering → PO Attainments
 */
CourseOffering.hasMany(POAttainment, {
  foreignKey: "courseOfferingId",
  as: "poAttainments",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * PO Attainment → Course Offering
 */
POAttainment.belongsTo(CourseOffering, {
  foreignKey: "courseOfferingId",
  as: "courseOffering",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * Program Outcome → PO Attainments
 */
ProgramOutcome.hasMany(POAttainment, {
  foreignKey: "programOutcomeId",
  as: "poAttainments",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * PO Attainment → Program Outcome
 */
POAttainment.belongsTo(ProgramOutcome, {
  foreignKey: "programOutcomeId",
  as: "programOutcome",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * ==================================================================
 * CO–PSO MAPPING ASSOCIATIONS
 * ==================================================================
 */

/**
 * Course Outcome → CO-PSO Mappings
 */
CourseOutcome.hasMany(CoPsoMapping, {
  foreignKey: "courseOutcomeId",
  as: "coPsoMappings",
});

/**
 * CO-PSO Mapping → Course Outcome
 */
CoPsoMapping.belongsTo(CourseOutcome, {
  foreignKey: "courseOutcomeId",
  as: "courseOutcome",
});

/**
 * Program Specific Outcome → CO-PSO Mappings
 */
ProgramSpecificOutcome.hasMany(CoPsoMapping, {
  foreignKey: "programSpecificOutcomeId",
  as: "coPsoMappings",
});

/**
 * CO-PSO Mapping → Program Specific Outcome
 */
CoPsoMapping.belongsTo(ProgramSpecificOutcome, {
  foreignKey: "programSpecificOutcomeId",
  as: "programSpecificOutcome",
});

/**
 * ==================================================================
 * STUDENT QUESTION MARK ASSOCIATIONS (Question-Wise Mode)
 * ==================================================================
 */

/**
 * Student → Question Marks
 */
Student.hasMany(StudentQuestionMark, {
  foreignKey: "studentId",
  as: "questionMarks",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * Student Question Mark → Student
 */
StudentQuestionMark.belongsTo(Student, {
  foreignKey: "studentId",
  as: "student",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * Assessment Question → Student Question Marks
 */
AssessmentQuestion.hasMany(StudentQuestionMark, {
  foreignKey: "assessmentQuestionId",
  as: "studentMarks",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * Student Question Mark → Assessment Question
 */
StudentQuestionMark.belongsTo(AssessmentQuestion, {
  foreignKey: "assessmentQuestionId",
  as: "assessmentQuestion",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * ==================================================================
 * ENROLLMENT ASSOCIATIONS
 * ==================================================================
 */

/**
 * Student → Enrollments
 */
Student.hasMany(Enrollment, {
  foreignKey: "studentId",
  as: "enrollments",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * Enrollment → Student
 */
Enrollment.belongsTo(Student, {
  foreignKey: "studentId",
  as: "student",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * Batch → Enrollments
 */
Batch.hasMany(Enrollment, {
  foreignKey: "batchId",
  as: "enrollments",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * Enrollment → Batch
 */
Enrollment.belongsTo(Batch, {
  foreignKey: "batchId",
  as: "batch",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * ==================================================================
 * COURSE REGISTRATION ASSOCIATIONS
 * ==================================================================
 */

/**
 * Student → Course Registrations
 */
Student.hasMany(CourseRegistration, {
  foreignKey: "studentId",
  as: "courseRegistrations",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * Course Registration → Student
 */
CourseRegistration.belongsTo(Student, {
  foreignKey: "studentId",
  as: "student",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * Course Offering → Course Registrations
 */
CourseOffering.hasMany(CourseRegistration, {
  foreignKey: "courseOfferingId",
  as: "courseRegistrations",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * Course Registration → Course Offering
 */
CourseRegistration.belongsTo(CourseOffering, {
  foreignKey: "courseOfferingId",
  as: "courseOffering",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * ------------------------------------------------------------------
 * Faculty → Course Offerings
 * ------------------------------------------------------------------
 */

/**
 * Faculty → Course Offerings
 */
Faculty.hasMany(CourseOffering, {
  foreignKey: "facultyId",
  as: "courseOfferings",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * Course Offering → Faculty
 */
CourseOffering.belongsTo(Faculty, {
  foreignKey: "facultyId",
  as: "faculty",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * ==================================================================
 * PROGRAM SPECIFIC OUTCOME ASSOCIATIONS
 * ==================================================================
 */

/**
 * Program → Program Specific Outcomes
 */
Program.hasMany(ProgramSpecificOutcome, {
  foreignKey: "programId",
  as: "programSpecificOutcomes",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * Program Specific Outcome → Program
 */
ProgramSpecificOutcome.belongsTo(Program, {
  foreignKey: "programId",
  as: "program",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * ==================================================================
 * PROGRAM ↔ COURSE ASSOCIATIONS
 * ==================================================================
 */

/**
 * Program → Courses
 */
Program.hasMany(Course, {
  foreignKey: "programId",
  as: "courses",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * Course → Program
 */
Course.belongsTo(Program, {
  foreignKey: "programId",
  as: "program",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * ==================================================================
 * DEPARTMENT ↔ COURSE ASSOCIATIONS
 * ==================================================================
 */

/**
 * Department → Courses
 */
Department.hasMany(Course, {
  foreignKey: "departmentId",
  as: "courses",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * Course → Department
 */
Course.belongsTo(Department, {
  foreignKey: "departmentId",
  as: "department",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * ==================================================================
 * INDUSTRY INTELLIGENCE ASSOCIATIONS
 * ==================================================================
 */

/**
 * Industry Domain → Industry Skills
 */
IndustryDomain.hasMany(IndustrySkill, {
  foreignKey: "domainId",
  as: "industrySkills",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * Industry Skill → Industry Domain
 */
IndustrySkill.belongsTo(IndustryDomain, {
  foreignKey: "domainId",
  as: "industryDomain",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

/**
 * Industry Skill → Skill Sources
 */
IndustrySkill.hasMany(SkillSource, {
  foreignKey: "industrySkillId",
  as: "sources",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

/**
 * Skill Source → Industry Skill
 */
SkillSource.belongsTo(IndustrySkill, {
  foreignKey: "industrySkillId",
  as: "industrySkill",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

/**
 * ==================================================================
 * DATABASE CONNECTION
 * ==================================================================
 */

const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully.");

    await sequelize.sync();
    console.log("✅ Database synchronized successfully.");
  } catch (error) {
    console.error("❌ Failed to connect to database.");
    console.error(error);
    process.exit(1);
  }
};

/**
 * ==================================================================
 * EXPORTS
 * ==================================================================
 */

export {
  sequelize,

  User,
  Department,
  Program,
  Course,
  Faculty,
  Student,

  FacultyAssignment,
  Syllabus,
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
  StudentAssessmentMark,

  Enrollment,
  CourseRegistration,

  POAttainment,

  ProgramSpecificOutcome,
  CoPsoMapping,

  IndustryDomain,
  IndustrySkill,
  SkillSource,

  Curriculum,
  CurriculumImport,
  CurriculumImportRow,

  connectDatabase,
};