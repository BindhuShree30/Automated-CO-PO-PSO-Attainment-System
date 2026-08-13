import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Eye,
  EyeSlash,
  MortarboardFill,
} from "react-bootstrap-icons";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      selectedRole: "",
      email: "",
      password: "",
    },
  });

  /**
   * ---------------------------------------------------------
   * Login
   * ---------------------------------------------------------
   */
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      const user = await login({
        email: data.email,
        password: data.password,
        selectedRole: data.selectedRole,
      });

      toast.success(
        `Welcome ${user.firstName}!`
      );

      switch (user.role) {
        case "HOD":
          navigate("/hod/dashboard");
          break;

        case "FACULTY":
          navigate("/faculty/dashboard");
          break;

        default:
          toast.error(
            "Unauthorized role."
          );
          navigate("/login");
          break;
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Invalid email, password, or role."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="container-fluid vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: "var(--background)",
      }}
    >
      <div
        className="card shadow-lg p-4"
        style={{
          width: "430px",
          borderRadius: "18px",
        }}
      >

        {/* ==================================================
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

          <p className="text-muted">
            Automated CO–PO–PSO Attainment &
            Curriculum Gap Analysis System
          </p>

        </div>

        {/* ==================================================
            LOGIN FORM
        ================================================== */}

        <form
          onSubmit={handleSubmit(onSubmit)}
        >

          {/* ==================================================
              ROLE
          ================================================== */}

          <div className="mb-3">

            <label
              htmlFor="selectedRole"
              className="form-label"
            >
              Login As
            </label>

            <select
              id="selectedRole"
              className="form-select"
              {...register("selectedRole", {
                required:
                  "Please select your role",
              })}
            >

              <option value="">
                Select Role
              </option>

              <option value="HOD">
                HOD
              </option>

              <option value="FACULTY">
                Faculty
              </option>

            </select>

            {errors.selectedRole && (
              <small className="text-danger">
                {errors.selectedRole.message}
              </small>
            )}

          </div>

          {/* ==================================================
              EMAIL
          ================================================== */}

          <div className="mb-3">

            <label
              htmlFor="email"
              className="form-label"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              className="form-control"
              placeholder="Enter your email"
              autoComplete="email"
              {...register("email", {
                required:
                  "Email is required",
              })}
            />

            {errors.email && (
              <small className="text-danger">
                {errors.email.message}
              </small>
            )}

          </div>

          {/* ==================================================
              PASSWORD
          ================================================== */}

          <div className="mb-4">

            <label
              htmlFor="password"
              className="form-label"
            >
              Password
            </label>

            <div className="input-group">

              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                className="form-control"
                placeholder="Enter your password"
                autoComplete="current-password"
                {...register("password", {
                  required:
                    "Password is required",
                })}
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
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
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
                {errors.password.message}
              </small>
            )}

          </div>

          {/* ==================================================
              LOGIN BUTTON
          ================================================== */}

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Signing In..."
              : "Login"}
          </button>

          {/* ==================================================
              REGISTER
          ================================================== */}

          <div className="text-center mt-3">

            <span className="text-muted">
              Don't have an account?{" "}
            </span>

            <Link
              to="/register"
              className="fw-semibold text-decoration-none"
            >
              Register
            </Link>

          </div>

        </form>
      </div>
    </div>
  );
}

export default Login;