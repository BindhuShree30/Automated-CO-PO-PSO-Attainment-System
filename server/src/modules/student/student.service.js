/**
 * ---------------------------------------------------------
 * Student Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ---------------------------------------------------------
 *
 * Handles Student business rules.
 *
 * ---------------------------------------------------------
 */

import ExcelJS from "exceljs";

import studentRepository from "./student.repository.js";
import departmentRepository from "../department/department.repository.js";
import semesterRepository from "../semester/semester.repository.js";

import ApiError from "../../shared/errors/ApiError.js";

class StudentService {

    /**
     * -----------------------------------------------------
     * Create Student
     * -----------------------------------------------------
     */

    async createStudent(studentData) {

        const normalizedData = {
            ...studentData,

            usn: studentData.usn
                .trim()
                .toUpperCase(),

            firstName: studentData.firstName
                .trim(),

            lastName: studentData.lastName
                .trim(),

            email: studentData.email
                .trim()
                .toLowerCase(),

            phone: studentData.phone
                ? String(studentData.phone).trim()
                : null,
        };

        const {
            usn,
            email,
            departmentId,
            semesterId,
        } = normalizedData;

        /**
         * -----------------------------------------------------
         * Validate Department
         * -----------------------------------------------------
         */

        const department =
            await departmentRepository.findDepartmentById(
                departmentId
            );

        if (!department) {
            throw new ApiError(
                404,
                "Department not found."
            );
        }

        /**
         * -----------------------------------------------------
         * Validate Semester
         * -----------------------------------------------------
         */

        const semester =
            await semesterRepository.findById(
                semesterId
            );

        if (!semester) {
            throw new ApiError(
                404,
                "Semester not found."
            );
        }

        /**
         * -----------------------------------------------------
         * Check Duplicate USN
         * -----------------------------------------------------
         */

        const existingUSN =
            await studentRepository.findStudentByUSN(
                usn
            );

        if (existingUSN) {
            throw new ApiError(
                409,
                "USN already exists."
            );
        }

        /**
         * -----------------------------------------------------
         * Check Duplicate Email
         * -----------------------------------------------------
         */

        const existingEmail =
            await studentRepository.findStudentByEmail(
                email
            );

        if (existingEmail) {
            throw new ApiError(
                409,
                "Email already exists."
            );
        }

        /**
         * -----------------------------------------------------
         * Create Student
         * -----------------------------------------------------
         */

        const student =
            await studentRepository.createStudent(
                normalizedData
            );

        return studentRepository.findStudentById(
            student.id
        );
    }


    /**
     * -----------------------------------------------------
     * Get All Students
     * -----------------------------------------------------
     */

    async getStudents() {

        return studentRepository.findAllStudents();
    }


    /**
     * -----------------------------------------------------
     * Get Student By ID
     * -----------------------------------------------------
     */

    async getStudentById(id) {

        const student =
            await studentRepository.findStudentById(id);

        if (!student) {
            throw new ApiError(
                404,
                "Student not found."
            );
        }

        return student;
    }


    /**
     * -----------------------------------------------------
     * Update Student
     * -----------------------------------------------------
     */

    async updateStudent(id, data) {

        const student =
            await studentRepository.findStudentById(id);

        if (!student) {
            throw new ApiError(
                404,
                "Student not found."
            );
        }

        const normalizedData = {
            ...data,
        };

        /**
         * -----------------------------------------------------
         * Normalize USN
         * -----------------------------------------------------
         */

        if (normalizedData.usn) {

            normalizedData.usn =
                normalizedData.usn
                    .trim()
                    .toUpperCase();
        }

        /**
         * -----------------------------------------------------
         * Normalize First Name
         * -----------------------------------------------------
         */

        if (normalizedData.firstName) {

            normalizedData.firstName =
                normalizedData.firstName.trim();
        }

        /**
         * -----------------------------------------------------
         * Normalize Last Name
         * -----------------------------------------------------
         */

        if (normalizedData.lastName) {

            normalizedData.lastName =
                normalizedData.lastName.trim();
        }

        /**
         * -----------------------------------------------------
         * Normalize Email
         * -----------------------------------------------------
         */

        if (normalizedData.email) {

            normalizedData.email =
                normalizedData.email
                    .trim()
                    .toLowerCase();
        }

        /**
         * -----------------------------------------------------
         * Normalize Phone
         * -----------------------------------------------------
         */

        if (normalizedData.phone) {

            normalizedData.phone =
                String(
                    normalizedData.phone
                ).trim();
        }

        /**
         * -----------------------------------------------------
         * Validate Department
         * -----------------------------------------------------
         */

        if (normalizedData.departmentId) {

            const department =
                await departmentRepository.findDepartmentById(
                    normalizedData.departmentId
                );

            if (!department) {

                throw new ApiError(
                    404,
                    "Department not found."
                );
            }
        }

        /**
         * -----------------------------------------------------
         * Validate Semester
         * -----------------------------------------------------
         */

        if (normalizedData.semesterId) {

            const semester =
                await semesterRepository.findById(
                    normalizedData.semesterId
                );

            if (!semester) {

                throw new ApiError(
                    404,
                    "Semester not found."
                );
            }
        }

        /**
         * -----------------------------------------------------
         * Check Duplicate Email
         * -----------------------------------------------------
         */

        if (normalizedData.email) {

            const existingEmail =
                await studentRepository.findStudentByEmail(
                    normalizedData.email
                );

            if (
                existingEmail &&
                existingEmail.id !== student.id
            ) {

                throw new ApiError(
                    409,
                    "Email already exists."
                );
            }
        }

        /**
         * -----------------------------------------------------
         * Check Duplicate USN
         * -----------------------------------------------------
         */

        if (normalizedData.usn) {

            const existingUSN =
                await studentRepository.findStudentByUSN(
                    normalizedData.usn
                );

            if (
                existingUSN &&
                existingUSN.id !== student.id
            ) {

                throw new ApiError(
                    409,
                    "USN already exists."
                );
            }
        }

        /**
         * -----------------------------------------------------
         * Update Student
         * -----------------------------------------------------
         */

        return studentRepository.updateStudent(
            student,
            normalizedData
        );
    }


    /**
     * -----------------------------------------------------
     * Delete Student
     * -----------------------------------------------------
     */

    async deleteStudent(id) {

        const student =
            await studentRepository.findStudentById(id);

        if (!student) {

            throw new ApiError(
                404,
                "Student not found."
            );
        }

        await studentRepository.deleteStudent(
            student
        );

        return true;
    }


    /**
     * -----------------------------------------------------
     * Read Excel File
     * -----------------------------------------------------
     */

    async readExcel(buffer) {

        const workbook =
            new ExcelJS.Workbook();

        await workbook.xlsx.load(buffer);

        const worksheet =
            workbook.worksheets[0];

        if (!worksheet) {

            throw new ApiError(
                400,
                "Excel file does not contain a worksheet."
            );
        }

        return worksheet;
    }


    /**
     * -----------------------------------------------------
     * Normalize Excel Header
     * -----------------------------------------------------
     */

    normalizeHeader(value) {

        if (!value) {
            return "";
        }

        return String(value)
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "")
            .replace(/_/g, "");
    }


    /**
     * -----------------------------------------------------
     * Get Excel Cell Value
     * -----------------------------------------------------
     */

    getCellValue(cell) {

        if (
            cell === null ||
            cell === undefined
        ) {
            return "";
        }

        if (
            typeof cell === "object" &&
            cell.text !== undefined
        ) {
            return String(cell.text).trim();
        }

        if (
            typeof cell === "object" &&
            cell.result !== undefined
        ) {
            return String(cell.result).trim();
        }

        return String(cell).trim();
    }


    /**
     * -----------------------------------------------------
     * Parse Student Excel
     * -----------------------------------------------------
     */

    async parseStudentExcel(buffer) {

        const worksheet =
            await this.readExcel(buffer);

        const headerRow =
            worksheet.getRow(1);

        const headers = {};

        headerRow.eachCell(
            (cell, columnNumber) => {

                const normalized =
                    this.normalizeHeader(
                        this.getCellValue(
                            cell.value
                        )
                    );

                if (normalized) {

                    headers[normalized] =
                        columnNumber;
                }
            }
        );

        /**
         * -----------------------------------------------------
         * Required Excel Columns
         * -----------------------------------------------------
         */

        const requiredColumns = [
            "usn",
            "firstname",
            "lastname",
            "email",
            "department",
            "semester",
        ];

        const missingColumns =
            requiredColumns.filter(
                (column) =>
                    !headers[column]
            );

        if (missingColumns.length > 0) {

            throw new ApiError(
                400,
                `Missing required Excel columns: ${missingColumns.join(", ")}`
            );
        }

        const students = [];
        const errors = [];

        for (
            let rowNumber = 2;
            rowNumber <= worksheet.rowCount;
            rowNumber++
        ) {

            const row =
                worksheet.getRow(rowNumber);

            const usn =
                this.getCellValue(
                    row.getCell(
                        headers.usn
                    ).value
                );

            const firstName =
                this.getCellValue(
                    row.getCell(
                        headers.firstname
                    ).value
                );

            const lastName =
                this.getCellValue(
                    row.getCell(
                        headers.lastname
                    ).value
                );

            const email =
                this.getCellValue(
                    row.getCell(
                        headers.email
                    ).value
                );

            const phone =
                headers.phone
                    ? this.getCellValue(
                        row.getCell(
                            headers.phone
                        ).value
                    )
                    : "";

            const department =
                this.getCellValue(
                    row.getCell(
                        headers.department
                    ).value
                );

            const semester =
                this.getCellValue(
                    row.getCell(
                        headers.semester
                    ).value
                );

            /**
             * -----------------------------------------------------
             * Ignore Completely Empty Rows
             * -----------------------------------------------------
             */

            if (
                !usn &&
                !firstName &&
                !lastName &&
                !email &&
                !phone &&
                !department &&
                !semester
            ) {
                continue;
            }

            const rowErrors = [];

            /**
             * -----------------------------------------------------
             * Required Field Validation
             * -----------------------------------------------------
             */

            if (!usn) {
                rowErrors.push(
                    "USN is required."
                );
            }

            if (!firstName) {
                rowErrors.push(
                    "First name is required."
                );
            }

            if (!lastName) {
                rowErrors.push(
                    "Last name is required."
                );
            }

            if (!email) {
                rowErrors.push(
                    "Email is required."
                );
            }

            if (!department) {
                rowErrors.push(
                    "Department is required."
                );
            }

            if (!semester) {
                rowErrors.push(
                    "Semester is required."
                );
            }

            /**
             * -----------------------------------------------------
             * Email Validation
             * -----------------------------------------------------
             */

            if (
                email &&
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                    email
                )
            ) {
                rowErrors.push(
                    "Invalid email address."
                );
            }

            /**
             * -----------------------------------------------------
             * USN Validation
             * -----------------------------------------------------
             */

            if (
                usn &&
                usn.length > 20
            ) {
                rowErrors.push(
                    "USN cannot exceed 20 characters."
                );
            }

            /**
             * -----------------------------------------------------
             * Phone Validation
             * -----------------------------------------------------
             */

            if (
                phone &&
                phone.length > 15
            ) {
                rowErrors.push(
                    "Phone number cannot exceed 15 characters."
                );
            }

            /**
             * -----------------------------------------------------
             * Semester Validation
             * -----------------------------------------------------
             */

            const semesterNumber =
                Number(semester);

            if (
                semester &&
                (
                    !Number.isInteger(
                        semesterNumber
                    ) ||
                    semesterNumber < 1 ||
                    semesterNumber > 8
                )
            ) {
                rowErrors.push(
                    "Semester must be a number between 1 and 8."
                );
            }

            /**
             * -----------------------------------------------------
             * Store Invalid Row
             * -----------------------------------------------------
             */

            if (rowErrors.length > 0) {

                errors.push({
                    row: rowNumber,
                    usn,
                    firstName,
                    lastName,
                    email,
                    phone,
                    department,
                    semester,
                    errors: rowErrors,
                });

                continue;
            }

            /**
             * -----------------------------------------------------
             * Store Valid Parsed Student
             * -----------------------------------------------------
             */

            students.push({
                rowNumber,

                usn: usn
                    .trim()
                    .toUpperCase(),

                firstName:
                    firstName.trim(),

                lastName:
                    lastName.trim(),

                email:
                    email
                        .trim()
                        .toLowerCase(),

                phone:
                    phone
                        ? phone.trim()
                        : null,

                department:
                    department.trim(),

                semester:
                    semesterNumber,
            });
        }

        return {
            students,
            errors,

            totalRows:
                students.length +
                errors.length,
        };
    }


    /**
     * -----------------------------------------------------
     * Resolve Department
     * -----------------------------------------------------
     */

    async resolveDepartment(departmentValue) {

        const value =
            String(departmentValue)
                .trim();

        if (!value) {
            return null;
        }

        /**
         * First try department code.
         *
         * Example:
         * CSE
         */

        const byCode =
            await departmentRepository
                .findDepartmentByCode(
                    value.toUpperCase()
                );

        if (byCode) {
            return byCode;
        }

        /**
         * Then try department name.
         *
         * Example:
         * Computer Science and Engineering
         */

        const departments =
            await departmentRepository
                .getAllDepartments();

        const normalizedValue =
            value
                .toLowerCase()
                .replace(/\s+/g, " ")
                .trim();

        const department =
            departments.find(
                (item) =>
                    item.name
                        .toLowerCase()
                        .replace(/\s+/g, " ")
                        .trim() ===
                    normalizedValue
            );

        return department || null;
    }


    /**
     * -----------------------------------------------------
     * Resolve Semester
     * -----------------------------------------------------
     *
     * Current project data contains one Semester 7.
     *
     * If multiple Semester 7 records exist later,
     * the import will reject the row instead of
     * assigning the wrong semester.
     * -----------------------------------------------------
     */

    async resolveSemester(semesterValue) {

        const semesterNumber =
            Number(semesterValue);

        if (
            !Number.isInteger(
                semesterNumber
            )
        ) {
            return null;
        }

        const semesters =
            await semesterRepository.findAll();

        const matches =
            semesters.filter(
                (semester) =>
                    Number(
                        semester.semesterNumber
                    ) === semesterNumber
            );

        if (matches.length === 1) {
            return matches[0];
        }

        if (matches.length === 0) {
            return null;
        }

        throw new ApiError(
            400,
            `Semester ${semesterNumber} is associated with multiple batches. The Excel file must identify the batch before this semester can be imported.`
        );
    }


    /**
     * -----------------------------------------------------
     * Preview Excel
     * -----------------------------------------------------
     */

    async previewExcel(buffer) {

        const parsed =
            await this.parseStudentExcel(
                buffer
            );

        /**
         * -----------------------------------------------------
         * Check Database Duplicates
         * -----------------------------------------------------
         */

        const usns =
            parsed.students.map(
                (student) =>
                    student.usn
            );

        const emails =
            parsed.students.map(
                (student) =>
                    student.email
            );

        const existingUSNs =
            usns.length > 0
                ? await studentRepository
                    .findStudentsByUSNs(
                        usns
                    )
                : [];

        const existingEmails =
            emails.length > 0
                ? await studentRepository
                    .findStudentsByEmails(
                        emails
                    )
                : [];

        const existingUSNSet =
            new Set(
                existingUSNs.map(
                    (student) =>
                        student.usn
                )
            );

        const existingEmailSet =
            new Set(
                existingEmails.map(
                    (student) =>
                        student.email
                )
            );

        const validStudents = [];
        const invalidRows = [];
        const duplicateRows = [];

        /**
         * -----------------------------------------------------
         * Track Duplicates Inside Excel
         * -----------------------------------------------------
         */

        const excelUSNs = new Set();
        const excelEmails = new Set();

        for (
            const student of parsed.students
        ) {

            const rowErrors = [];

            /**
             * --------------------------------------------------
             * Database Duplicate USN
             * --------------------------------------------------
             */

            if (
                existingUSNSet.has(
                    student.usn
                )
            ) {
                rowErrors.push(
                    "USN already exists."
                );
            }

            /**
             * --------------------------------------------------
             * Database Duplicate Email
             * --------------------------------------------------
             */

            if (
                existingEmailSet.has(
                    student.email
                )
            ) {
                rowErrors.push(
                    "Email already exists."
                );
            }

            /**
             * --------------------------------------------------
             * Duplicate Inside Excel
             * --------------------------------------------------
             */

            if (
                excelUSNs.has(
                    student.usn
                )
            ) {
                rowErrors.push(
                    "Duplicate USN found in Excel file."
                );
            }

            if (
                excelEmails.has(
                    student.email
                )
            ) {
                rowErrors.push(
                    "Duplicate email found in Excel file."
                );
            }

            excelUSNs.add(
                student.usn
            );

            excelEmails.add(
                student.email
            );

            /**
             * --------------------------------------------------
             * Resolve Department
             * --------------------------------------------------
             */

            let department = null;

            try {

                department =
                    await this.resolveDepartment(
                        student.department
                    );

                if (!department) {

                    rowErrors.push(
                        `Department "${student.department}" not found.`
                    );
                }

            } catch (error) {

                rowErrors.push(
                    error.message
                );
            }

            /**
             * --------------------------------------------------
             * Resolve Semester
             * --------------------------------------------------
             */

            let semester = null;

            try {

                semester =
                    await this.resolveSemester(
                        student.semester
                    );

                if (!semester) {

                    rowErrors.push(
                        `Semester "${student.semester}" not found.`
                    );
                }

            } catch (error) {

                rowErrors.push(
                    error.message
                );
            }

            /**
             * --------------------------------------------------
             * Invalid / Duplicate Row
             * --------------------------------------------------
             */

            if (
                rowErrors.length > 0
            ) {

                const rowData = {
                    ...student,
                    departmentId:
                        department?.id || null,
                    semesterId:
                        semester?.id || null,
                    errors: rowErrors,
                };

                if (
                    rowErrors.some(
                        (error) =>
                            error.includes(
                                "already exists"
                            ) ||
                            error.includes(
                                "Duplicate"
                            )
                    )
                ) {

                    duplicateRows.push(
                        rowData
                    );

                } else {

                    invalidRows.push(
                        rowData
                    );
                }

                continue;
            }

            /**
             * --------------------------------------------------
             * Valid Student
             * --------------------------------------------------
             */

            validStudents.push({
                ...student,

                departmentId:
                    department.id,

                semesterId:
                    semester.id,

                departmentName:
                    department.name,

                departmentCode:
                    department.code,

                semesterNumber:
                    semester.semesterNumber,

                semesterTerm:
                    semester.term,

                batch:
                    semester.batch
                        ? semester.batch.name
                        : null,

                academicYear:
                    semester.academicYear
                        ? semester.academicYear.name
                        : null,
            });
        }

        return {
            totalRows:
                parsed.totalRows,

            validCount:
                validStudents.length,

            invalidCount:
                parsed.errors.length +
                invalidRows.length,

            duplicateCount:
                duplicateRows.length,

            validStudents,

            invalidRows: [
                ...parsed.errors,
                ...invalidRows,
            ],

            duplicateRows,
        };
    }


    /**
     * -----------------------------------------------------
     * Import Excel
     * -----------------------------------------------------
     */

    async importExcel(buffer) {

        const preview =
            await this.previewExcel(
                buffer
            );

        if (
            preview.validStudents.length === 0
        ) {

            throw new ApiError(
                400,
                "No valid student records available for import."
            );
        }

        /**
         * -----------------------------------------------------
         * Prepare Database Records
         * -----------------------------------------------------
         */

        const studentsToCreate =
            preview.validStudents.map(
                (student) => ({
                    usn:
                        student.usn,

                    firstName:
                        student.firstName,

                    lastName:
                        student.lastName,

                    email:
                        student.email,

                    phone:
                        student.phone,

                    departmentId:
                        student.departmentId,

                    semesterId:
                        student.semesterId,
                })
            );

        /**
         * -----------------------------------------------------
         * Bulk Create Students
         * -----------------------------------------------------
         */

        const createdStudents =
            await studentRepository.createStudents(
                studentsToCreate
            );

        return {

            message:
                "Students imported successfully.",

            importedCount:
                createdStudents.length,

            skippedCount:
                preview.invalidCount +
                preview.duplicateCount,

            invalidCount:
                preview.invalidCount,

            duplicateCount:
                preview.duplicateCount,
        };6
    }
}

export default new StudentService();