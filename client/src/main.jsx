import { createRoot } from "react-dom/client";
import App from "./app/App.jsx";
import "./index.css";

// ⚠️ StrictMode removed for stable dev (auth + sockets)
createRoot(document.getElementById("root")).render(
  <App />
);