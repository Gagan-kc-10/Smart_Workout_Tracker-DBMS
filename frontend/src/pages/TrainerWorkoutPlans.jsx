
import { useEffect, useState } from "react";
import {
  ClipboardList,
  Plus,
  Edit,
  Trash2,
  Dumbbell,
  RefreshCw,
} from "lucide-react";
import api from "../services/api";

const exerciseOptions = [
  { id: 1, name: "Push-ups" },
  { id: 2, name: "Squats" },
  { id: 3, name: "Plank" },
  { id: 4, name: "Running" },
  { id: 5, name: "Dumbbell Bench Press" },
  { id: 6, name: "Lunges" },
  { id: 7, name: "Pull-ups" },
  { id: 8, name: "Deadlifts" },
  { id: 9, name: "Cycling" },
  { id: 10, name: "Burpees" },
];

function TrainerWorkoutPlans() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [plans, setPlans] = useState([]);
  const currentUser = users.find(
  (user) => String(user.User_ID) === String(selectedUser)
);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [addingExerciseTo, setAddingExerciseTo] = useState(null);

  const [planForm, setPlanForm] = useState({
    planName: "",
    planType: "Strength",
    startDate: "",
    endDate: "",
    planStatus: "Active",
  });

  const [exerciseForm, setExerciseForm] = useState({
    exerciseId: "1",
    targetSets: "3",
    targetReps: "12",
    dayNumber: "1",
  });

  // Load trainer's assigned users
  const loadUsers = async () => {
    try {
      const response = await api.get("/trainer/assigned-users");
      const assignedUsers = response.data.users || [];

      setUsers(assignedUsers);

      if (assignedUsers.length > 0 && !selectedUser) {
        setSelectedUser(String(assignedUsers[0].User_ID));
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load assigned users."
      );
    }
  };

  // Load selected user's workout plans
  const loadPlans = async () => {
    if (!selectedUser) return;

    try {
      setPlans([]);
      setShowPlanForm(false);
      setEditingPlan(null);
      setAddingExerciseTo(null);
      
      setLoading(true);
      setError("");

      const response = await api.get(
        `/trainer/users/${selectedUser}/workout-plans`
      );

      console.log(
  "FULL WORKOUT PLANS:",
  JSON.stringify(response.data.plans, null, 2)
);

      setPlans(response.data.plans || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load workout plans."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    loadPlans();
  }, [selectedUser]);

  // Open create form
  const openCreateForm = () => {
    setEditingPlan(null);

    setPlanForm({
      planName: "",
      planType: "Strength",
      startDate: "",
      endDate: "",
      planStatus: "Active",
    });

    setShowPlanForm(true);
    setMessage("");
    setError("");
  };

  // Open edit form
  const openEditForm = (plan) => {
    setEditingPlan(plan);

    const formatDate = (value) => {
      if (!value) return "";
      return String(value).slice(0, 10);
    };

    setPlanForm({
      planName: plan.Plan_Name || plan.planName || "",
      planType: plan.Plan_Type || plan.planType || "Strength",
      startDate: formatDate(plan.Start_Date || plan.startDate),
      endDate: formatDate(plan.End_Date || plan.endDate),
      planStatus: plan.Plan_Status || plan.planStatus || "Active",
    });

    setShowPlanForm(true);
    setMessage("");
    setError("");
  };

  // Create or update plan
  const savePlan = async (event) => {
    event.preventDefault();

    try {
      setError("");
      setMessage("");

      const payload = {
        planName: planForm.planName.trim(),
        planType: planForm.planType,
        startDate: planForm.startDate,
        endDate: planForm.endDate,
        planStatus: planForm.planStatus,
      };

      if (!payload.planName || !payload.startDate || !payload.endDate) {
        setError("Please fill all workout plan details.");
        return;
      }

      if (payload.endDate < payload.startDate) {
        setError("End date cannot be before start date.");
        return;
      }

      if (editingPlan) {
        const planId = editingPlan.Plan_ID || editingPlan.planId;

        await api.put(
          `/trainer/users/${selectedUser}/workout-plans/${planId}`,
          payload
        );

        setMessage("Workout plan updated successfully.");
      } else {
        await api.post(
          `/trainer/users/${selectedUser}/workout-plans`,
          payload
        );

        setMessage("Workout plan created successfully.");
      }

      setShowPlanForm(false);
      setEditingPlan(null);
      await loadPlans();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to save workout plan."
      );
    }
  };

  // Open add exercise form
  const openExerciseForm = (planId) => {
    setAddingExerciseTo(planId);

    setExerciseForm({
      exerciseId: "1",
      targetSets: "3",
      targetReps: "12",
      dayNumber: "1",
    });

    setError("");
    setMessage("");
  };

  // Add exercise to selected plan
  const addExercise = async (event) => {
    event.preventDefault();

    try {
      setError("");
      setMessage("");

      await api.post(
        `/trainer/users/${selectedUser}/workout-plans/${addingExerciseTo}/exercises`,
        {
          exerciseId: Number(exerciseForm.exerciseId),
          targetSets: Number(exerciseForm.targetSets),
          targetReps: Number(exerciseForm.targetReps),
          dayNumber: Number(exerciseForm.dayNumber),
        }
      );

      setMessage("Exercise added successfully.");
      setAddingExerciseTo(null);
      await loadPlans();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to add exercise."
      );
    }
  };

  // Remove exercise from plan
  const removeExercise = async (plan, exercise) => {
    const confirmed = window.confirm(
      `Remove ${exercise.Exercise_Name || exercise.exerciseName} from this workout plan?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      const planId = plan.Plan_ID || plan.planId;

const exerciseId =
  exercise.Plan_Exercise_ID || exercise.planExerciseId;

      await api.delete(
        `/trainer/users/${selectedUser}/workout-plans/${planId}/exercises/${exerciseId}`
      );

      setMessage("Exercise removed successfully.");
      await loadPlans();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to remove exercise."
      );
    }
  };

  return (
    <div className="trainer-workout-plans-page">
      <div className="dashboard-header">
        <div>
          <h1>Workout Plan Management</h1>
          <p>Create and manage workout plans for your assigned users.</p>
        </div>

        <button type="button" onClick={loadPlans}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}
      {message && <p className="success-message">{message}</p>}

      <div className="dashboard-section">
        <h2><ClipboardList size={20} /> Select User</h2>

        {users.length === 0 ? (
          <p>No assigned users available.</p>
        ) : (
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            {users.map((user) => (
              <option key={user.User_ID} value={user.User_ID}>
                {user.First_Name} {user.Last_Name} (ID: {user.User_ID})
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedUser && (
        <>
          <div className="dashboard-header">
            <h2><Dumbbell size={20} /> Workout Plans</h2>

            <button type="button" onClick={openCreateForm}>
              <Plus size={16} /> Create New Plan
            </button>
          </div>

          {showPlanForm && (
            <div className="dashboard-section">
              <h2>
                {editingPlan ? "Edit Workout Plan" : "Create Workout Plan"}
              </h2>

              <form onSubmit={savePlan} className="trainer-plan-form">
                <label>Plan Name</label>
                <input
                  type="text"
                  value={planForm.planName}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, planName: e.target.value })
                  }
                  placeholder="Enter workout plan name"
                  required
                />

                <label>Plan Type</label>
                <select
                  value={planForm.planType}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, planType: e.target.value })
                  }
                >
                  <option value="Strength">Strength</option>
                  <option value="Cardio">Cardio</option>
                  <option value="Weight Loss">Weight Loss</option>
                  <option value="Flexibility">Flexibility</option>
                  <option value="Muscle Building">Muscle Building</option>
                </select>

                <label>Start Date</label>
                <input
                  type="date"
                  value={planForm.startDate}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, startDate: e.target.value })
                  }
                  required
                />

                <label>End Date</label>
                <input
                  type="date"
                  value={planForm.endDate}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, endDate: e.target.value })
                  }
                  required
                />

                <label>Status</label>
                <select
                  value={planForm.planStatus}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, planStatus: e.target.value })
                  }
                >
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Inactive">Inactive</option>
                </select>

                <button type="submit">
                  {editingPlan ? "Update Plan" : "Create Plan"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowPlanForm(false)}
                >
                  Cancel
                </button>
              </form>
            </div>
          )}

          {loading ? (
            <p>Loading workout plans...</p>
          ) : plans.length === 0 ? (
            <div className="dashboard-section">
              <p>No workout plans found for this user.</p>
            </div>
          ) : (
            plans.map((plan) => {
              const planId = plan.planId || plan.Plan_ID;
              const exercises = plan.exercises || [];

              return (
                <div className="dashboard-section" key={planId}>
                  <div className="dashboard-header">
                    <div>
                      <h2>{plan.planName || plan.Plan_Name}</h2>
                      <p>
                        Type: {plan.planType || plan.Plan_Type} |
                        Status: {plan.planStatus || plan.Plan_Status}
                      </p>
                      <p>
                        Start: {String(plan.startDate || plan.Start_Date || "").slice(0, 10)}
                        {" | "}
                        End: {String(plan.endDate || plan.End_Date || "").slice(0, 10)}
                      </p>
                    </div>

                    <div className="trainer-plan-actions">
                      <button
                        type="button"
                        onClick={() => openEditForm(plan)}
                      >
                        <Edit size={15} /> Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => openExerciseForm(planId)}
                      >
                        <Plus size={15} /> Add Exercise
                      </button>
                    </div>
                  </div>

                  {addingExerciseTo === planId && (
                    <form
                      onSubmit={addExercise}
                      className="trainer-plan-form"
                    >
                      <h3>Add Exercise</h3>

                      <label>Exercise</label>
                      <select
                        value={exerciseForm.exerciseId}
                        onChange={(e) =>
                          setExerciseForm({
                            ...exerciseForm,
                            exerciseId: e.target.value,
                          })
                        }
                      >
                        {exerciseOptions.map((exercise) => (
                          <option key={exercise.id} value={exercise.id}>
                            {exercise.name}
                          </option>
                        ))}
                      </select>

                      <label>Target Sets</label>
                      <input
                        type="number"
                        min="1"
                        value={exerciseForm.targetSets}
                        onChange={(e) =>
                          setExerciseForm({
                            ...exerciseForm,
                            targetSets: e.target.value,
                          })
                        }
                        required
                      />

                      <label>Target Reps</label>
                      <input
                        type="number"
                        min="1"
                        value={exerciseForm.targetReps}
                        onChange={(e) =>
                          setExerciseForm({
                            ...exerciseForm,
                            targetReps: e.target.value,
                          })
                        }
                        required
                      />

                      <label>Workout Day</label>
                      <input
                        type="number"
                        min="1"
                        value={exerciseForm.dayNumber}
                        onChange={(e) =>
                          setExerciseForm({
                            ...exerciseForm,
                            dayNumber: e.target.value,
                          })
                        }
                        required
                      />

                      <button type="submit">Save Exercise</button>

                      <button
                        type="button"
                        onClick={() => setAddingExerciseTo(null)}
                      >
                        Cancel
                      </button>
                    </form>
                  )}

                  <h3>Exercises</h3>

                  {exercises.length === 0 ? (
                    <p>No exercises added to this plan yet.</p>
                  ) : (
                    <div className="table-container">
                      <table>
                        <thead>
                          <tr>
                            <th>Exercise</th>
                            <th>Sets</th>
                            <th>Reps</th>
                            <th>Day</th>
                            <th>Action</th>
                          </tr>
                        </thead>

                        <tbody>
                          {exercises.map((exercise) => (
                            <tr
                              key={
                                exercise.planExerciseId ||
                                exercise.Plan_Exercise_ID
                              }
                            >
                              <td>{exercise.Exercise_Name || exercise.exerciseName}</td>

                              <td>{exercise.Target_Sets ?? exercise.targetSets}</td>

                              <td>{exercise.Target_Reps ?? exercise.targetReps}</td>

                              <td>{exercise.Day_Number ?? exercise.dayNumber}</td>
                              <td>
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeExercise(plan, exercise)
                                  }
                                >
                                  <Trash2 size={15} /> Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </>
      )}
    </div>
  );
}

export default TrainerWorkoutPlans;
