
import { useEffect, useState } from "react";
import { Users, ClipboardList, Activity } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function TrainerDashboard() {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAssignedUsers = async () => {
      try {
        const response = await api.get("/trainer/assigned-users");
        setUsers(response.data.users || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load assigned users."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedUsers();
  }, []);

  return (
    <div className="trainer-dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Trainer Dashboard</h1>
          <p>Welcome, {user?.First_Name} {user?.Last_Name}</p>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <Users size={25} />
          <h3>Assigned Users</h3>
          <h2>{loading ? "..." : users.length}</h2>
        </div>

        <div className="stat-card">
          <ClipboardList size={25} />
          <h3>Active Assignments</h3>
          <h2>
            {loading
              ? "..."
              : users.filter(
                  (item) => item.Assignment_Status === "Active"
                ).length}
          </h2>
        </div>

        <div className="stat-card">
          <Activity size={25} />
          <h3>Trainer Role</h3>
          <h2>Trainer</h2>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>My Assigned Users</h2>

        {loading && <p>Loading assigned users...</p>}

        {error && <p className="error-message">{error}</p>}

        {!loading && !error && users.length === 0 && (
          <p>No users have been assigned to you yet.</p>
        )}

        {!loading && users.length > 0 && (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Fitness Level</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {users.map((item) => (
                  <tr key={item.User_ID}>
                    <td>{item.User_ID}</td>
                    <td>
                      {item.First_Name} {item.Last_Name}
                    </td>
                    <td>{item.Email}</td>
                    <td>{item.Fitness_Level || "Not specified"}</td>
                    <td>{item.Assignment_Status || "Not specified"}</td><td>
  <span className={`trainer-status ${item.Assignment_Status?.toLowerCase()}`}>
    {item.Assignment_Status}
  </span>
</td> 
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrainerDashboard;
