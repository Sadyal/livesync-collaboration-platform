import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useRegister } from "../hooks";
import { AuthContext } from "../../../context/AuthContext";
import { ROUTES } from "../../../utils/constants";
import Button from "../../../components/common/Button.jsx";
import Input from "../../../components/common/Input.jsx";
import "./Auth.css";

const initialState = {
  name: "",
  email: "",
  password: "",
};

const Register = () => {
  const [formData, setFormData] = useState(initialState);
  const [formError, setFormError] = useState("");

  const { register, isLoading, error } = useRegister();
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  // ==========================================
  // REDIRECT IF ALREADY AUTHENTICATED
  // ==========================================
  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // ==========================================
  // INPUT CHANGE
  // ==========================================
  const handleChange = (e) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    // Clear local validation error on change
    if (formError) setFormError("");
  };

  // ==========================================
  // VALIDATION (CLIENT SIDE)
  // ==========================================
  const validate = () => {
    const { name, email, password } = formData;

    if (!name.trim()) return "Name is required";
    if (name.length < 2) return "Name must be at least 2 characters";

    if (!email.trim()) return "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Invalid email format";

    if (!password) return "Password is required";
    if (password.length < 6)
      return "Password must be at least 6 characters";

    return null;
  };

  // ==========================================
  // SUBMIT HANDLER
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      const res = await register(formData);

      if (res?.success) {
        navigate(ROUTES.DASHBOARD);
      }
    } catch (err) {
      console.error("Register error:", err.message);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="auth-container">
      <div className="auth-card glass animate-fade-in">
        <div className="auth-header">
          <h1>Create an Account</h1>
          <p>Start collaborating in real-time</p>
        </div>

        {/* 🔴 Errors */}
        {(formError || error) && (
          <div className="auth-error">
            {formError || error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <Input
            id="name"
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            autoComplete="name"
          />

          <Input
            id="email"
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
          />

          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
          />

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading}
          >
            Create Account
          </Button>
        </form>

        <div className="auth-footer">
          Already have an account?{" "}
          <Link to={ROUTES.LOGIN}>Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;