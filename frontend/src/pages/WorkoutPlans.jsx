
import { useEffect, useState } from "react";
import {
  Dumbbell,
  CalendarDays,
  Clock,
  Target,
  Flame,
  Play,
  RefreshCw,
  CheckCircle,
} from "lucide-react";

import API, { getWorkoutPlans } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function WorkoutPlans() {
  const { user } = useAuth();
  const userId = user?.User_ID;

  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startingPlan, setStartingPlan] = useState(null);
  const [message, setMessage] = useState("");

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getWorkoutPlans(userId);

      setPlans(response.data.plans || []);
    } catch (err) {
      console.error("Workout plans error:", err);

      setError(
        err.response?.data?.error ||
        "Unable to load workout plans."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  if (userId) {
    loadPlans();
  }
}, [userId]);

  const startWorkout = async (planId) => {
    try {
      setStartingPlan(planId);
      setMessage("");

        const response = await API.post("/workouts/start", {
            userId,
            planId,
        });

        const sessionId = response.data.sessionId;

        navigate("/start-workout", {
            state: {
            sessionId,
            userId,
            planId,
            },
        });
    } catch (err) {
        console.error("Start workout error:", err);
        
      setMessage(
        err.response?.data?.error ||
        "Unable to start workout."
      );
    } finally {
      setStartingPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <RefreshCw className="spin" size={30} />
        <p>Loading workout plans...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Workout Plans unavailable</h2>
        <p>{error}</p>
        <button onClick={loadPlans}>Try Again</button>
      </div>
    );
  }

  return (
    <main className="main-content">

      <header className="topbar">
        <div>
          <h2>Workout Plans</h2>
          <p>Explore your personalized workout programs.</p>
        </div>

        <button className="refresh-btn" onClick={loadPlans}>
          <RefreshCw size={17} />
          Refresh
        </button>
      </header>

      <div className="plans-summary">
        <div>
          <Dumbbell size={25} />
          <div>
            <h2>{plans.length}</h2>
            <p>Total Workout Plans</p>
          </div>
        </div>

        <div>
          <Target size={25} />
          <div>
            <h2>
              {plans.filter(
                plan => plan.planStatus === "Active"
              ).length}
            </h2>
            <p>Active Plans</p>
          </div>
        </div>
      </div>

      {message && (
        <div className="plan-message">
          {message}
        </div>
      )}

      {plans.length === 0 ? (
        <div className="empty-state">
          No workout plans found for this user.
        </div>
      ) : (

        <section className="plans-grid">

          {plans.map(plan => (

            <article className="plan-card" key={plan.planId}>

              <div className="plan-card-header">

                <div className="plan-icon">
                  <Dumbbell size={25} />
                </div>

                <span
                  className={`plan-status ${
                    plan.planStatus.toLowerCase()
                  }`}
                >
                  {plan.planStatus}
                </span>

              </div>

              <h3>{plan.planName}</h3>

              <p className="plan-type">
                {plan.planType} Training
              </p>

              <div className="plan-details">

                <div>
                  <CalendarDays size={16} />
                  <span>
                    Starts: {new Date(plan.startDate).toLocaleDateString("en-IN", {
                      timeZone: "UTC"
                    })}
                  </span>
                </div>

                <div>
                  <Clock size={16} />
                  <span>
                    Ends: {plan.endDate
                      ? new Date(plan.endDate).toLocaleDateString("en-IN")
                      : "Not specified"}
                  </span>
                </div>

              </div>

              <div className="exercise-heading">
                <h4>Exercises</h4>
                <span>{plan.exercises.length} Exercises</span>
              </div>

              <div className="exercise-list">

                {plan.exercises.map(exercise => (

                  <div
                    className="exercise-item"
                    key={exercise.planExerciseId}
                  >

                    <div className="exercise-title">
                      <Flame size={17} />
                      <strong>{exercise.exerciseName}</strong>
                    </div>

                    <div className="exercise-meta">
                      Day {exercise.dayNumber}
                      {" · "}
                      {exercise.targetSets} Sets
                      {" · "}
                      {exercise.targetReps} Reps
                    </div>

                    <div className="exercise-extra">
                      <span>{exercise.muscleGroup}</span>
                      <span>{exercise.difficultyLevel}</span>
                    </div>

                  </div>

                ))}

              </div>

              <button
                className="start-plan-btn"
                onClick={() => startWorkout(plan.planId)}
                disabled={
                  startingPlan !== null ||
                  plan.planStatus !== "Active"
                }
              >
                {startingPlan === plan.planId ? (
                  <>
                    <RefreshCw size={17} className="spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play size={17} />
                    Start Workout
                  </>
                )}
              </button>

            </article>

          ))}

        </section>

      )}

    </main>
  );
}

export default WorkoutPlans;
