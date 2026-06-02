import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ROUTES } from "../../utils/constants";
import Loader from "./Loader";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isInitializing } = useContext(AuthContext);
  const location = useLocation();

  // ==========================================
  // WAIT UNTIL AUTH STATE IS RESOLVED
  // ==========================================
  if (isInitializing) {
    return <Loader />; // prevents flicker
  }

  // ==========================================
  // REDIRECT IF NOT AUTHENTICATED
  // ==========================================
  if (!isAuthenticated) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        replace
        state={{ from: location }} // preserve intended route
      />
    );
  }

  // ==========================================
  // RENDER CHILDREN OR NESTED ROUTES
  // ==========================================
  return children ? children : <Outlet />;
};

export default ProtectedRoute;