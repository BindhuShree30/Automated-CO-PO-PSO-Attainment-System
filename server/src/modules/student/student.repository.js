/**
 * ------------------------------------------------------------------
 * Student Repository
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Handles all database operations related to Students.
 *
 * ------------------------------------------------------------------
 */

import Student from "../../database/models/Student.js";
import Department from "../../database/models/Department.js";
import Semester from "../../database/models/Semester.js";
import Batch from "../../database/models/Batch.js";
import AcademicYear from "../../database/models/AcademicYear.js";

class StudentRepository {
    /**
     * ------------------------------------------------------------------
     * Create Student
     * ------------------------------------------------------------------
     */
    async createStudent(studentData) {
        return Student.create(studentData);
    }

    /**
     * ------------------------------------------------------------------
     * Find Student By ID
     * ------------------------------------------------------------------
     */
    async findStudentById(id) {
        return Student.findOne({
            where: {
                id,
            },

            include: [
                {
                    model: Department,
                    as: "department",
                    attributes: [
                        "id",
                        "name",
                        "code",
                    ],
                },

                {
                    model: Semester,
                    as: "semester",
                    attributes: [
                        "id",
                        "semesterNumber",
                        "batchId",
                        "academicYearId",
                        "term",
                        "startDate",
                        "endDate",
                        "isCurrent",
                        "status",
                    ],

                    include: [
                        {
                            model: Batch,
                            as: "batch",
                            attributes: [
                                "id",
                                "name",
                                "startYear",
                                "endYear",
                                "programId",
                            ],
                        },

                        {
                            model: AcademicYear,
                            as: "academicYear",
                            attributes: [
                                "id",
                                "name",
                                "startYear",
                                "endYear",
                            ],
                        },
                    ],
                },
            ],
        });
    }

    /**
     * ------------------------------------------------------------------
     * Find Student By USN
     * ------------------------------------------------------------------
     */
    async findStudentByUSN(usn) {
        return Student.findOne({
            where: {
                usn,
            },
        });
    }

    /**
     * ------------------------------------------------------------------
     * Find Student By Email
     * ------------------------------------------------------------------
     */
    async findStudentByEmail(email) {
        return Student.findOne({
            where: {
                email,
            },
        });
    }

    /**
     * ------------------------------------------------------------------
     * Find All Students
     * ------------------------------------------------------------------
     */
    async findAllStudents() {
        return Student.findAll({
            include: [
                {
                    model: Department,
                    as: "department",
                    attributes: [
                        "id",
                        "name",
                        "code",
                    ],
                },

                {
                    model: Semester,
                    as: "semester",
                    attributes: [
                        "id",
                        "semesterNumber",
                        "batchId",
                        "academicYearId",
                        "term",
                        "startDate",
                        "endDate",
                        "isCurrent",
                        "status",
                    ],

                    include: [
                        {
                            model: Batch,
                            as: "batch",
                            attributes: [
                                "id",
                                "name",
                                "startYear",
                                "endYear",
                                "programId",
                            ],
                        },

                        {
                            model: AcademicYear,
                            as: "academicYear",
                            attributes: [
                                "id",
                                "name",
                                "startYear",
                                "endYear",
                            ],
                        },
                    ],
                },
            ],

            order: [
                ["usn", "ASC"],
            ],
        });
    }

    /**
     * ------------------------------------------------------------------
     * Update Student
     * ------------------------------------------------------------------
     */
    async updateStudent(student, studentData) {
        await student.update(studentData);

        return this.findStudentById(student.id);
    }

    /**
     * ------------------------------------------------------------------
     * Delete Student
     * ------------------------------------------------------------------
     */
    async deleteStudent(student) {
        return student.destroy();
    }
}

export default new StudentRepository();