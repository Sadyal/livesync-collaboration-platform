import { useState, useContext, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useLogin } from "../hooks";
import { AuthContext } from "../../../context/AuthContext";
import { ROUTES } from "../../../utils/constants";
import Button from "../../../components/common/Button.jsx";
import Input from "../../../components/common/Input.jsx";
import "./Auth.css";

const initialState = {
  email: "",
  password: "",
};

const Login = () => {
  const [formData, setFormData] = useState(initialState);
  const [formError, setFormError] = useState("");

  const { login, isLoading, error } = useLogin();
  const { isAuthenticated } = useContext(AuthContext);

  const navigate = useNavigate();
  const location = useLocation();

  // ==========================================
  // REDIRECT IF ALREADY AUTHENTICATED
  // ==========================================
  useEffect(() => {
    if (isAuthenticated) {
      const redirectPath =
        location.state?.from?.pathname || ROUTES.DASHBOARD;

      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // ==========================================
  // INPUT CHANGE
  // ==========================================
  const handleChange = (e) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    if (formError) setFormError("");
  };

  // ==========================================
  // VALIDATION
  // ==========================================
  const validate = () => {
    const { email, password } = formData;

    if (!email.trim()) return "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Invalid email format";

    if (!password) return "Password is required";

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
      const res = await login(formData);

      if (res?.success) {
        const redirectPath =
          location.state?.from?.pathname || ROUTES.DASHBOARD;

        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      console.error("Login error:", err.message);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="auth-container">
      <div className="auth-card glass animate-fade-in">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to continue</p>
        </div>

        {/* 🔴 Errors */}
        {(formError || error) && (
          <div className="auth-error">
            {formError || error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
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
            autoComplete="current-password"
          />

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading}
          >
            Sign In
          </Button>
        </form>

        <div className="auth-footer">
          Don’t have an account?{" "}
          <Link to={ROUTES.REGISTER}>Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;