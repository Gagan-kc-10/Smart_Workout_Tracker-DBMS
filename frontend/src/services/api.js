
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach JWT token to API requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication APIs
export const registerUser = (userData) =>
  API.post("/auth/register", userData);

export const loginUser = (credentials) =>
  API.post("/auth/login", credentials);

export const getProfile = () =>
  API.get("/auth/profile");

// Dashboard APIs
export const getDashboard = (userId) =>
  API.get(`/dashboard/${userId}`);

export const getWorkoutHistory = (userId) =>
  API.get(`/dashboard/${userId}/history`);

export const getFitnessGoals = (userId) =>
  API.get(`/dashboard/${userId}/goals`);

// Workout Plan APIs
export const getWorkoutPlans = (userId) =>
  API.get(`/workouts/plans/${userId}`);

// Start a workout
export const startWorkoutAPI = (userId, planId) =>
  API.post("/workouts/start", {
    userId,
    planId,
  });

// Get active workout from Redis
export const getActiveWorkout = (userId) =>
  API.get(`/workouts/active/${userId}`);

// Add exercise to workout
export const addExerciseToWorkout = (sessionId, exerciseData) =>
  API.post(`/workouts/${sessionId}/exercises`, exerciseData);

// Complete workout
export const completeWorkoutAPI = (sessionId, userId, caloriesBurned) =>
  API.post(`/workouts/${sessionId}/complete`, {
    userId,
    caloriesBurned,
  });

  // Update logged-in user's profile
export const updateProfile = (profileData) =>
  API.put("/auth/profile", profileData);

// Change logged-in user's password
export const changePassword = (passwordData) =>
  API.put("/auth/change-password", passwordData);

export default API;
