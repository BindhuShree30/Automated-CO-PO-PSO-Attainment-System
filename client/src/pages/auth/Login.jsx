import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  Eye,
  EyeSlash,
  MortarboardFill,
  BarChartLineFill,
  Diagram3Fill,
  JournalCheck,
} from "react-bootstrap-icons";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";

import "./Login.css";

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

  /* =========================================================
     LOGIN
  ========================================================= */

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
          toast.error("Unauthorized role.");
          navigate("/login");
          break;
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Invalid email, password, or role."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">

      {/* =====================================================
          LEFT SIDE
      ===================================================== */}

      <section className="login-brand-section">

        <div className="login-brand-content">

          {/* LOGO */}

          <div className="login-brand-logo">
            <MortarboardFill />
          </div>

          <h1>
            OBE Insight
          </h1>

          <p className="login-brand-subtitle">
            Automated CO–PO–PSO Attainment
            & Curriculum Gap Analysis System
          </p>


          {/* =================================================
              OBE VISUAL
          ================================================= */}

          <div className="obe-visual">

            <div className="obe-circle obe-circle-one">
              <BarChartLineFill />
            </div>

            <div className="obe-circle obe-circle-two">
              <JournalCheck />
            </div>

            <div className="obe-circle obe-circle-three">
              <Diagram3Fill />
            </div>

            <div className="obe-main-icon">
              <MortarboardFill />
            </div>

            <div className="obe-line obe-line-one" />

            <div className="obe-line obe-line-two" />

            <div className="obe-line obe-line-three" />

          </div>


          {/* DESCRIPTION */}

          <div className="login-brand-description">

            <h3>
              Outcome-Based Education
            </h3>

            <p>
              Simplify course outcomes, mapping,
              assessments and attainment analysis
              through one integrated platform.
            </p>

          </div>


          {/* FEATURES */}

          <div className="login-features">

            <span>
              ✓ CO–PO Mapping
            </span>

            <span>
              ✓ CO–PSO Mapping
            </span>

            <span>
              ✓ Attainment Analysis
            </span>

          </div>

        </div>

      </section>


      {/* =====================================================
          RIGHT SIDE
      ===================================================== */}

      <section className="login-form-section">

        <div className="login-form-card">

          {/* HEADER */}

          <div className="login-form-header">

            <div className="mobile-login-logo">
              <MortarboardFill />
            </div>

            <h2>
              Welcome Back
            </h2>

            <p>
              Sign in to continue to OBE Insight
            </p>

          </div>


          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >

            {/* ROLE */}

            <div className="login-field">

              <label htmlFor="selectedRole">
                Login As
              </label>

              <select
                id="selectedRole"
                className={
                  errors.selectedRole
                    ? "login-input login-input-error"
                    : "login-input"
                }
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
                <span className="login-error">
                  {errors.selectedRole.message}
                </span>
              )}

            </div>


            {/* EMAIL */}

            <div className="login-field">

              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                type="email"
                className={
                  errors.email
                    ? "login-input login-input-error"
                    : "login-input"
                }
                placeholder="Enter your email"
                autoComplete="email"
                {...register("email", {
                  required:
                    "Email is required",
                })}
              />

              {errors.email && (
                <span className="login-error">
                  {errors.email.message}
                </span>
              )}

            </div>


            {/* PASSWORD */}

            <div className="login-field">

              <label htmlFor="password">
                Password
              </label>

              <div className="password-wrapper">

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  className={
                    errors.password
                      ? "login-input login-password-input login-input-error"
                      : "login-input login-password-input"
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  {...register("password", {
                    required:
                      "Password is required",
                  })}
                />

                <button
                  type="button"
                  className="password-toggle"
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
                <span className="login-error">
                  {errors.password.message}
                </span>
              )}

            </div>


            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="login-submit-button"
              disabled={isSubmitting}
            >

              {isSubmitting ? (
                <>
                  <span className="login-spinner" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}

            </button>


            {/* REGISTER */}

            <div className="login-register">

              <span>
                Don't have an account?
              </span>

              <Link to="/register">
                Register
              </Link>

            </div>

          </form>


          {/* FOOTER */}

          <div className="login-footer">

            <span>
              OBE Insight
            </span>

            <span>
              •
            </span>

            <span>
              Outcome-Based Education
            </span>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Login;