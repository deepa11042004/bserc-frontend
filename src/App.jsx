import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import CourseDetails from "./pages/CourseDetails";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Cart from "./pages/Cart";
import MyLearning from "./pages/MyLearning";
import Learn from "./pages/Learn";
import Profile from "./pages/Profile";
import Search from "./pages/Search";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import ProtectedUserRoute from "./components/routes/ProtectedUserRoute";
import ProtectedAdminRoute from "./components/routes/ProtectedAdminRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedUserRoute>
            <Dashboard />
          </ProtectedUserRoute>
        }
      />
      <Route path="/course/:slug" element={<CourseDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/cart" element={<Cart />} />
      <Route
        path="/my-learning"
        element={
          <ProtectedUserRoute>
            <MyLearning />
          </ProtectedUserRoute>
        }
      />
      <Route path="/learn/:courseId" element={<Learn />} />
      <Route
        path="/profile"
        element={
          <ProtectedUserRoute>
            <Profile />
          </ProtectedUserRoute>
        }
      />
      <Route path="/search" element={<Search />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedAdminRoute allowedRoles={["admin", "super_admin", "instructor"]}>
            <AdminDashboard />
          </ProtectedAdminRoute>
        }
      />
      <Route path="/admin/instructor-dashboard" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/super-admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}

export default App;