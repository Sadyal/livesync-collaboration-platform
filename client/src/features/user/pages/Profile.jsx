import { useContext, useState, useEffect, useCallback } from "react";
import { User, Mail, Camera, Save } from "lucide-react";
import { AuthContext } from "../../../context/AuthContext";
import Button from "../../../components/common/Button.jsx";
import Input from "../../../components/common/Input.jsx";
import "./Profile.css";

const Profile = () => {
  const { user, fetchUser } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState(null);

  // ==========================================
  // SYNC USER DATA
  // ==========================================
useEffect(() => {
  if (!user) return;

  // eslint-disable-next-line react-hooks/set-state-in-effect
  setFormData((prev) => {
    // 🔒 prevent unnecessary re-renders
    if (
      prev.name === (user.name || "") &&
      prev.email === (user.email || "")
    ) {
      return prev;
    }

    return {
      ...prev,
      name: user.name || "",
      email: user.email || "",
    };
  });
}, [user]);

  // ==========================================
  // INPUT HANDLER
  // ==========================================
  const handleChange = (e) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    if (status) setStatus(null);
  };

  // ==========================================
  // SUBMIT & VALIDATION
  // ==========================================
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const validate = () => {
        if (!formData.name.trim()) return "Name is required";

        if (!/^\S+@\S+\.\S+$/.test(formData.email))
          return "Invalid email format";

        if (formData.newPassword && formData.newPassword.length < 6)
          return "New password must be at least 6 characters";

        return null;
      };

      const error = validate();
      if (error) {
        setStatus({ type: "error", message: error });
        return;
      }

      setIsSaving(true);
      setStatus(null);

      try {
        // 🔥 TODO: Replace with real API
        // await userApi.updateProfile(formData);

        await new Promise((res) => setTimeout(res, 1000));

        await fetchUser(); // sync updated data

        setStatus({
          type: "success",
          message: "Profile updated successfully",
        });

        // reset password fields
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
        }));
      } catch (err) {
        setStatus({
          type: "error",
          message: err?.message || "Update failed",
        });
      } finally {
        setIsSaving(false);
      }
    },
    [formData, fetchUser]
  );

  // ==========================================
  // HELPERS
  // ==========================================
  const getInitials = (name) =>
    name ? name.charAt(0).toUpperCase() : "U";

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="profile-container animate-fade-in">
      <h1 className="profile-title">Account Settings</h1>

      <div className="profile-grid">
        {/* SIDEBAR */}
        <aside className="profile-sidebar glass">
          <div className="profile-avatar-container">
            <div className="profile-avatar">
              {getInitials(user?.name)}
              <button className="avatar-edit-btn" type="button">
                <Camera size={16} />
              </button>
            </div>

            <h3>{user?.name || "User"}</h3>
            <p>{user?.email || "user@example.com"}</p>
          </div>

          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">12</span>
              <span className="stat-label">Documents</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">3</span>
              <span className="stat-label">Shared</span>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <section className="profile-content glass">
          <h2 className="section-title">Personal Information</h2>

          {status && (
            <div className={`status-message ${status.type}`}>
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="profile-form">
            {/* NAME */}
            <div className="input-icon-wrapper">
              <User size={18} className="input-icon" />
              <Input
                id="name"
                label="Full Name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            {/* EMAIL */}
            <div className="input-icon-wrapper">
              <Mail size={18} className="input-icon" />
              <Input
                id="email"
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <h2 className="section-title">Security</h2>

            <Input
              id="currentPassword"
              label="Current Password"
              type="password"
              value={formData.currentPassword}
              onChange={handleChange}
            />

            <Input
              id="newPassword"
              label="New Password"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
            />

            <div className="profile-actions">
              <Button type="submit" isLoading={isSaving} disabled={isSaving}>
                <Save size={16} /> Save Changes
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Profile;