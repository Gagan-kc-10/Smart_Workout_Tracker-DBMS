
import { useEffect, useState } from "react";
import { Users, Search, RefreshCw } from "lucide-react";
import api from "../services/api";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const usersPerPage = 10;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/users");
      setUsers(response.data.users || []);
      setCurrentPage(1);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Search and filter users
  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();

    return (
      String(user.User_ID).includes(search) ||
      `${user.First_Name} ${user.Last_Name}`
        .toLowerCase()
        .includes(search) ||
      user.Email.toLowerCase().includes(search) ||
      (user.Fitness_Level || "").toLowerCase().includes(search)
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(
    filteredUsers.length / usersPerPage
  );

  const startIndex = (currentPage - 1) * usersPerPage;

  const currentUsers = filteredUsers.slice(
    startIndex,
    startIndex + usersPerPage
  );

  // Fitness level styling
  const getFitnessClass = (level) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "beginner";
      case "intermediate":
        return "intermediate";
      case "advanced":
        return "advanced";
      default:
        return "unspecified";
    }
  };

  return (
    <div className="admin-users-page">

      <div className="admin-users-header">
        <div>
          <h1>User Management</h1>
          <p>View and monitor registered fitness users.</p>
        </div>

        <button
          className="admin-users-refresh"
          onClick={fetchUsers}
          disabled={loading}
        >
          <RefreshCw size={17} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="admin-users-summary">
        <div className="admin-users-summary-icon">
          <Users size={25} />
        </div>

        <div>
          <p>Total Registered Users</p>
          <h2>{loading ? "..." : users.length}</h2>
        </div>
      </div>

      <div className="admin-users-table-section">

        <div className="admin-users-table-header">
          <div>
            <h2>Registered Users</h2>
            <p>Search and view user account details.</p>
          </div>

          <div className="admin-users-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {loading && (
          <p className="admin-users-message">
            Loading users...
          </p>
        )}

        {error && (
          <div className="admin-users-error">
            {error}
            <button onClick={fetchUsers}>Try Again</button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="admin-users-table-wrapper">
              <table className="admin-users-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email Address</th>
                    <th>Fitness Level</th>
                  </tr>
                </thead>

                <tbody>
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user) => (
                      <tr key={user.User_ID}>
                        <td>#{user.User_ID}</td>
                        <td>{user.First_Name}</td>
                        <td>{user.Last_Name}</td>
                        <td>{user.Email}</td>
                        <td>
                          <span
                            className={`admin-fitness-badge ${getFitnessClass(
                              user.Fitness_Level
                            )}`}
                          >
                            {user.Fitness_Level || "Not Specified"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="admin-users-empty">
                        {searchTerm
                          ? "No users match your search."
                          : "No registered users found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="admin-users-footer">
              <span>
                Showing{" "}
                {filteredUsers.length === 0 ? 0 : startIndex + 1}
                {" - "}
                {Math.min(
                  startIndex + usersPerPage,
                  filteredUsers.length
                )}
                {" of "}
                {filteredUsers.length} users
              </span>

              <div className="admin-pagination">
                <button
                  onClick={() =>
                    setCurrentPage((page) => page - 1)
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </button>

                <span>
                  Page {currentPage} of {Math.max(totalPages, 1)}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((page) => page + 1)
                  }
                  disabled={
                    currentPage >= totalPages || totalPages === 0
                  }
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default AdminUsers;
