import "./Loader.css";

const Loader = ({
  fullScreen = false,
  size = "md", // sm | md | lg
  label = "Loading...", // accessibility + UX
}) => {
  return (
    <div
      className={
        fullScreen
          ? "loader-overlay glass"
          : "loader-container"
      }
      role="status"
      aria-live="polite"
    >
      <div className={`spinner spinner-${size}`} />
      
      {label && (
        <span className="loader-text">
          {label}
        </span>
      )}
    </div>
  );
};

export default Loader;