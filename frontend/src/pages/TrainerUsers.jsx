
import { useEffect, useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Users,
  History,
  Activity,
  ClipboardList,
  UserRound,
} from "lucide-react";
import api from "../services/api";

function DataTable({ data, emptyMessage }) {
  if (!data || data.length === 0) {
    return <p>{emptyMessage}</p>;
  }

  const columns = Object.keys(data[0]);

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column.replaceAll("_", " ")}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column}>
                  {item[column] === null || item[column] === undefined
                    ? "-"
                    : typeof item[column] === "object"
                    ? JSON.stringify(item[column])
                    : String(item[column])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    
  );
}

function TrainerUsers() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [history, setHistory] = useState([]);
  const [progress, setProgress] = useState([]);
  const [plans, setPlans] = useState([]);

  const [search, setSearch] = useState("");
const [currentPage, setCurrentPage] = useState(1);

const usersPerPage = 5;

const filteredUsers = users.filter((item) => {
  const searchValue = search.toLowerCase();

  return (
    String(item.User_ID).includes(searchValue) ||
    `${item.First_Name} ${item.Last_Name}`
      .toLowerCase()
      .includes(searchValue) ||
    item.Email.toLowerCase().includes(searchValue) ||
    (item.Fitness_Level || "").toLowerCase().includes(searchValue)
  );
});

const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

const paginatedUsers = filteredUsers.slice(
  (currentPage - 1) * usersPerPage,
  currentPage * usersPerPage
);

  const [activeTab, setActiveTab] = useState("history");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState("");

  // Load users assigned to this trainer
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/trainer/assigned-users");

        const assignedUsers = response.data.users || [];
        setUsers(assignedUsers);

        
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load assigned users."
        );
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // Load details whenever a different user is selected
  useEffect(() => {
    if (!selectedUser) return;

    const fetchUserDetails = async () => {
      setLoadingDetails(true);
      setError("");

      setHistory([]);
      setProgress([]);
      setPlans([]);

      const userId = selectedUser.User_ID;

      try {
        const [historyResponse, progressResponse, plansResponse] =
          await Promise.all([
            api.get(`/trainer/users/${userId}/workout-history`),
            api.get(`/trainer/users/${userId}/fitness-progress`),
            api.get(`/trainer/users/${userId}/workout-plans`),
          ]);

        setHistory(
          historyResponse.data.history ||
            historyResponse.data.workouts ||
            historyResponse.data.sessions ||
            []
        );

        setProgress(
          progressResponse.data.progress ||
            progressResponse.data.records ||
            []
        );

        setPlans(
          plansResponse.data.plans ||
            plansResponse.data.workoutPlans ||
            []
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load this user's details."
        );
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchUserDetails();
  }, [selectedUser]);

  return (
    <div className="trainer-users-page">
      <div className="dashboard-header">
        <div>
          <h1>My Users</h1>
          <p>View and manage your assigned users.</p>
        </div>
      </div>

      {loadingUsers && <p>Loading assigned users...</p>}

      {error && <p className="error-message">{error}</p>}

      {!loadingUsers && users.length === 0 && (
        
        <p>No users have been assigned to you yet.</p>
        
      )}

      {!loadingUsers && users.length > 0 && (
        <>
        <div className="trainer-users-summary">
  <div className="trainer-users-summary-icon">
    <Users size={25} />
  </div>
  <div>
    <p>Total Assigned Users</p>
    <h2>{users.length}</h2>
  </div>
</div>
          <div className="dashboard-section">
            <h2>
              <Users size={20} /> Assigned Users
            </h2>
            <div className="trainer-search">
  <Search size={18} />
  <input
    type="text"
    placeholder="Search by name, email, user ID or fitness level..."
    value={search}
    onChange={(e) => {
      setSearch(e.target.value);
      setCurrentPage(1);
    }}
  />
</div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Fitness Level</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedUsers.map((item) => (
                    <tr key={item.User_ID}>
                      <td>{item.User_ID}</td>
                      <td>
                        {item.First_Name} {item.Last_Name}
                      </td>
                      <td>{item.Email}</td>
                      <td>{item.Fitness_Level || "Not specified"}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUser(item);
                            
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 0 && (
  <div className="trainer-users-pagination">
    <span>
      Showing {Math.min((currentPage - 1) * usersPerPage + 1, filteredUsers.length)}
      {" - "}
      {Math.min(currentPage * usersPerPage, filteredUsers.length)}
      {" of "}
      {filteredUsers.length} users
    </span>

    <div className="trainer-pagination-buttons">
      <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
      >
        <ChevronLeft size={17} />
        Previous
      </button>

      <span className="trainer-page-number">
        {currentPage} / {totalPages}
      </span>

      <button
        onClick={() =>
          setCurrentPage((prev) => Math.min(prev + 1, totalPages))
        }
        disabled={currentPage === totalPages}
      >
        Next
        <ChevronRight size={17} />
      </button>
    </div>
  </div>
)}
            </div>
            
          </div>

          {selectedUser && (
            <div className="dashboard-section">
              <h2>
                <UserRound size={20} /> Selected User
              </h2>

              <p>
                <strong>Name:</strong>{" "}
                {selectedUser.First_Name} {selectedUser.Last_Name}
              </p>

              <p>
                <strong>Email:</strong> {selectedUser.Email}
              </p>

              <p>
                <strong>Fitness Level:</strong>{" "}
                {selectedUser.Fitness_Level || "Not specified"}
              </p>

              <div className="trainer-tabs">
                <button
                  className={activeTab === "history" ? "active" : ""}
                  onClick={() => setActiveTab("history")}
                >
                  <History size={16} /> Workout History
                </button>

                <button
                  className={activeTab === "progress" ? "active" : ""}
                  onClick={() => setActiveTab("progress")}
                >
                  <Activity size={16} /> Fitness Progress
                </button>

                <button
                  className={activeTab === "plans" ? "active" : ""}
                  onClick={() => setActiveTab("plans")}
                >
                  <ClipboardList size={16} /> Workout Plans
                </button>
              </div>

              {loadingDetails ? (
                <p>Loading user details...</p>
              ) : (
                <>
                  {activeTab === "history" && (
                    <>
                      <h3>Workout History</h3>
                      <DataTable
                        data={history}
                        emptyMessage="No workout history available."
                      />
                    </>
                  )}

                  {activeTab === "progress" && (
                    <>
                      <h3>Fitness Progress</h3>
                      <DataTable
                        data={progress}
                        emptyMessage="No fitness progress records available."
                      />
                    </>
                  )}

                  {activeTab === "plans" && (
                    <>
                      <h3>Workout Plans</h3>
                      <DataTable
                        data={plans}
                        emptyMessage="No workout plans available."
                      />
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
    
  );
}

export default TrainerUsers;
