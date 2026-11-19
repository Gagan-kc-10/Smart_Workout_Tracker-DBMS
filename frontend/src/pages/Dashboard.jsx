import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Activity,
  Flame,
  Dumbbell,
  Target,
  CalendarDays,
  History,
  RefreshCw,
  LayoutDashboard,
  ClipboardList,
} from "lucide-react";

import {
  getDashboard,
  getWorkoutHistory,
} from "../services/api";

function Dashboard() {
  const { user } = useAuth();
  const userId = user?.User_ID;
  const navigate = useNavigate();
  const location = useLocation();

  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const dashboardResponse = await getDashboard(userId);
      setStats(dashboardResponse.data);

      try {
        const historyResponse = await getWorkoutHistory(userId);

        setHistory(
          historyResponse.data.workoutHistory || []
        );
      } catch (historyError) {
        console.error("History API error:", historyError);
        setHistory([]);
      }
    } catch (err) {
      console.error("Dashboard API error:", err);

      setError(
        err.response?.data?.error ||
        "Unable to connect to the backend. Please check whether the server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [userId]);

  const formatNumber = (value) => {
    return Number(value || 0).toLocaleString("en-IN");
  };

  if (loading) {
    return (
      <div className="loading">
        <RefreshCw className="spin" size={30} />
        <p>Loading your fitness dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Dashboard unavailable</h2>
        <p>{error}</p>
        <button onClick={loadDashboard}>
          Try Again
        </button>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Workouts",
      value: formatNumber(stats.totalWorkouts),
      icon: Dumbbell,
      color: "purple",
      subtitle: `${stats.totalSessions} total sessions`,
    },
    {
      title: "Calories Burned",
      value: formatNumber(stats.totalCaloriesBurned),
      icon: Flame,
      color: "orange",
      subtitle: "Total calories",
    },
    {
      title: "Exercise Volume",
      value: formatNumber(stats.totalExerciseVolume),
      icon: Activity,
      color: "blue",
      subtitle: "Weight × sets × reps",
    },
    {
      title: "Completion Rate",
      value: `${stats.completionPercentage}%`,
      icon: Target,
      color: "green",
      subtitle: "Completed sessions",
    },
  ];

  return (
    <main className="main-content">


        <header className="topbar">
          <div>
            <h2>Dashboard</h2>
            <p>Welcome back! Here's your fitness overview.</p>
          </div>

          <button
            className="refresh-btn"
            onClick={loadDashboard}
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </header>

        {/* Statistics */}

        <section className="stats-grid">

          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div className="stat-card" key={card.title}>

                <div className={`stat-icon ${card.color}`}>
                  <Icon size={24} />
                </div>

                <p className="stat-title">
                  {card.title}
                </p>

                <h2>{card.value}</h2>

                <p className="stat-subtitle">
                  {card.subtitle}
                </p>

              </div>
            );
          })}

        </section>

        {/* Today's activity */}

        <section className="today-section">

          <div className="section-heading">
            <h3>Today's Activity</h3>
            <CalendarDays size={21} />
          </div>

          <div className="today-grid">

            <div className="today-card">
              <Flame size={25} color="#f97316" />
              <div>
                <h2>
                  {formatNumber(stats.today.caloriesBurned)}
                </h2>
                <p>Calories burned today</p>
              </div>
            </div>

            <div className="today-card">
              <Dumbbell size={25} color="#6366f1" />
              <div>
                <h2>
                  {formatNumber(stats.today.workoutCount)}
                </h2>
                <p>Workouts today</p>
              </div>
            </div>

          </div>

        </section>

        {/* Recent workouts */}

        <section className="history-section">

          <div className="section-heading">
            <h3>Recent Workouts</h3>
            <History size={21} />
          </div>

          {history.length === 0 ? (
            <div className="empty-state">
              No workout history available.
            </div>
          ) : (

            <div className="table-wrapper">

              <table>
                <thead>
                  <tr>
                    <th>Workout Plan</th>
                    <th>Date</th>
                    <th>Calories</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {history.slice(0, 5).map((workout) => (

                    <tr key={workout.sessionId}>

                      <td>
                        {workout.planName || "Workout"}
                      </td>

                      <td>{workout.date || "-"}</td>

                      <td>
                        {formatNumber(workout.caloriesBurned)}
                      </td>

                      <td>
                        <span
                          className={`status ${String(
                            workout.status || ""
                          ).toLowerCase()}`}
                        >
                          {workout.status}
                        </span>
                      </td>

                    </tr>

                  ))}
                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>
  );
}

export default Dashboard;
