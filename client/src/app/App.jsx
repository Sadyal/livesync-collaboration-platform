import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthProvider";
import { ThemeProvider } from "../context/ThemeContext";
import AppRoutes from "./routes";

// Optional: error boundary (recommended)
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("App Crash:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <div style={{ padding: "2rem" }}>Something went wrong.</div>;
    }

    return this.props.children;
  }
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ThemeProvider>
          <AuthProvider>
            <div className="app-container">
              <main className="app-main">
                <AppRoutes />
              </main>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;