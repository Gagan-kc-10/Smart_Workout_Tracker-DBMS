
import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Users,
  UserRound,
  RefreshCw,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function AdminDashboard() {
  const { user } = useAuth();

  const [totalUsers, setTotalUsers] = useState(0);
  const [totalTrainers, setTotalTrainers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [usersResponse, trainersResponse] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/trainers")
      ]);

      setTotalUsers(usersResponse.data.totalUsers);
      setTotalTrainers(trainersResponse.data.totalTrainers);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load dashboard statistics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="admin-dashboard">

      <div className="admin-dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>
            Welcome, {user?.First_Name} {user?.Last_Name}
          </p>
          <span>Manage your Smart Workout Tracker system.</span>
        </div>

        <button
          className="admin-refresh-btn"
          onClick={fetchDashboardData}
          disabled={loading}
        >
          <RefreshCw size={17} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="admin-dashboard-error">
          {error}
          <button onClick={fetchDashboardData}>Try Again</button>
        </div>
      )}

      <div className="admin-stats-grid">

        <div className="admin-stat-card">
          <div className="admin-stat-icon purple">
            <ShieldCheck size={25} />
          </div>
          <p>System Role</p>
          <h2>Administrator</h2>
          <span>Full administrative access</span>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon blue">
            <Users size={25} />
          </div>
          <p>Total Users</p>
          <h2>{loading ? "..." : totalUsers}</h2>
          <span>Registered fitness users</span>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon green">
            <UserRound size={25} />
          </div>
          <p>Total Trainers</p>
          <h2>{loading ? "..." : totalTrainers}</h2>
          <span>Registered fitness trainers</span>
        </div>

      </div>

      <div className="admin-management-section">
        <h2>Management Overview</h2>
        <p>Quick access to administrative operations.</p>

        <div className="admin-management-grid">

          <Link to="/admin/users" className="admin-management-card">
            <div className="admin-management-icon blue">
              <Users size={24} />
            </div>
            <div>
              <h3>User Management</h3>
              <p>View registered users and their fitness levels.</p>
            </div>
            <ArrowRight size={20} />
          </Link>

          <Link to="/admin/trainers" className="admin-management-card">
            <div className="admin-management-icon green">
              <UserRound size={24} />
            </div>
            <div>
              <h3>Trainer Management</h3>
              <p>Register and manage fitness trainers.</p>
            </div>
            <ArrowRight size={20} />
          </Link>

        </div>
      </div>

    </div>
  );
}

export default AdminDashboard;
