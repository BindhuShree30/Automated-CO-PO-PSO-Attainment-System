/**
 * ------------------------------------------------------------------
 * Dashboard Repository
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Handles all database operations required by dashboards.
 * ------------------------------------------------------------------
 */

import { Op } from "sequelize";

import Department from "../../database/models/Department.js";
import Program from "../../database/models/Program.js";
import Faculty from "../../database/models/Faculty.js";
import Student from "../../database/models/Student.js";
import Course from "../../database/models/Course.js";
import CourseOutcome from "../../database/models/CourseOutcome.js";
import ProgramOutcome from "../../database/models/ProgramOutcome.js";
import ProgramSpecificOutcome from "../../database/models/ProgramSpecificOutcome.js";
import Batch from "../../database/models/Batch.js";
import CourseOffering from "../../database/models/CourseOffering.js";

import FacultyAssignment from "../../database/models/FacultyAssignment.js";
import Enrollment from "../../database/models/Enrollment.js";
import CourseRegistration from "../../database/models/CourseRegistration.js";
import Assessment from "../../database/models/Assessment.js";
import COPOMapping from "../../database/models/COPOMapping.js";
import CoPsoMapping from "../../database/models/CoPsoMapping.js";


class DashboardRepository {

  /**
   * ----------------------------------------------------------------
   * HOD DASHBOARD
   * ----------------------------------------------------------------
   */

  async getDashboardCounts() {

    const [
      departments,
      programs,
      faculty,
      students,
      courses,
      courseOutcomes,
      programOutcomes,
      programSpecificOutcomes,
      batches,
      courseOfferings,
    ] = await Promise.all([

      Department.count(),

      Program.count(),

      Faculty.count({
        where: {
          status: true,
        },
      }),

      Student.count(),

      Course.count(),

      CourseOutcome.count({
        where: {
          status: true,
        },
      }),

      ProgramOutcome.count({
        where: {
          status: true,
        },
      }),

      ProgramSpecificOutcome.count({
        where: {
          status: true,
        },
      }),

      Batch.count(),

      CourseOffering.count({
        where: {
          status: true,
        },
      }),
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
      batches,
      courseOfferings,
    };
  }


  /**
   * ----------------------------------------------------------------
   * FACULTY DASHBOARD
   * ----------------------------------------------------------------
   *
   * Faculty-specific dashboard.
   *
   * Flow:
   *
   * Faculty
   *   ↓
   * Faculty Assignment
   *   ↓
   * Course Offering
   *   ↓
   * Course
   *   ↓
   * Course Outcomes
   *
   * Course Offering
   *   ↓
   * Batch
   *   ↓
   * Enrollment
   *   ↓
   * Students
   *
   * ----------------------------------------------------------------
   */

  async getFacultyDashboard(
    facultyEmail
  ) {

    /**
     * --------------------------------------------------------------
     * 1. Find active faculty
     * --------------------------------------------------------------
     */

    const facultyRecord =
      await Faculty.findOne({

        where: {
          email: facultyEmail,
          status: true,
        },

        attributes: [
          "id",
          "firstName",
          "lastName",
          "email",
        ],
      });


    if (!facultyRecord) {

      throw new Error(
        "Faculty account not found or inactive."
      );
    }


    console.log(
      "FACULTY FOUND:",
      facultyRecord.toJSON()
    );


    /**
     * --------------------------------------------------------------
     * 2. Get active course assignments
     * --------------------------------------------------------------
     */

    const assignments =
      await FacultyAssignment.findAll({

        where: {
          facultyId: facultyRecord.id,
          status: true,
        },

        attributes: [
          "courseOfferingId",
        ],

        raw: true,
      });


    console.log(
      "FACULTY ASSIGNMENTS:",
      assignments
    );


    const courseOfferingIds =
      assignments.map(
        (assignment) =>
          assignment.courseOfferingId
      );


    console.log(
      "COURSE OFFERING IDS:",
      courseOfferingIds
    );


    /**
     * --------------------------------------------------------------
     * No assignments
     * --------------------------------------------------------------
     */

    if (!courseOfferingIds.length) {

      console.log(
        "NO ACTIVE FACULTY ASSIGNMENTS FOUND"
      );

      return {
        courses: 0,
        students: 0,
        courseOutcomes: 0,
        assessments: 0,
        coPoMappings: 0,
        coPsoMappings: 0,
      };
    }


    /**
     * --------------------------------------------------------------
     * 3. Get assigned course offerings
     * --------------------------------------------------------------
     */

    const courseOfferings =
      await CourseOffering.findAll({

        where: {
          id: {
            [Op.in]: courseOfferingIds,
          },

          status: true,
        },

        attributes: [
          "id",
          "courseId",
          "batchId",
          "semesterId",
          "section",
        ],

        raw: true,
      });


    console.log(
      "FACULTY COURSE OFFERINGS:",
      courseOfferings
    );


    /**
     * --------------------------------------------------------------
     * 4. Extract course IDs
     * --------------------------------------------------------------
     */

    const courseIds = [
      ...new Set(
        courseOfferings.map(
          (offering) =>
            offering.courseId
        )
      ),
    ];


    console.log(
      "FACULTY COURSE IDS:",
      courseIds
    );


    /**
     * --------------------------------------------------------------
     * 5. Extract batch IDs
     * --------------------------------------------------------------
     */

    const batchIds = [
      ...new Set(
        courseOfferings.map(
          (offering) =>
            offering.batchId
        )
      ),
    ];


    console.log(
      "FACULTY BATCH IDS:",
      batchIds
    );


    /**
     * --------------------------------------------------------------
     * 6. Count assigned courses
     * --------------------------------------------------------------
     */

    const courseCount =
      courseIds.length;


    /**
     * --------------------------------------------------------------
     * 7. Count students
     *
     * IMPORTANT:
     *
     * Students are counted from ENROLLMENTS,
     * not course registrations.
     *
     * This matches the HOD dashboard's
     * actual academic enrollment structure.
     * --------------------------------------------------------------
     */

    const studentRows =
      await Enrollment.findAll({

        where: {
          batchId: {
            [Op.in]: batchIds,
          },

          status: true,
        },

        attributes: [
          "studentId",
        ],

        raw: true,
      });


    const studentIds = [
      ...new Set(
        studentRows.map(
          (row) =>
            row.studentId
        )
      ),
    ];


    const studentCount =
      studentIds.length;


    console.log(
      "FACULTY STUDENT IDS:",
      studentIds
    );


    console.log(
      "FACULTY STUDENT COUNT:",
      studentCount
    );


    /**
     * --------------------------------------------------------------
     * 8. Course Outcomes
     * --------------------------------------------------------------
     */

    const courseOutcomeCount =
      await CourseOutcome.count({

        where: {
          courseId: {
            [Op.in]: courseIds,
          },

          status: true,
        },
      });


    /**
     * --------------------------------------------------------------
     * 9. Assessments
     * --------------------------------------------------------------
     */

    const assessmentCount =
      await Assessment.count({

        where: {
          courseOfferingId: {
            [Op.in]: courseOfferingIds,
          },

          status: true,
        },
      });


    /**
     * --------------------------------------------------------------
     * 10. Get Course Outcome IDs
     * --------------------------------------------------------------
     */

    const courseOutcomeRows =
      await CourseOutcome.findAll({

        where: {
          courseId: {
            [Op.in]: courseIds,
          },

          status: true,
        },

        attributes: [
          "id",
        ],

        raw: true,
      });


    const courseOutcomeIds =
      courseOutcomeRows.map(
        (row) =>
          row.id
      );


    /**
     * --------------------------------------------------------------
     * 11. CO–PO Mapping count
     * --------------------------------------------------------------
     */

    let coPoMappingCount = 0;


    if (courseOutcomeIds.length) {

      coPoMappingCount =
        await COPOMapping.count({

          where: {
            courseOutcomeId: {
              [Op.in]:
                courseOutcomeIds,
            },

            status: true,
          },
        });
    }


    /**
     * --------------------------------------------------------------
     * 12. CO–PSO Mapping count
     * --------------------------------------------------------------
     */

    let coPsoMappingCount = 0;


    if (courseOutcomeIds.length) {

      coPsoMappingCount =
        await CoPsoMapping.count({

          where: {
            courseOutcomeId: {
              [Op.in]:
                courseOutcomeIds,
            },

            status: true,
          },
        });
    }


    /**
     * --------------------------------------------------------------
     * 13. Final dashboard result
     * --------------------------------------------------------------
     */

    const result = {

      courses:
        courseCount,

      students:
        studentCount,

      courseOutcomes:
        courseOutcomeCount,

      assessments:
        assessmentCount,

      coPoMappings:
        coPoMappingCount,

      coPsoMappings:
        coPsoMappingCount,
    };


    console.log(
      "FACULTY DASHBOARD FINAL RESULT:",
      result
    );


    return result;
  }
}


export default new DashboardRepository();