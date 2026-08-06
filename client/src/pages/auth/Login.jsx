import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeSlash, MortarboardFill } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      const user = await login(data);

      toast.success(`Welcome ${user.firstName}!`);

      switch (user.role) {
        case "ADMIN":
          navigate("/admin/dashboard");
          break;

        case "FACULTY":
          navigate("/faculty/dashboard");
          break;

        case "STUDENT":
          navigate("/student/dashboard");
          break;

        default:
          navigate("/");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Invalid email or password."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="container-fluid vh-100 d-flex align-items-center justify-content-center"
      style={{ background: "var(--background)" }}
    >
      <div
        className="card shadow-lg p-4"
        style={{
          width: "430px",
          borderRadius: "18px",
        }}
      >
        <div className="text-center mb-4">
          <MortarboardFill
            size={55}
            color="#1E3A8A"
          />

          <h2 className="mt-3 fw-bold">
            OBE Insight
          </h2>

          <p className="text-muted">
            Automated CO–PO–PSO Attainment &
            Curriculum Gap Analysis System
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>

          <div className="mb-3">
            <label className="form-label">
              Email
            </label>

            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              {...register("email", {
                required: "Email is required",
              })}
            />

            {errors.email && (
              <small className="text-danger">
                {errors.email.message}
              </small>
            )}
          </div>

          <div className="mb-4">

            <label className="form-label">
              Password
            </label>

            <div className="input-group">

              <input
                type={
                  showPassword ? "text" : "password"
                }
                className="form-control"
                placeholder="Enter your password"
                {...register("password", {
                  required: "Password is required",
                })}
              />

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() =>
                  setShowPassword(!showPassword)
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

          <button
            className="btn btn-primary w-100"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Signing In..."
              : "Login"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default Login;