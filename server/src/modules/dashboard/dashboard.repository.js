import {
  Department,
  Program,
  Faculty,
  Student,
  Course,
  CourseOutcome,
  ProgramOutcome,
  ProgramSpecificOutcome,
  CourseOffering,
  Assessment,
  Enrollment,
  COAttainment,
} from "../../database/index.js";

class DashboardRepository {
  async getAdminDashboard() {
    const [
      departments,
      programs,
      faculty,
      students,
      courses,
      courseOutcomes,
      programOutcomes,
      programSpecificOutcomes,
    ] = await Promise.all([
      Department.count(),
      Program.count(),
      Faculty.count(),
      Student.count(),
      Course.count(),
      CourseOutcome.count(),
      ProgramOutcome.count(),
      ProgramSpecificOutcome.count(),
    ]);

    return {
      departments,
      programs,
      faculty,
      students,
      courses,
      courseOutcomes,
      programOutcomes,
      programSpecificOutcomes,
    };
  }

  async getFacultyDashboard(facultyId) {
    const [
      totalCourseOfferings,
      totalAssessments,
      totalEnrollments,
      totalCOAttainments,
    ] = await Promise.all([
      // Course Offerings
      CourseOffering.count({
        where: { facultyId },
      }),

      // Assessments
      Assessment.count({
        include: [
          {
            model: CourseOffering,
            as: "courseOffering",
            where: { facultyId },
            attributes: [],
            required: true,
          },
        ],
      }),

      // Total Enrollments (No association with CourseOffering)
      Enrollment.count(),

      // CO Attainments
      COAttainment.count({
        include: [
          {
            model: CourseOffering,
            as: "courseOffering",
            where: { facultyId },
            attributes: [],
            required: true,
          },
        ],
      }),
    ]);

    return {
      totalCourseOfferings,
      totalAssessments,
      totalEnrollments,
      totalCOAttainments,
    };
  }
}

export default new DashboardRepository();