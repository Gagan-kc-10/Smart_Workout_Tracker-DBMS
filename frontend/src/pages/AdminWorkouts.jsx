
import { useEffect, useState } from "react";
import {
  ClipboardList,
  Dumbbell,
  Flame,
  CheckCircle,
  Activity,
  Clock,
  ArrowUpRight,
  RefreshCw,
  CalendarDays,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./AdminWorkouts.css";

function AdminWorkouts() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState({
    totalPlans: 0,
    totalSessions: 0,
    completedSessions: 0,
    activeSessions: 0,
    totalCalories: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/workouts/summary");

      setSummary({
        totalPlans: Number(response.data.totalPlans || 0),
        totalSessions: Number(response.data.totalSessions || 0),
        completedSessions: Number(response.data.completedSessions || 0),
        activeSessions: Number(response.data.activeSessions || 0),
        totalCalories: Number(response.data.totalCalories || 0),
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to load workout management data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const stats = [
    {
      title: "Total Workout Plans",
      value: summary.totalPlans,
      icon: ClipboardList,
      color: "purple",
      description: "Plans created for users",
    },
    {
      title: "Total Sessions",
      value: summary.totalSessions,
      icon: Dumbbell,
      color: "blue",
      description: "Recorded workout sessions",
    },
    {
      title: "Completed Sessions",
      value: summary.completedSessions,
      icon: CheckCircle,
      color: "green",
      description: "Successfully completed",
    },
    {
      title: "Active Sessions",
      value: summary.activeSessions,
      icon: Activity,
      color: "orange",
      description: "Currently in progress",
    },
    {
      title: "Calories Burned",
      value: summary.totalCalories.toLocaleString("en-IN"),
      icon: Flame,
      color: "red",
      description: "Total recorded calories",
    },
  ];

  return (
    <div className="admin-workouts-page">
      {/* Page Header */}
      <div className="aw-page-header">
        <div>
          <span className="aw-eyebrow">FITNESS OPERATIONS</span>
          <h1>Workout Management</h1>
          <p>
            Monitor workout plans, track sessions and manage fitness
            activities across the platform.
          </p>
        </div>

        <button
          className="aw-refresh-btn"
          onClick={fetchSummary}
          disabled={loading}
        >
          <RefreshCw size={17} className={loading ? "aw-spinning" : ""} />
          {loading ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* Summary */}
      <section className="aw-summary-section">
        <div className="aw-section-heading">
          <div>
            <span className="aw-eyebrow">SYSTEM ANALYTICS</span>
            <h2>Workout Overview</h2>
          </div>
          <span className="aw-live-label">
            <span></span> Database Summary
          </span>
        </div>

        {error && (
          <div className="aw-error">
            {error}
            <button onClick={fetchSummary}>Try Again</button>
          </div>
        )}

        <div className="aw-stats-grid">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <div className="aw-stat-card" key={item.title}>
                <div className={`aw-stat-icon ${item.color}`}>
                  <Icon size={23} />
                </div>

                <div className="aw-stat-content">
                  <p>{item.title}</p>
                  <h3>
                    {loading ? "..." : item.value}
                  </h3>
                  <span>{item.description}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Management Sections */}
      <section className="aw-management-section">
        <div className="aw-section-heading">
          <div>
            <span className="aw-eyebrow">ADMINISTRATION</span>
            <h2>Management Overview</h2>
            <p>Choose a section to view and manage workout records.</p>
          </div>
        </div>

        <div className="aw-management-grid">
          {/* Workout Plans */}
          <div className="aw-management-card plans-card">
            <div className="aw-card-top">
              <div className="aw-management-icon plans-icon">
                <ClipboardList size={27} />
              </div>
              <span className="aw-card-tag">PLANNING</span>
            </div>

            <h3>Workout Plans</h3>
            <p>
              View and monitor workout plans assigned to registered users.
              Check plan types, exercise counts, dates and current status.
            </p>

            <div className="aw-card-info">
              <span>
                <CalendarDays size={16} />
                {loading ? "..." : summary.totalPlans} Total Plans
              </span>
            </div>

            <button
              className="aw-open-btn plans-btn"
              onClick={() => navigate("/admin/workouts/plans")}
            >
              Manage Workout Plans
              <ArrowUpRight size={18} />
            </button>
          </div>

          {/* Workout Sessions */}
          <div className="aw-management-card sessions-card">
            <div className="aw-card-top">
              <div className="aw-management-icon sessions-icon">
                <Activity size={27} />
              </div>
              <span className="aw-card-tag">ACTIVITY TRACKING</span>
            </div>

            <h3>Workout Sessions</h3>
            <p>
              Monitor users' workout sessions, including session dates,
              duration details, calories burned and completion status.
            </p>

            <div className="aw-card-info">
              <span>
                <Clock size={16} />
                {loading ? "..." : summary.totalSessions} Total Sessions
              </span>
            </div>

            <button
              className="aw-open-btn sessions-btn"
              onClick={() => navigate("/admin/workouts/sessions")}
            >
              Manage Workout Sessions
              <ArrowUpRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminWorkouts;
