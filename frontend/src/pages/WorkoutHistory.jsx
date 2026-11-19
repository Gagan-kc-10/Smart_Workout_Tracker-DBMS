
import { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function WorkoutHistory() {
  const { user } = useAuth();
  const userId = user?.User_ID;

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(history.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentHistory = history.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  useEffect(() => {
    const fetchHistory = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        setError("");

        const response = await API.get(`/workouts/history/${userId}`);
        setHistory(response.data.history || []);
        setCurrentPage(1);
      } catch (err) {
        console.error("Workout history error:", err);
        setError("Unable to load workout history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

  if (loading) return <h2>Loading workout history...</h2>;

  if (error) return <p>{error}</p>;

  return (
    <div className="page-container">
      <h1>Workout History</h1>
      <p>Your completed workout sessions.</p>

      <h3>Total Completed Workouts: {history.length}</h3>

      {history.length === 0 ? (
        <p>No completed workouts found.</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Session ID</th>
                <th>Date</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Calories Burned</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {currentHistory.map((session) => (
                <tr key={session.Session_ID}>
                  <td>{session.Session_ID}</td>
                  <td>
                    {new Date(session.Session_Date).toLocaleDateString(
                      "en-IN",
                      { timeZone: "UTC" }
                    )}
                  </td>
                  <td>{session.Start_Time}</td>
                  <td>{session.End_Time || "-"}</td>
                  <td>
                    {Number(session.Calories_Burned || 0).toFixed(2)}
                  </td>
                  <td>{session.Session_Status}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage((prev) => prev - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                  className={currentPage === index + 1 ? "active" : ""}
                >
                  {index + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default WorkoutHistory;
