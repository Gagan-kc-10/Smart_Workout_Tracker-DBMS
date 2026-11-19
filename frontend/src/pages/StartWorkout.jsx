
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Dumbbell,
  Flame,
  Save,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

import API, { getWorkoutPlans } from "../services/api";

function StartWorkout() {
  const location = useLocation();
  const navigate = useNavigate();

  const { sessionId, userId, planId } = location.state || {};

  const [plan, setPlan] = useState(null);
  const [exerciseData, setExerciseData] = useState({});
  const [savedExercises, setSavedExercises] = useState([]);

  // Store backend calorie estimates for each exercise
  const [exerciseCalories, setExerciseCalories] = useState({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [completing, setCompleting] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Calculate total estimated calories from saved exercises
  const totalEstimatedCalories = Object.values(exerciseCalories)
    .filter((item) => item.available)
    .reduce((total, item) => total + item.calories, 0);

  const unavailableCount = Object.values(exerciseCalories)
    .filter((item) => !item.available).length;

  // Load selected workout plan
  useEffect(() => {
    if (!sessionId || !userId || !planId) {
      setError(
        "Workout session details are missing. Please start a workout from Workout Plans."
      );
      setLoading(false);
      return;
    }

    const loadPlan = async () => {
      try {
        const response = await getWorkoutPlans(userId);

        const selectedPlan = response.data.plans.find(
          (item) => Number(item.planId) === Number(planId)
        );

        if (!selectedPlan) {
          setError("Selected workout plan not found.");
          return;
        }

        setPlan(selectedPlan);

        const initialData = {};

        selectedPlan.exercises.forEach((exercise) => {
          initialData[exercise.exerciseId] = {
            setsCompleted: exercise.targetSets,
            repsCompleted: exercise.targetReps,
            weightUsed: "",
            duration: "",
          };
        });

        setExerciseData(initialData);

      } catch (err) {
        console.error("Plan loading error:", err);

        setError(
          err.response?.data?.error ||
          "Unable to load workout exercises."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, [sessionId, userId, planId]);

  // Update exercise input
  const handleInputChange = (exerciseId, field, value) => {
    setExerciseData((previous) => ({
      ...previous,
      [exerciseId]: {
        ...previous[exerciseId],
        [field]: value,
      },
    }));
  };

  // Save exercise details
  const saveExercise = async (exercise) => {
    try {
      setSaving(exercise.exerciseId);
      setError("");
      setMessage("");

      const data = exerciseData[exercise.exerciseId];

      const sets = Number(data.setsCompleted);
      const reps = Number(data.repsCompleted);

      if (
        data.setsCompleted === "" ||
        data.repsCompleted === "" ||
        !Number.isInteger(sets) ||
        !Number.isInteger(reps) ||
        sets < 0 ||
        reps < 0
      ) {
        setError("Enter valid completed sets and reps.");
        return;
      }

      if (
        data.weightUsed !== "" &&
        (!Number.isFinite(Number(data.weightUsed)) ||
          Number(data.weightUsed) < 0)
      ) {
        setError("Enter a valid weight.");
        return;
      }

      if (
        data.duration !== "" &&
        (!Number.isInteger(Number(data.duration)) ||
          Number(data.duration) <= 0)
      ) {
        setError("Duration must be a positive integer in minutes.");
        return;
      }

      // Convert duration from minutes to seconds for backend
      const durationInSeconds =
        data.duration === "" ? null : Number(data.duration) * 60;

      const response = await API.post(
        `/workouts/${sessionId}/exercises`,
        {
          userId,
          exerciseId: exercise.exerciseId,
          setsCompleted: sets,
          repsCompleted: reps,
          weightUsed:
            data.weightUsed === "" ? null : Number(data.weightUsed),
          duration: durationInSeconds,
        }
      );

      const result = response.data;
      console.log("API RESPONSE STATUS:", response.status);

console.log(
  "FULL EXERCISE API RESPONSE:",
  JSON.stringify(response.data, null, 2)
);

      // Store calorie estimate returned by backend
      setExerciseCalories((previous) => ({
        ...previous,
        [exercise.exerciseId]: {
          available: result.estimateAvailable === true,
          calories: result.estimateAvailable === true
            ? Number(result.caloriesEstimated || 0)
            : 0,
          metValue: result.metValue,
          metDescription: result.metDescription,
        },
      }));

      setSavedExercises((previous) => [
        ...previous,
        exercise.exerciseId,
      ]);

      setMessage(`${exercise.exerciseName} saved successfully!`);

      console.log("Exercise saved:", result);

    } catch (err) {
      console.error("Save exercise error:", err);

      setError(
        err.response?.data?.error ||
        "Unable to save exercise details."
      );
    } finally {
      setSaving(null);
    }
  };

  // Complete workout
  const completeWorkout = async () => {
    try {
      if (savedExercises.length !== plan.exercises.length) {
        setError("Please save all exercises before completing the workout.");
        return;
      }

      setCompleting(true);
      setError("");
      setMessage("");

      // Backend calculates the final total from saved MySQL records
      const response = await API.post(
        `/workouts/${sessionId}/complete`,
        {
          userId,
        }
      );

      setMessage("Workout completed successfully!");

      console.log("Workout completed:", response.data);

      // Navigate to dashboard after successful completion
      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (err) {
      console.error("Complete workout error:", err);

      setError(
        err.response?.data?.error ||
        "Unable to complete workout."
      );
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <RefreshCw className="spin" size={30} />
        <p>Loading workout...</p>
      </div>
    );
  }

  if (error && !plan) {
    return (
      <div className="error-container">
        <h2>Workout unavailable</h2>
        <p>{error}</p>

        <button onClick={() => navigate("/workout-plans")}>
          Back to Workout Plans
        </button>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <main className="main-content">

      {/* Header */}
      <header className="topbar">
        <div>
          <h2>Start Workout</h2>
          <p>Track your exercise performance.</p>
        </div>

        <button
          className="refresh-btn"
          onClick={() => navigate("/workout-plans")}
        >
          <ArrowLeft size={17} />
          Back
        </button>
      </header>

      {/* Workout information */}
      <section className="history-section">
        <h2>{plan.planName}</h2>
        <p>{plan.planType} Training</p>

        <p>
          Session ID: <strong>{sessionId}</strong>
        </p>

        <p>
          Total Exercises: <strong>{plan.exercises.length}</strong>
        </p>
      </section>

      {/* Messages */}
      {error && (
        <div className="error-container">
          {error}
        </div>
      )}

      {message && (
        <div className="plan-message">
          {message}
        </div>
      )}

      {/* Exercise list */}
      <section className="history-section">

        <div className="section-heading">
          <h3>Today's Exercises</h3>
          <Dumbbell size={22} />
        </div>

        {plan.exercises.map((exercise) => {
          const data = exerciseData[exercise.exerciseId];

          const isSaved = savedExercises.includes(
            exercise.exerciseId
          );

          const calorieInfo = exerciseCalories[exercise.exerciseId];

          return (
            <article
              className="exercise-item"
              key={exercise.exerciseId}
            >

              <div className="exercise-title">
                <Flame size={19} />
                <strong>{exercise.exerciseName}</strong>

                {isSaved && (
                  <span className="plan-status active">
                    Saved
                  </span>
                )}
              </div>

              <p className="exercise-meta">
                Day {exercise.dayNumber}
                {" · "}
                Target: {exercise.targetSets} Sets
                {" · "}
                {exercise.targetReps} Reps
              </p>

              <div className="workout-input-grid">

                <label>
                  Sets Completed
                  <input
                    type="number"
                    min="0"
                    value={data.setsCompleted}
                    disabled={isSaved}
                    onChange={(e) =>
                      handleInputChange(
                        exercise.exerciseId,
                        "setsCompleted",
                        e.target.value
                      )
                    }
                  />
                </label>

                <label>
                  Reps Completed
                  <input
                    type="number"
                    min="0"
                    value={data.repsCompleted}
                    disabled={isSaved}
                    onChange={(e) =>
                      handleInputChange(
                        exercise.exerciseId,
                        "repsCompleted",
                        e.target.value
                      )
                    }
                  />
                </label>

                <label>
                  Weight Used (kg)
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="Enter weight"
                    value={data.weightUsed}
                    disabled={isSaved}
                    onChange={(e) =>
                      handleInputChange(
                        exercise.exerciseId,
                        "weightUsed",
                        e.target.value
                      )
                    }
                  />
                </label>

                <label>
                  Duration (minutes)
                  <input
                    type="number"
                    min="1"
                    placeholder="Enter duration in minutes"
                    value={data.duration}
                    disabled={isSaved}
                    onChange={(e) =>
                      handleInputChange(
                        exercise.exerciseId,
                        "duration",
                        e.target.value
                      )
                    }
                  />
                </label>

              </div>

              <button
                className="start-plan-btn"
                disabled={isSaved || saving !== null}
                onClick={() => saveExercise(exercise)}
              >
                {isSaved ? (
                  <>
                    <CheckCircle size={17} />
                    Exercise Saved
                  </>
                ) : saving === exercise.exerciseId ? (
                  <>
                    <RefreshCw size={17} className="spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    Save Exercise
                  </>
                )}
              </button>

              {/* Individual exercise calorie estimate */}
              {calorieInfo && (
                <p className="exercise-meta">
                  <Flame size={16} />
                  {calorieInfo.available
                    ? `Estimated Calories: ${calorieInfo.calories.toFixed(2)} kcal`
                    : "Calorie estimate unavailable for this exercise or its recorded details."}
                </p>
              )}

            </article>
          );
        })}

      </section>

      {/* Complete workout and calorie summary */}
      <section className="history-section">

        <div className="section-heading">
          <h3>Workout Calorie Summary</h3>
          <Flame size={22} />
        </div>

        <h2>
          {totalEstimatedCalories.toFixed(2)} kcal
        </h2>

        <p>
          Total estimated calories from exercises with available estimates.
        </p>

        {unavailableCount > 0 && (
          <p className="exercise-meta">
            Estimates unavailable for {unavailableCount} exercise(s).
            The displayed total is partial.
          </p>
        )}

        <p>
          Exercises saved: {savedExercises.length} / {plan.exercises.length}
        </p>

        <button
          className="start-plan-btn"
          onClick={completeWorkout}
          disabled={
            completing ||
            savedExercises.length !== plan.exercises.length
          }
        >
          {completing ? (
            <>
              <RefreshCw size={17} className="spin" />
              Completing...
            </>
          ) : (
            <>
              <CheckCircle size={17} />
              Complete Workout
            </>
          )}
        </button>

      </section>

    </main>
  );
}

export default StartWorkout;
