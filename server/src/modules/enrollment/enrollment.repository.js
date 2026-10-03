/**
 * ------------------------------------------------------------------
 * Enrollment Repository
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Handles Enrollment database operations.
 *
 * ------------------------------------------------------------------
 */

import Enrollment from "../../database/models/Enrollment.js";
import Student from "../../database/models/Student.js";
import Batch from "../../database/models/Batch.js";
import Program from "../../database/models/Program.js";

/**
 * ------------------------------------------------------------------
 * Common Enrollment Associations
 * ------------------------------------------------------------------
 */

const enrollmentIncludes = [
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
            "departmentId",
            "semesterId",
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
            "programId",
            "status",
        ],

        include: [
            {
                model: Program,
                as: "program",
                attributes: [
                    "id",
                    "name",
                    "code",
                    "duration",
                    "status",
                ],
            },
        ],
    },
];

class EnrollmentRepository {

    /**
     * Create Enrollment
     */
    async create(data, options = {}) {
        return Enrollment.create(data, options);
    }

    /**
     * Get All Enrollments
     */
    async findAll(options = {}) {
        return Enrollment.findAll({
            ...options,
            include: enrollmentIncludes,
            order: [["createdAt", "DESC"]],
        });
    }

    /**
     * Get Enrollment By ID
     */
    async findById(id, options = {}) {
        return Enrollment.findByPk(id, {
            ...options,
            include: enrollmentIncludes,
        });
    }

    /**
     * Find Enrollment By Student and Batch
     */
    async findByStudentAndBatch(
        studentId,
        batchId,
        options = {}
    ) {
        return Enrollment.findOne({
            where: {
                studentId,
                batchId,
            },
            ...options,
        });
    }

    /**
     * Find Enrollments By Student ID
     */
    async findByStudentId(studentId, options = {}) {
        return Enrollment.findAll({
            where: {
                studentId,
            },
            include: enrollmentIncludes,
            order: [["enrollmentDate", "DESC"]],
            ...options,
        });
    }

    /**
     * Find Enrollments By Batch ID
     */
    async findByBatchId(batchId, options = {}) {
        return Enrollment.findAll({
            where: {
                batchId,
            },
            include: enrollmentIncludes,
            order: [["createdAt", "DESC"]],
            ...options,
        });
    }

    /**
     * Update Enrollment
     */
    async update(id, data, options = {}) {
        const enrollment = await Enrollment.findByPk(
            id,
            options
        );

        if (!enrollment) {
            return null;
        }

        await enrollment.update(data, options);

        return this.findById(id, options);
    }

    /**
     * Delete Enrollment
     */
    async delete(id, options = {}) {
        const enrollment = await Enrollment.findByPk(
            id,
            options
        );

        if (!enrollment) {
            return false;
        }

        await enrollment.destroy(options);

        return true;
    }
}

export default new EnrollmentRepository();