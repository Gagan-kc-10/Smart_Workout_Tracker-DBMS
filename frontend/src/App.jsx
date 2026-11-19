
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import TrainerDashboard from "./pages/TrainerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminTrainers from "./pages/AdminTrainers";
import TrainerUsers from "./pages/TrainerUsers";
import TrainerWorkoutPlans from "./pages/TrainerWorkoutPlans";
import AdminWorkouts from "./pages/AdminWorkouts";
import AdminWorkoutPlans from "./pages/AdminWorkoutPlans";
import AdminWorkoutSessions from "./pages/AdminWorkoutSessions";

import WorkoutPlans from "./pages/WorkoutPlans";
import StartWorkout from "./pages/StartWorkout";
import WorkoutHistory from "./pages/WorkoutHistory";
import FitnessGoals from "./pages/FitnessGoals";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

import "./App.css";

function HomeRedirect() {
  const { user } = useAuth();

  if (user?.Role_Name === "Admin") {
    return <Navigate to="/admin" replace />;
  }

  if (user?.Role_Name === "Trainer") {
    return <Navigate to="/trainer" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>

              {/* Common Settings */}
              <Route path="/settings" element={<Settings />} />

              {/* User Routes */}
              <Route element={<ProtectedRoute allowedRoles={["User"]} />}>
                <Route path="/" element={<HomeRedirect />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/workout-plans" element={<WorkoutPlans />} />
                <Route path="/start-workout" element={<StartWorkout />} />
                <Route path="/workout-history" element={<WorkoutHistory />} />
                <Route path="/fitness-goals" element={<FitnessGoals />} />
                <Route path="/profile" element={<Profile />} />
              </Route>

              {/* Trainer Routes */}
              <Route element={<ProtectedRoute allowedRoles={["Trainer"]} />}>
                <Route path="/trainer" element={<TrainerDashboard />} />
                <Route path="/trainer/users" element={<TrainerUsers />} />
                <Route
                  path="/trainer/workout-plans"
                  element={<TrainerWorkoutPlans />}
                />
              </Route>

              {/* Admin Routes */}
<Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
  <Route path="/admin" element={<AdminDashboard />} />
  <Route path="/admin/users" element={<AdminUsers />} />
  <Route path="/admin/trainers" element={<AdminTrainers />} />

  {/* Workout Management */}
  <Route path="/admin/workouts" element={<AdminWorkouts />} />
  <Route
    path="/admin/workouts/plans"
    element={<AdminWorkoutPlans />}
  />
  <Route
    path="/admin/workouts/sessions"
    element={<AdminWorkoutSessions />}
  />
</Route>
            </Route>
          </Route>

          {/* Unknown Routes */}
          <Route path="*" element={<HomeRedirect />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
