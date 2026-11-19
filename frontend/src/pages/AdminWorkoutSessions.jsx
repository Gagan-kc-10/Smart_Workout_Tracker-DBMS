
import { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Activity,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./AdminWorkoutTables.css";

function AdminWorkoutSessions() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const itemsPerPage = 10;

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/workouts/sessions");
      setSessions(response.data.sessions || []);
      setPage(1);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to load workout sessions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const filteredSessions = sessions.filter((session) => {
    const value = search.toLowerCase();

    return (
      String(session.Session_ID).includes(value) ||
      String(session.User_ID).includes(value) ||
      (session.User_Name || "").toLowerCase().includes(value) ||
      (session.Plan_Name || "").toLowerCase().includes(value) ||
      (session.Session_Status || "").toLowerCase().includes(value)
    );
  });

  const totalPages = Math.ceil(
    filteredSessions.length / itemsPerPage
  );

  const currentSessions = filteredSessions.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "aw-status-completed";
      case "in progress":
        return "aw-status-progress";
      case "planned":
        return "aw-status-planned";
      case "cancelled":
      case "inactive":
        return "aw-status-inactive";
      default:
        return "aw-status-default";
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const value = new Date(date);
    return Number.isNaN(value.getTime())
      ? "—"
      : value.toLocaleDateString("en-IN");
  };

  const formatTime = (time) => {
    if (!time) return "—";
    return String(time).slice(0, 8);
  };

  return (
    <div className="aw-table-page">
      <div className="aw-table-header">
        <div>
          <button
            className="aw-back-btn"
            onClick={() => navigate("/admin/workouts")}
          >
            <ArrowLeft size={16} />
            Workout Management
          </button>

          <div className="aw-table-title">
            <div className="aw-table-title-icon blue">
              <Activity size={25} />
            </div>

            <div>
              <h1>Workout Sessions</h1>
              <p>Monitor workout activity across all registered users.</p>
            </div>
          </div>
        </div>

        <button
          className="aw-table-refresh"
          onClick={fetchSessions}
          disabled={loading}
        >
          <RefreshCw size={16} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="aw-table-summary">
        <div>
          <span>Total Workout Sessions</span>
          <h2>{loading ? "..." : sessions.length}</h2>
        </div>

        <div>
          <span>Matching Results</span>
          <h2>{loading ? "..." : filteredSessions.length}</h2>
        </div>
      </div>

      {error && (
        <div className="aw-table-error">
          {error}
          <button onClick={fetchSessions}>Try Again</button>
        </div>
      )}

      <section className="aw-data-panel">
        <div className="aw-data-panel-header">
          <div>
            <h2>All Workout Sessions</h2>
            <p>Search and review user workout activity.</p>
          </div>

          <div className="aw-table-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by user, session, plan or status..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        {loading ? (
          <div className="aw-table-message">
            Loading workout sessions...
          </div>
        ) : !error ? (
          <>
            <div className="aw-table-scroll">
              <table className="aw-data-table">
                <thead>
                  <tr>
                    <th>Session ID</th>
                    <th>User</th>
                    <th>Workout Plan</th>
                    <th>Session Date</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Calories</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {currentSessions.length > 0 ? (
                    currentSessions.map((session) => (
                      <tr key={session.Session_ID}>
                        <td className="aw-id-cell">
                          #{session.Session_ID}
                        </td>

                        <td>
                          <strong>{session.User_Name}</strong>
                          <small>User ID: {session.User_ID}</small>
                        </td>

                        <td>
                          {session.Plan_Name || "Independent Workout"}
                        </td>

                        <td>{formatDate(session.Session_Date)}</td>
                        <td>{formatTime(session.Start_Time)}</td>
                        <td>{formatTime(session.End_Time)}</td>

                        <td className="aw-calories-cell">
                          {Number(session.Calories_Burned || 0).toFixed(2)}
                          <small>kcal</small>
                        </td>

                        <td>
                          <span className={`aw-status ${getStatusClass(session.Session_Status)}`}>
                            {session.Session_Status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="aw-empty-cell">
                        No matching workout sessions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="aw-table-footer">
              <span>
                Showing{" "}
                {filteredSessions.length === 0
                  ? 0
                  : (page - 1) * itemsPerPage + 1}
                {" - "}
                {Math.min(
                  page * itemsPerPage,
                  filteredSessions.length
                )}
                {" of "}
                {filteredSessions.length} sessions
              </span>

              <div className="aw-pagination">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                >
                  Previous
                </button>

                <span>
                  Page {page} of {Math.max(totalPages, 1)}
                </span>

                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages || totalPages === 0}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}

export default AdminWorkoutSessions;
