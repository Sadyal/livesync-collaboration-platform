import { forwardRef } from "react";
import "./Button.css";

const VARIANTS = ["primary", "secondary", "danger", "ghost"];
const SIZES = ["sm", "md", "lg"];

const Button = forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      fullWidth = false,
      isLoading = false,
      disabled = false,
      type = "button",
      className = "",
      ...props
    },
    ref
  ) => {
    // ==========================================
    // VALIDATION (Defensive)
    // ==========================================
    const safeVariant = VARIANTS.includes(variant) ? variant : "primary";
    const safeSize = SIZES.includes(size) ? size : "md";

    const isDisabled = disabled || isLoading;

    // ==========================================
    // CLASS BUILDER
    // ==========================================
    const classes = [
      "btn",
      `btn-${safeVariant}`,
      `btn-${safeSize}`,
      fullWidth && "w-full",
      isLoading && "btn-loading",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    // ==========================================
    // RENDER
    // ==========================================
    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        disabled={isDisabled}
        aria-busy={isLoading}
        aria-disabled={isDisabled}
        {...props}
      >
        {isLoading ? (
          <span className="btn-loader" aria-hidden="true" />
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;