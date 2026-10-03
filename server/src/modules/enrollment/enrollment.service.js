/**
 * ------------------------------------------------------------------
 * Enrollment Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Handles Enrollment business rules, batch enrollment,
 * and bulk Excel upload.
 *
 * ------------------------------------------------------------------
 */

import XLSX from "xlsx";

import enrollmentRepository from "./enrollment.repository.js";

import Student from "../../database/models/Student.js";
import Batch from "../../database/models/Batch.js";
import StudentQuestionMark from "../../database/models/StudentQuestionMark.js";

import ApiError from "../../shared/errors/ApiError.js";

class EnrollmentService {

    /**
     * ------------------------------------------------------------------
     * Validate Student and Batch
     * ------------------------------------------------------------------
     */

    async validateStudentBatchRelationship(
        studentId,
        batchId
    ) {
        const student = await Student.findByPk(studentId);

        if (!student) {
            throw new ApiError(
                404,
                "Student not found."
            );
        }

        const batch = await Batch.findByPk(batchId);

        if (!batch) {
            throw new ApiError(
                404,
                "Batch not found."
            );
        }

        return {
            student,
            batch,
        };
    }

    /**
     * ------------------------------------------------------------------
     * Create Single Enrollment
     * ------------------------------------------------------------------
     */

    async createEnrollment(data) {
        const {
            studentId,
            batchId,
            enrollmentDate,
            status = true,
        } = data;

        await this.validateStudentBatchRelationship(
            studentId,
            batchId
        );

        const existingEnrollment =
            await enrollmentRepository.findByStudentAndBatch(
                studentId,
                batchId
            );

        if (existingEnrollment) {
            throw new ApiError(
                409,
                "Student is already enrolled in this Batch."
            );
        }

        const enrollment =
            await enrollmentRepository.create({
                studentId,
                batchId,
                enrollmentDate:
                    enrollmentDate ||
                    new Date().toISOString().split("T")[0],
                status,
            });

        return enrollmentRepository.findById(
            enrollment.id
        );
    }

    /**
     * ------------------------------------------------------------------
     * Bulk Upload Students and Enroll Into Batch
     *
     * Supported:
     * .xlsx
     * .xls
     * .csv
     *
     * Expected columns:
     * USN / Roll No
     * First Name / Name
     * Last Name
     * Email
     * Phone
     * ------------------------------------------------------------------
     */

    async bulkEnrollFromSpreadsheet(
        batchId,
        fileBuffer
    ) {
        const batch = await Batch.findByPk(batchId);

        if (!batch) {
            throw new ApiError(
                404,
                "Target Batch not found."
            );
        }

        const workbook = XLSX.read(fileBuffer, {
            type: "buffer",
        });

        if (
            !workbook.SheetNames ||
            workbook.SheetNames.length === 0
        ) {
            throw new ApiError(
                400,
                "Spreadsheet is empty or has no sheets."
            );
        }

        const firstSheet =
            workbook.Sheets[
                workbook.SheetNames[0]
            ];

        const rows =
            XLSX.utils.sheet_to_json(
                firstSheet,
                {
                    defval: "",
                }
            );

        if (!rows.length) {
            throw new ApiError(
                400,
                "No records found in the uploaded file."
            );
        }

        const sequelize = Student.sequelize;

        const transaction =
            await sequelize.transaction();

        try {
            const summary = {
                totalRows: rows.length,
                createdStudents: 0,
                enrolled: 0,
                alreadyEnrolled: 0,
                skipped: 0,
                errors: [],
            };

            for (
                let index = 0;
                index < rows.length;
                index++
            ) {
                const row = rows[index];

                const usn = String(
                    row.USN ||
                    row.usn ||
                    row["Roll No"] ||
                    row["Roll Number"] ||
                    row.roll_no ||
                    row.usn_no ||
                    ""
                )
                    .trim()
                    .toUpperCase();

                if (!usn) {
                    summary.skipped++;
                    continue;
                }

                const firstName = String(
                    row["First Name"] ||
                    row.firstName ||
                    row.first_name ||
                    row.Name ||
                    row.name ||
                    ""
                ).trim();

                const lastName = String(
                    row["Last Name"] ||
                    row.lastName ||
                    row.last_name ||
                    ""
                ).trim();

                const email = String(
                    row.Email ||
                    row.email ||
                    ""
                )
                    .trim()
                    .toLowerCase();

                const phone = String(
                    row.Phone ||
                    row.phone ||
                    ""
                ).trim();

                try {
                    /**
                     * --------------------------------------------------
                     * Find existing student
                     * --------------------------------------------------
                     */

                    let student =
                        await Student.findOne({
                            where: {
                                usn,
                            },
                            transaction,
                        });

                    /**
                     * --------------------------------------------------
                     * Create Student if not found
                     * --------------------------------------------------
                     */

                    if (!student) {
                        if (!firstName) {
                            throw new Error(
                                "First Name is required for a new student."
                            );
                        }

                        if (!email) {
                            throw new Error(
                                "Email is required for a new student."
                            );
                        }

                        student =
                            await Student.create(
                                {
                                    usn,
                                    firstName,
                                    lastName:
                                        lastName ||
                                        "-",
                                    email,
                                    phone:
                                        phone || null,
                                },
                                {
                                    transaction,
                                }
                            );

                        summary.createdStudents++;
                    }

                    /**
                     * --------------------------------------------------
                     * Check Existing Enrollment
                     * --------------------------------------------------
                     */

                    const existing =
                        await enrollmentRepository.findByStudentAndBatch(
                            student.id,
                            batchId,
                            {
                                transaction,
                            }
                        );

                    if (existing) {
                        summary.alreadyEnrolled++;
                        continue;
                    }

                    /**
                     * --------------------------------------------------
                     * Create Enrollment
                     * --------------------------------------------------
                     */

                    await enrollmentRepository.create(
                        {
                            studentId:
                                student.id,
                            batchId,
                            enrollmentDate:
                                new Date()
                                    .toISOString()
                                    .split("T")[0],
                            status: true,
                        },
                        {
                            transaction,
                        }
                    );

                    summary.enrolled++;
                } catch (rowError) {
                    summary.errors.push({
                        row: index + 2,
                        usn,
                        message:
                            rowError.message,
                    });
                }
            }

            await transaction.commit();

            return summary;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * ------------------------------------------------------------------
     * Get All Enrollments
     * ------------------------------------------------------------------
     */

    async getEnrollments() {
        return enrollmentRepository.findAll();
    }

    /**
     * ------------------------------------------------------------------
     * Get Enrollments By Batch ID
     * ------------------------------------------------------------------
     */

    async getEnrollmentsByBatchId(batchId) {
        const batch = await Batch.findByPk(batchId);

        if (!batch) {
            throw new ApiError(
                404,
                "Batch not found."
            );
        }

        return enrollmentRepository.findByBatchId(
            batchId
        );
    }

    /**
     * ------------------------------------------------------------------
     * Get Enrollments By Student ID
     * ------------------------------------------------------------------
     */

    async getEnrollmentsByStudentId(studentId) {
        const student = await Student.findByPk(
            studentId
        );

        if (!student) {
            throw new ApiError(
                404,
                "Student not found."
            );
        }

        return enrollmentRepository.findByStudentId(
            studentId
        );
    }

    /**
     * ------------------------------------------------------------------
     * Get Enrollment By ID
     * ------------------------------------------------------------------
     */

    async getEnrollmentById(id) {
        const enrollment =
            await enrollmentRepository.findById(id);

        if (!enrollment) {
            throw new ApiError(
                404,
                "Enrollment not found."
            );
        }

        return enrollment;
    }

    /**
     * ------------------------------------------------------------------
     * Update Enrollment
     * ------------------------------------------------------------------
     */

    async updateEnrollment(id, data) {
        const enrollment =
            await enrollmentRepository.findById(id);

        if (!enrollment) {
            throw new ApiError(
                404,
                "Enrollment not found."
            );
        }

        const studentId =
            data.studentId ??
            enrollment.studentId;

        const batchId =
            data.batchId ??
            enrollment.batchId;

        await this.validateStudentBatchRelationship(
            studentId,
            batchId
        );

        if (
            studentId !== enrollment.studentId ||
            batchId !== enrollment.batchId
        ) {
            const existing =
                await enrollmentRepository.findByStudentAndBatch(
                    studentId,
                    batchId
                );

            if (
                existing &&
                existing.id !== enrollment.id
            ) {
                throw new ApiError(
                    409,
                    "Student is already enrolled in this Batch."
                );
            }
        }

        return enrollmentRepository.update(
            id,
            data
        );
    }

    /**
     * ------------------------------------------------------------------
     * Delete Enrollment
     *
     * Prevent deletion when assessment marks exist.
     * ------------------------------------------------------------------
     */

    async deleteEnrollment(id) {
        const enrollment =
            await enrollmentRepository.findById(id);

        if (!enrollment) {
            throw new ApiError(
                404,
                "Enrollment not found."
            );
        }

        const markCount =
            await StudentQuestionMark.count({
                where: {
                    studentId:
                        enrollment.studentId,
                },
            });

        if (markCount > 0) {
            throw new ApiError(
                400,
                `Cannot remove enrollment. ${markCount} assessment mark record(s) exist for this student.`
            );
        }

        await enrollmentRepository.delete(id);

        return true;
    }
}

export default new EnrollmentService();