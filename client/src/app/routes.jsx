import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

import ProtectedRoute from "../components/common/ProtectedRoute";
import MainLayout from "../components/layout/MainLayout";
import Loader from "../components/common/Loader";
import { ROUTES } from "../utils/constants";

// 🔥 Lazy load pages (performance boost)
const Home = lazy(() => import("../pages/Home"));
const Login = lazy(() => import("../features/auth/pages/Login"));
const Register = lazy(() => import("../features/auth/pages/Register"));
const Dashboard = lazy(() => import("../features/document/pages/Dashboard"));
const Editor = lazy(() => import("../features/document/pages/Editor"));
const Profile = lazy(() => import("../features/user/pages/Profile"));

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loader fullScreen />}>
      <Routes>

        {/* ================= PUBLIC ROUTES ================= */}
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />

        {/* ================= PROTECTED ROUTES ================= */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>

            <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
            <Route path={ROUTES.DOC_EDITOR} element={<Editor />} />
            <Route path={ROUTES.PROFILE} element={<Profile />} />

          </Route>
        </Route>

        {/* ================= 404 FALLBACK ================= */}
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />

      </Routes>
    </Suspense>
  );
};

export default AppRoutes;