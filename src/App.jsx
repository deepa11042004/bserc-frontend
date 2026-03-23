import { Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/course/:slug" element={<CourseDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/my-learning" element={<MyLearning />} />
      <Route path="/learn/:courseId" element={<Learn />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/search" element={<Search />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;