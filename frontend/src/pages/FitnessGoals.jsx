
import { useEffect, useState } from "react";
import {
  Target,
  TrendingUp,
  Scale,
  CalendarDays,
  CheckCircle,
  Activity,
} from "lucide-react";

import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function FitnessGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { user } = useAuth();
  const userId = user?.User_ID;

  useEffect(() => {
    const fetchGoals = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        setError("");

        const response = await API.get(`/dashboard/${userId}/goals`);
        setGoals(response.data.goals || []);
      } catch (err) {
        console.error("Fitness goals error:", err);
        setError("Unable to load fitness goals.");
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [userId]);

  if (loading) return <h2>Loading fitness goals...</h2>;
  if (error) return <p>{error}</p>;

  return (
    <div className="page-container fitness-goals-page">
      <div className="goals-page-header">
        <div>
          <h1>Fitness Goals</h1>
          <p>Track your fitness targets and monitor your progress.</p>
        </div>

        <div className="goals-total">
          <Target size={22} />
          <div>
            <strong>{goals.length}</strong>
            <span>Total Goals</span>
          </div>
        </div>
      </div>

      {goals.length === 0 ? (
        <div className="goals-empty">
          <Target size={42} />
          <h3>No Fitness Goals Yet</h3>
          <p>Your fitness goals will appear here.</p>
        </div>
      ) : (
        <div className="goals-list">
          {goals.map((goal) => {
            const progress = Math.min(
              100,
              Math.max(0, Number(goal.progressPercentage) || 0)
            );

            return (
              <article className="goal-card" key={goal.goalId}>
                <div className="goal-card-top">
                  <div className="goal-title">
                    <div className="goal-icon">
                      <Target size={24} />
                    </div>

                    <div>
                      <h2>{goal.goalType}</h2>
                      <p>{goal.progressStatus}</p>
                    </div>
                  </div>

                  <span className="goal-status">
                    {goal.goalStatus}
                  </span>
                </div>

                <div className="goal-stats">
                  <div className="goal-stat">
                    <div className="stat-icon target-icon">
                      <Target size={20} />
                    </div>
                    <span>Target</span>
                    <strong>
                      {goal.targetValue} {goal.unit}
                    </strong>
                  </div>

                  <div className="goal-stat">
                    <div className="stat-icon current-icon">
                      <Scale size={20} />
                    </div>
                    <span>Current</span>
                    <strong>
                      {goal.currentValue !== null
                        ? `${goal.currentValue} ${goal.unit}`
                        : "Not recorded"}
                    </strong>
                  </div>

                  <div className="goal-stat">
                    <div className="stat-icon remaining-icon">
                      <TrendingUp size={20} />
                    </div>
                    <span>Remaining</span>
                    <strong>
                      {goal.remainingValue !== null
                        ? `${goal.remainingValue} ${goal.unit}`
                        : "Not available"}
                    </strong>
                  </div>
                </div>

                <div className="goal-progress-section">
                  <div className="goal-progress-heading">
                    <span>Overall Progress</span>
                    <strong>
                      {goal.progressPercentage ?? "N/A"}%
                    </strong>
                  </div>

                  <div
                    className="goal-progress-track"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    <div
                      className="goal-progress-value"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="goal-footer">
                  <div>
                    <Activity size={18} />
                    <span>Status: {goal.goalStatus}</span>
                  </div>

                  <div>
                    <CalendarDays size={18} />
                    <span>
                      Target Date:{" "}
                      {new Date(goal.targetDate).toLocaleDateString(
                        "en-IN",
                        { timeZone: "UTC" }
                      )}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default FitnessGoals;
