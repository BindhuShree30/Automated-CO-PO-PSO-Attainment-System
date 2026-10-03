/**
 * ------------------------------------------------------------------
 * Course Registration Repository
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Handles Course Registration database operations.
 *
 * IMPORTANT:
 * CourseRegistration belongs to a CourseOffering.
 *
 * Faculty ownership is determined through:
 *
 *     course_registrations.course_offering_id
 *                    ↓
 *             course_offerings.id
 *                    ↓
 *             course_offerings.faculty_id
 *                    ↓
 *                faculties.id
 *
 * The faculty ID used here must always be faculties.id.
 *
 * ------------------------------------------------------------------
 */

import CourseRegistration from "../../database/models/CourseRegistration.js";
import Student from "../../database/models/Student.js";
import CourseOffering from "../../database/models/CourseOffering.js";
import Course from "../../database/models/Course.js";
import Batch from "../../database/models/Batch.js";
import Semester from "../../database/models/Semester.js";
import AcademicYear from "../../database/models/AcademicYear.js";
import Faculty from "../../database/models/Faculty.js";

/**
 * ------------------------------------------------------------------
 * Common Course Registration Associations
 * ------------------------------------------------------------------
 */

const courseRegistrationIncludes = [
    {
        model: Student,
        as: "student",
        attributes: [
            "id",
            "usn",
            "firstName",
            "lastName",
            "email",
            "phone",
        
        
        ],
    },

    {
        model: CourseOffering,
        as: "courseOffering",
        attributes: [
            "id",
            "courseId",
            "batchId",
            "semesterId",
            "facultyId",
            "section",
            
        ],

        include: [
            {
                model: Course,
                as: "course",
                attributes: [
                    "id",
                    "name",
                    "code",
                    "credits",
                    "semester",
                
                    
                ],
            },

            {
                model: Batch,
                as: "batch",
                attributes: [
                    "id",
                    "name",
                    "startYear",
                    "endYear",
                
                    
                ],
            },

            {
                model: Semester,
                as: "semester",
                attributes: [
                    "id",
                    "semesterNumber",
                    "term",
                    "academicYearId",
                    "isCurrent",
                    
                ],

                include: [
                    {
                        model: AcademicYear,
                        as: "academicYear",
                        attributes: [
                            "id",
                            "name",
                            "startYear",
                            "endYear",
                            "isCurrent",
                        ],
                    },
                ],
            },

            {
                model: Faculty,
                as: "faculty",
                attributes: [
                    "id",
                    "firstName",
                    "lastName",
                    "employeeId",
                    "designation",
                    "departmentId",
                    "status",
                ],
            },
        ],
    },
];

/**
 * ------------------------------------------------------------------
 * Course Registration Repository
 * ------------------------------------------------------------------
 */

class CourseRegistrationRepository {

    /**
     * --------------------------------------------------------------
     * Create Course Registration
     * --------------------------------------------------------------
     */
    async create(data, options = {}) {
        return CourseRegistration.create(
            data,
            options
        );
    }

    /**
     * --------------------------------------------------------------
     * Create Multiple Course Registrations
     * --------------------------------------------------------------
     *
     * Used for faculty bulk student enrollment.
     * --------------------------------------------------------------
     */
    async bulkCreate(data, options = {}) {
        return CourseRegistration.bulkCreate(
            data,
            {
                ...options,
                returning: true,
            }
        );
    }

    /**
     * --------------------------------------------------------------
     * Get All Course Registrations
     * --------------------------------------------------------------
     */
    async findAll(options = {}) {
        return CourseRegistration.findAll({
            ...options,
            include: courseRegistrationIncludes,
            order: [["createdAt", "DESC"]],
        });
    }

    /**
     * --------------------------------------------------------------
     * Get Course Registration By ID
     * --------------------------------------------------------------
     */
    async findById(id, options = {}) {
        return CourseRegistration.findByPk(
            id,
            {
                ...options,
                include: courseRegistrationIncludes,
            }
        );
    }

    /**
     * --------------------------------------------------------------
     * Find Registration By Student + Course Offering
     * --------------------------------------------------------------
     */
    async findByStudentAndCourseOffering(
        studentId,
        courseOfferingId,
        options = {}
    ) {
        return CourseRegistration.findOne({
            where: {
                studentId,
                courseOfferingId,
            },
            ...options,
        });
    }

    /**
     * --------------------------------------------------------------
     * Find Registrations By Student
     * --------------------------------------------------------------
     */
    async findByStudentId(
        studentId,
        options = {}
    ) {
        return CourseRegistration.findAll({
            where: {
                studentId,
            },
            include: courseRegistrationIncludes,
            order: [
                ["registrationDate", "DESC"],
            ],
            ...options,
        });
    }

    /**
     * --------------------------------------------------------------
     * Find Registrations By Course Offering
     * --------------------------------------------------------------
     *
     * This is used when faculty opens their course and wants to
     * see all students enrolled in that course.
     * --------------------------------------------------------------
     */
    async findByCourseOfferingId(
        courseOfferingId,
        options = {}
    ) {
        return CourseRegistration.findAll({
            where: {
                courseOfferingId,
            },
            include: courseRegistrationIncludes,
            order: [
                ["createdAt", "DESC"],
            ],
            ...options,
        });
    }

    /**
     * --------------------------------------------------------------
     * Find Registrations By Course Offering + Faculty
     * --------------------------------------------------------------
     *
     * IMPORTANT:
     *
     * This prevents a faculty member from accessing registrations
     * belonging to another faculty member's course offering.
     *
     * The faculty ID is faculties.id.
     * --------------------------------------------------------------
     */
    async findByCourseOfferingAndFaculty(
        courseOfferingId,
        facultyId,
        options = {}
    ) {
        return CourseRegistration.findAll({
            where: {
                courseOfferingId,
            },

            include: [
                {
                    model: Student,
                    as: "student",
                    attributes: [
                        "id",
                        "usn",
                        "firstName",
                        "lastName",
                        "email",
                        "phone",
                
                        
                    ],
                },

                {
                    model: CourseOffering,
                    as: "courseOffering",
                    required: true,

                    where: {
                        facultyId,
                    },

                    attributes: [
                        "id",
                        "courseId",
                        "batchId",
                        "semesterId",
                        "facultyId",
                        "section",
                        
                    ],

                    include: [
                        {
                            model: Course,
                            as: "course",
                            attributes: [
                                "id",
                                "name",
                                "code",
                                "credits",
                                "semester",
                                
                            ],
                        },

                        {
                            model: Batch,
                            as: "batch",
                            attributes: [
                                "id",
                                "name",
                                "startYear",
                                "endYear",
                                
                                "status",
                            ],
                        },

                        {
                            model: Semester,
                            as: "semester",
                            attributes: [
                                "id",
                                "semesterNumber",
                                "term",
                                "academicYearId",
                                "isCurrent",
                                
                            ],

                            include: [
                                {
                                    model: AcademicYear,
                                    as: "academicYear",
                                    attributes: [
                                        "id",
                                        "name",
                                        "startYear",
                                        "endYear",
                                        "isCurrent",
                                    ],
                                },
                            ],
                        },

                        {
                            model: Faculty,
                            as: "faculty",
                            attributes: [
                                "id",
                                "firstName",
                                "lastName",
                                "employeeId",
                                "designation",
                                "departmentId",
                                
                            ],
                        },
                    ],
                },
            ],

            order: [
                ["createdAt", "DESC"],
            ],

            ...options,
        });
    }

    /**
     * --------------------------------------------------------------
     * Find Registration By ID + Faculty
     * --------------------------------------------------------------
     *
     * Used for faculty update/delete operations.
     *
     * The registration can only be accessed if the associated
     * CourseOffering belongs to the logged-in faculty.
     * --------------------------------------------------------------
     */
    async findByIdAndFaculty(
        id,
        facultyId,
        options = {}
    ) {
        return CourseRegistration.findOne({
            where: {
                id,
            },

            include: [
                {
                    model: CourseOffering,
                    as: "courseOffering",
                    required: true,

                    where: {
                        facultyId,
                    },

                    attributes: [
                        "id",
                        "courseId",
                        "batchId",
                        "semesterId",
                        "facultyId",
                        "section",
                        
                    ],
                },
            ],

            ...options,
        });
    }

    /**
     * --------------------------------------------------------------
     * Check Whether Course Offering Belongs To Faculty
     * --------------------------------------------------------------
     */
    async findCourseOfferingByFaculty(
        courseOfferingId,
        facultyId
    ) {
        return CourseOffering.findOne({
            where: {
                id: courseOfferingId,
                facultyId,
            },
        });
    }

    /**
     * --------------------------------------------------------------
     * Get Existing Registrations For Multiple Students
     * --------------------------------------------------------------
     *
     * Used by bulk enrollment to detect students who are already
     * registered for the selected course offering.
     * --------------------------------------------------------------
     */
    async findExistingRegistrations(
        studentIds,
        courseOfferingId
    ) {
        return CourseRegistration.findAll({
            where: {
                studentId: studentIds,
                courseOfferingId,
            },
        });
    }

    /**
     * --------------------------------------------------------------
     * Update Course Registration
     * --------------------------------------------------------------
     */
    async update(
        id,
        data,
        options = {}
    ) {
        const courseRegistration =
            await CourseRegistration.findByPk(
                id,
                options
            );

        if (!courseRegistration) {
            return null;
        }

        await courseRegistration.update(
            data,
            options
        );

        return this.findById(
            id,
            options
        );
    }

    /**
     * --------------------------------------------------------------
     * Delete Course Registration
     * --------------------------------------------------------------
     */
    async delete(
        id,
        options = {}
    ) {
        const courseRegistration =
            await CourseRegistration.findByPk(
                id,
                options
            );

        if (!courseRegistration) {
            return false;
        }

        await courseRegistration.destroy(
            options
        );

        return true;
    }
}

export default new CourseRegistrationRepository();