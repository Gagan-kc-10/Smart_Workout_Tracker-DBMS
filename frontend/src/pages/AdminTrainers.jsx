
import { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  RefreshCw
} from "lucide-react";
import api from "../services/api";

function AdminTrainers() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const trainersPerPage = 10;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const fetchTrainers = async () => {
    try {
      setLoading(true);

      const response = await api.get("/admin/trainers");
      setTrainers(response.data.trainers || []);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load trainers"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateTrainer = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setCreating(true);

    try {
      const response = await api.post("/admin/trainers", formData);

      setSuccess(
        response.data.message || "Trainer created successfully."
      );

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      });

      setSearchTerm("");
      setCurrentPage(1);

      await fetchTrainers();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create trainer"
      );
    } finally {
      setCreating(false);
    }
  };

  // Search trainers
  const filteredTrainers = trainers.filter((trainer) => {
    const search = searchTerm.toLowerCase();

    return (
      String(trainer.User_ID).includes(search) ||
      `${trainer.First_Name} ${trainer.Last_Name}`
        .toLowerCase()
        .includes(search) ||
      trainer.Email.toLowerCase().includes(search)
    );
  });

  // Pagination
  const totalPages = Math.ceil(
    filteredTrainers.length / trainersPerPage
  );

  const startIndex = (currentPage - 1) * trainersPerPage;

  const currentTrainers = filteredTrainers.slice(
    startIndex,
    startIndex + trainersPerPage
  );

  return (
    <div className="admin-trainers-page">

      {/* Header */}
      <div className="admin-trainers-header">
        <div>
          <h1>Trainer Management</h1>
          <p>Register and manage fitness trainers.</p>
        </div>

        <button
          className="admin-trainers-refresh"
          onClick={fetchTrainers}
          disabled={loading}
        >
          <RefreshCw size={17} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Trainer Summary */}
      <div className="admin-trainers-summary">
        <div className="admin-trainers-summary-icon">
          <Users size={25} />
        </div>

        <div>
          <p>Total Registered Trainers</p>
          <h2>{loading ? "..." : trainers.length}</h2>
        </div>
      </div>

      {/* Create Trainer Form */}
      <section className="admin-trainer-form-section">

        <div className="admin-trainer-section-heading">
          <div className="admin-trainer-form-icon">
            <UserPlus size={23} />
          </div>

          <div>
            <h2>Create New Trainer</h2>
            <p>Enter the trainer's details to register a new account.</p>
          </div>
        </div>

        <form
          className="admin-trainer-form"
          onSubmit={handleCreateTrainer}
        >
          <div className="admin-trainer-form-grid">

            <div className="admin-trainer-field">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
                required
              />
            </div>

            <div className="admin-trainer-field">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                required
              />
            </div>

            <div className="admin-trainer-field">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                required
              />
            </div>

            <div className="admin-trainer-field">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                minLength={8}
                required
              />
            </div>

          </div>

          <button
            type="submit"
            className="admin-create-trainer-btn"
            disabled={creating}
          >
            <UserPlus size={17} />
            {creating ? "Creating Trainer..." : "Create Trainer"}
          </button>
        </form>
      </section>

      {/* Messages */}
      {success && (
        <div className="admin-trainer-success">
          {success}
        </div>
      )}

      {error && (
        <div className="admin-trainer-error">
          {error}
          <button onClick={fetchTrainers}>Try Again</button>
        </div>
      )}

      {/* Registered Trainers */}
      <section className="admin-trainers-list-section">

        <div className="admin-trainers-list-header">
          <div>
            <h2>Registered Trainers</h2>
            <p>View and search registered trainer accounts.</p>
          </div>

          <div className="admin-trainers-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search trainers..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {loading && (
          <p className="admin-trainers-message">
            Loading trainers...
          </p>
        )}

        {!loading && !error && (
          <>
            <div className="admin-trainers-table-wrapper">
              <table className="admin-trainers-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email Address</th>
                  </tr>
                </thead>

                <tbody>
                  {currentTrainers.length > 0 ? (
                    currentTrainers.map((trainer) => (
                      <tr key={trainer.User_ID}>
                        <td>#{trainer.User_ID}</td>
                        <td>{trainer.First_Name}</td>
                        <td>{trainer.Last_Name}</td>
                        <td>{trainer.Email}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="admin-trainers-empty"
                      >
                        {searchTerm
                          ? "No trainers match your search."
                          : "No trainers registered yet."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="admin-trainers-footer">
              <span>
                Showing{" "}
                {filteredTrainers.length === 0 ? 0 : startIndex + 1}
                {" - "}
                {Math.min(
                  startIndex + trainersPerPage,
                  filteredTrainers.length
                )}
                {" of "}
                {filteredTrainers.length} trainers
              </span>

              <div className="admin-trainers-pagination">
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

      </section>
    </div>
  );
}

export default AdminTrainers;
