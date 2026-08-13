/**
 * ---------------------------------------------------------
 * Faculty Registration
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ---------------------------------------------------------
 *
 * Public registration is ONLY for Faculty.
 *
 * Registration creates:
 *
 * 1. User login account
 *    role   = FACULTY
 *    status = PENDING
 *
 * 2. Academic Faculty record
 *    status = false
 *
 * HOD approval changes:
 *
 * users.status     = APPROVED
 * faculties.status = true
 *
 * Approved faculty can then be assigned to
 * Course Offerings.
 * ---------------------------------------------------------
 */

import { useEffect, useState } from "react";

import {
  Eye,
  EyeSlash,
  MortarboardFill,
} from "react-bootstrap-icons";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useForm,
} from "react-hook-form";

import toast from "react-hot-toast";

import authService from "../../services/authService";

import {
  getDepartments,
} from "../../services/departmentService";


function Register() {
  const navigate = useNavigate();

  /**
   * -------------------------------------------------------
   * Password Visibility
   * -------------------------------------------------------
   */
  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);


  /**
   * -------------------------------------------------------
   * Form Submission State
   * -------------------------------------------------------
   */
  const [isSubmitting, setIsSubmitting] =
    useState(false);


  /**
   * -------------------------------------------------------
   * Department State
   * -------------------------------------------------------
   */
  const [departments, setDepartments] =
    useState([]);

  const [
    isLoadingDepartments,
    setIsLoadingDepartments,
  ] = useState(true);


  /**
   * -------------------------------------------------------
   * React Hook Form
   * -------------------------------------------------------
   */
  const {
    register,
    handleSubmit,
    watch,
    formState: {
      errors,
    },
  } = useForm();


  /**
   * -------------------------------------------------------
   * Watch Password
   * -------------------------------------------------------
   */
  const password =
    watch("password");


  /**
   * -------------------------------------------------------
   * Load Departments
   * -------------------------------------------------------
   *
   * GET:
   *
   * /api/v1/departments
   *
   * departmentService returns ONLY:
   *
   * [
   *   {
   *     id,
   *     name,
   *     code,
   *     status
   *   }
   * ]
   *
   * Therefore we directly store the returned array.
   * -------------------------------------------------------
   */
  useEffect(() => {

    const loadDepartments =
      async () => {

        try {

          setIsLoadingDepartments(
            true
          );

          console.log(
            "Loading departments..."
          );


          /**
           * -------------------------------------------------
           * Get Departments
           * -------------------------------------------------
           */
          const departmentData =
            await getDepartments();


          console.log(
            "DEPARTMENTS RECEIVED:",
            departmentData
          );


          /**
           * -------------------------------------------------
           * Make sure API returned an array
           * -------------------------------------------------
           */
          if (
            Array.isArray(
              departmentData
            )
          ) {

            setDepartments(
              departmentData
            );

          } else {

            console.error(
              "Department API did not return an array:",
              departmentData
            );

            setDepartments([]);
          }

        } catch (error) {

          console.error(
            "Failed to load departments:",
            error
          );

          toast.error(
            error?.response?.data?.message ||
              "Unable to load departments."
          );

          setDepartments([]);

        } finally {

          setIsLoadingDepartments(
            false
          );
        }
      };


    loadDepartments();

  }, []);


  /**
   * -------------------------------------------------------
   * Submit Registration
   * -------------------------------------------------------
   */
  const onSubmit =
    async (data) => {

      try {

        setIsSubmitting(
          true
        );


        /**
         * -------------------------------------------------
         * Register Faculty
         * -------------------------------------------------
         *
         * IMPORTANT:
         *
         * Do NOT send role.
         *
         * Backend automatically assigns:
         *
         * role   = FACULTY
         * status = PENDING
         * -------------------------------------------------
         */
        await authService.register({

          firstName:
            data.firstName.trim(),

          lastName:
            data.lastName.trim(),

          email:
            data.email.trim(),

          phone:
            data.phone.trim(),

          employeeId:
            data.employeeId.trim(),

          designation:
            data.designation,

          departmentId:
            data.departmentId,

          password:
            data.password,

        });


        /**
         * -------------------------------------------------
         * Registration Successful
         * -------------------------------------------------
         */
        toast.success(
          "Registration successful. Please wait for HOD approval."
        );


        navigate(
          "/login"
        );

      } catch (error) {

        console.error(
          "Faculty registration failed:",
          error
        );

        toast.error(
          error?.response?.data?.message ||
            "Registration failed."
        );

      } finally {

        setIsSubmitting(
          false
        );
      }
    };


  /**
   * -------------------------------------------------------
   * Render
   * -------------------------------------------------------
   */
  return (

    <div
      className="container-fluid min-vh-100 d-flex align-items-center justify-content-center py-5"
      style={{
        background:
          "var(--background)",
      }}
    >

      <div
        className="card shadow-lg p-4"
        style={{
          width: "650px",
          maxWidth: "95%",
          borderRadius: "18px",
        }}
      >

        {/* =================================================
            HEADER
        ================================================== */}

        <div className="text-center mb-4">

          <MortarboardFill
            size={55}
            className="text-primary"
          />

          <h2 className="mt-3 fw-bold">
            OBE Insight
          </h2>

          <p className="text-muted mb-0">
            Faculty Registration
          </p>

        </div>


        {/* =================================================
            REGISTRATION FORM
        ================================================== */}

        <form
          onSubmit={
            handleSubmit(onSubmit)
          }
        >


          {/* =================================================
              FIRST NAME + LAST NAME
          ================================================== */}

          <div className="row">

            {/* First Name */}

            <div className="col-md-6 mb-3">

              <label className="form-label">
                First Name
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Enter first name"
                {...register(
                  "firstName",
                  {
                    required:
                      "First Name is required",

                    minLength: {
                      value: 2,
                      message:
                        "First Name must contain at least 2 characters",
                    },
                  }
                )}
              />

              {errors.firstName && (
                <small className="text-danger">
                  {
                    errors.firstName
                      .message
                  }
                </small>
              )}

            </div>


            {/* Last Name */}

            <div className="col-md-6 mb-3">

              <label className="form-label">
                Last Name
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Enter last name"
                {...register(
                  "lastName",
                  {
                    required:
                      "Last Name is required",
                  }
                )}
              />

              {errors.lastName && (
                <small className="text-danger">
                  {
                    errors.lastName
                      .message
                  }
                </small>
              )}

            </div>

          </div>


          {/* =================================================
              EMAIL
          ================================================== */}

          <div className="mb-3">

            <label className="form-label">
              Email
            </label>

            <input
              type="email"
              className="form-control"
              placeholder="Enter official email"
              {...register(
                "email",
                {
                  required:
                    "Email is required",

                  pattern: {
                    value:
                      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message:
                      "Enter a valid email address",
                  },
                }
              )}
            />

            {errors.email && (
              <small className="text-danger">
                {
                  errors.email.message
                }
              </small>
            )}

          </div>


          {/* =================================================
              PHONE
          ================================================== */}

          <div className="mb-3">

            <label className="form-label">
              Phone Number
            </label>

            <input
              type="tel"
              className="form-control"
              placeholder="Enter phone number"
              {...register(
                "phone",
                {
                  required:
                    "Phone number is required",

                  pattern: {
                    value:
                      /^[0-9]{10,15}$/,
                    message:
                      "Phone number must contain 10 to 15 digits",
                  },
                }
              )}
            />

            {errors.phone && (
              <small className="text-danger">
                {
                  errors.phone.message
                }
              </small>
            )}

          </div>


          {/* =================================================
              EMPLOYEE ID
          ================================================== */}

          <div className="mb-3">

            <label className="form-label">
              Employee ID
            </label>

            <input
              type="text"
              className="form-control"
              placeholder="Example: FAC004"
              {...register(
                "employeeId",
                {
                  required:
                    "Employee ID is required",

                  minLength: {
                    value: 2,
                    message:
                      "Employee ID must contain at least 2 characters",
                  },
                }
              )}
            />

            {errors.employeeId && (
              <small className="text-danger">
                {
                  errors.employeeId
                    .message
                }
              </small>
            )}

          </div>


          {/* =================================================
              DESIGNATION
          ================================================== */}

          <div className="mb-3">

            <label className="form-label">
              Designation
            </label>

            <select
              className="form-select"
              {...register(
                "designation",
                {
                  required:
                    "Designation is required",
                }
              )}
            >

              <option value="">
                Select Designation
              </option>

              <option value="Assistant Professor">
                Assistant Professor
              </option>

              <option value="Associate Professor">
                Associate Professor
              </option>

              <option value="Professor">
                Professor
              </option>

              <option value="Head of Department">
                Head of Department
              </option>

            </select>

            {errors.designation && (
              <small className="text-danger">
                {
                  errors.designation
                    .message
                }
              </small>
            )}

          </div>


          {/* =================================================
              DEPARTMENT
          ================================================== */}

          <div className="mb-3">

            <label className="form-label">
              Department
            </label>


            <select
              className="form-select"
              disabled={
                isLoadingDepartments
              }
              {...register(
                "departmentId",
                {
                  required:
                    "Department is required",
                }
              )}
            >

              <option value="">
                {isLoadingDepartments
                  ? "Loading departments..."
                  : "Select Department"}
              </option>


              {departments.map(
                (department) => (

                  <option
                    key={
                      department.id
                    }
                    value={
                      department.id
                    }
                  >

                    {department.name}

                    {department.code
                      ? ` (${department.code})`
                      : ""}

                  </option>

                )
              )}

            </select>


            {/* =================================================
                NO DEPARTMENTS MESSAGE
            ================================================== */}

            {!isLoadingDepartments &&
              departments.length ===
                0 && (

                <small className="text-danger">
                  No departments
                  available.
                </small>

              )}


            {/* =================================================
                DEPARTMENT VALIDATION ERROR
            ================================================== */}

            {errors.departmentId && (

              <small className="text-danger d-block">

                {
                  errors.departmentId
                    .message
                }

              </small>

            )}

          </div>


          {/* =================================================
              PASSWORD
          ================================================== */}

          <div className="mb-3">

            <label className="form-label">
              Password
            </label>


            <div className="input-group">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                className="form-control"
                placeholder="Password"
                {...register(
                  "password",
                  {
                    required:
                      "Password is required",

                    minLength: {
                      value: 8,
                      message:
                        "Minimum 8 characters required",
                    },
                  }
                )}
              />


              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() =>
                  setShowPassword(
                    (previous) =>
                      !previous
                  )
                }
              >

                {showPassword ? (
                  <EyeSlash />
                ) : (
                  <Eye />
                )}

              </button>

            </div>


            {errors.password && (

              <small className="text-danger">

                {
                  errors.password.message
                }

              </small>

            )}

          </div>


          {/* =================================================
              CONFIRM PASSWORD
          ================================================== */}

          <div className="mb-4">

            <label className="form-label">
              Confirm Password
            </label>


            <div className="input-group">

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                className="form-control"
                placeholder="Confirm Password"
                {...register(
                  "confirmPassword",
                  {
                    required:
                      "Confirm Password is required",

                    validate: (
                      value
                    ) =>
                      value ===
                        password ||
                      "Passwords do not match",
                  }
                )}
              />


              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() =>
                  setShowConfirmPassword(
                    (previous) =>
                      !previous
                  )
                }
              >

                {showConfirmPassword ? (
                  <EyeSlash />
                ) : (
                  <Eye />
                )}

              </button>

            </div>


            {errors.confirmPassword && (

              <small className="text-danger">

                {
                  errors
                    .confirmPassword
                    .message
                }

              </small>

            )}

          </div>


          {/* =================================================
              REGISTER BUTTON
          ================================================== */}

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={
              isSubmitting ||
              isLoadingDepartments ||
              departments.length === 0
            }
          >

            {isSubmitting
              ? "Creating Account..."
              : "Register as Faculty"}

          </button>


          {/* =================================================
              LOGIN LINK
          ================================================== */}

          <div className="text-center mt-4">

            <span>
              Already have an account?{" "}
            </span>

            <Link
              to="/login"
              className="fw-semibold text-decoration-none"
            >
              Login
            </Link>

          </div>

        </form>

      </div>

    </div>
  );
}

export default Register;