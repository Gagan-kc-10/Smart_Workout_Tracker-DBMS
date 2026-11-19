
import { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  ClipboardList,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./AdminWorkoutTables.css";

function AdminWorkoutPlans() {
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const itemsPerPage = 10;

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/workouts/plans");
      setPlans(response.data.plans || []);
      setPage(1);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to load workout plans."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const filteredPlans = plans.filter((plan) => {
    const value = search.toLowerCase();

    return (
      String(plan.Plan_ID).includes(value) ||
      String(plan.User_ID).includes(value) ||
      (plan.User_Name || "").toLowerCase().includes(value) ||
      (plan.Plan_Name || "").toLowerCase().includes(value) ||
      (plan.Plan_Type || "").toLowerCase().includes(value) ||
      (plan.Plan_Status || "").toLowerCase().includes(value)
    );
  });

  const totalPages = Math.ceil(filteredPlans.length / itemsPerPage);

  const currentPlans = filteredPlans.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "aw-status-active";
      case "completed":
        return "aw-status-completed";
      case "inactive":
      case "cancelled":
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
            <div className="aw-table-title-icon purple">
              <ClipboardList size={25} />
            </div>

            <div>
              <h1>Workout Plans</h1>
              <p>View and monitor all users' workout plans.</p>
            </div>
          </div>
        </div>

        <button
          className="aw-table-refresh"
          onClick={fetchPlans}
          disabled={loading}
        >
          <RefreshCw size={16} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="aw-table-summary">
        <div>
          <span>Total Workout Plans</span>
          <h2>{loading ? "..." : plans.length}</h2>
        </div>
        <div>
          <span>Matching Results</span>
          <h2>{loading ? "..." : filteredPlans.length}</h2>
        </div>
      </div>

      {error && (
        <div className="aw-table-error">
          {error}
          <button onClick={fetchPlans}>Try Again</button>
        </div>
      )}

      <section className="aw-data-panel">
        <div className="aw-data-panel-header">
          <div>
            <h2>All Workout Plans</h2>
            <p>Search and review registered workout plans.</p>
          </div>

          <div className="aw-table-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by user, plan, type or status..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        {loading ? (
          <div className="aw-table-message">Loading workout plans...</div>
        ) : !error ? (
          <>
            <div className="aw-table-scroll">
              <table className="aw-data-table">
                <thead>
                  <tr>
                    <th>Plan ID</th>
                    <th>User</th>
                    <th>Plan Name</th>
                    <th>Plan Type</th>
                    <th>Exercises</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {currentPlans.length > 0 ? (
                    currentPlans.map((plan) => (
                      <tr key={plan.Plan_ID}>
                        <td className="aw-id-cell">#{plan.Plan_ID}</td>
                        <td>
                          <strong>{plan.User_Name}</strong>
                          <small>User ID: {plan.User_ID}</small>
                        </td>
                        <td>{plan.Plan_Name}</td>
                        <td>{plan.Plan_Type}</td>
                        <td>
                          <span className="aw-exercise-count">
                            {plan.Total_Exercises}
                          </span>
                        </td>
                        <td>{formatDate(plan.Start_Date)}</td>
                        <td>{formatDate(plan.End_Date)}</td>
                        <td>
                          <span className={`aw-status ${getStatusClass(plan.Plan_Status)}`}>
                            {plan.Plan_Status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="aw-empty-cell">
                        No matching workout plans found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="aw-table-footer">
              <span>
                Showing{" "}
                {filteredPlans.length === 0
                  ? 0
                  : (page - 1) * itemsPerPage + 1}
                {" - "}
                {Math.min(page * itemsPerPage, filteredPlans.length)}
                {" of "}
                {filteredPlans.length} plans
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

export default AdminWorkoutPlans;
