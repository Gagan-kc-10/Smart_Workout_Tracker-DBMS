
const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

require('dotenv').config({
    path: path.join(__dirname, '.env'),
    override: true
});
console.log('JWT_SECRET loaded:', !!process.env.JWT_SECRET);

const db = require('./config/mysql');
const redisClient = require('./config/redis');
const workoutRoutes = require('./routes/workoutRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const adminWorkoutRoutes = require('./routes/adminWorkoutRoutes');
const authRoutes = require('./routes/authRoutes');
const createAuthMiddleware = require('./middleware/authMiddleware');

const app = express();
const { authenticateToken, authorizeRoles } =
    createAuthMiddleware(db);

app.use(cors());
app.use(express.json());
app.use('/api/workouts', workoutRoutes(db, redisClient));
app.use('/api/dashboard', dashboardRoutes(db, redisClient));
app.use('/api/auth', authRoutes(db));
app.use('/api/admin/workouts', adminWorkoutRoutes(db));
app.get(
    '/api/admin-test',
    authenticateToken,
    authorizeRoles('Admin'),
    (req, res) => {
        res.json({
            message: 'Admin authorization successful',
            userId: req.user.User_ID,
            roleName: req.user.Role_Name
        });
    }
);

// Admin - View All Registered Users
app.get(
    '/api/admin/users',
    authenticateToken,
    authorizeRoles('Admin'),
    async (req, res) => {
        try {
            const [users] = await db.query(
                `SELECT
                    User_ID,
                    First_Name,
                    Last_Name,
                    Email,
                    Fitness_Level
                 FROM user
                 WHERE Role_ID = 2
                 ORDER BY User_ID`
            );

            res.json({
                message: 'Users retrieved successfully',
                totalUsers: users.length,
                users
            });

        } catch (error) {
            console.error('Admin users retrieval error:', error.message);

            res.status(500).json({
                message: 'Failed to retrieve users'
            });
        }
    }
);

// Admin - View All Trainers
app.get(
    '/api/admin/trainers',
    authenticateToken,
    authorizeRoles('Admin'),
    async (req, res) => {
        try {
            const [trainers] = await db.query(
                `SELECT
                    User_ID,
                    First_Name,
                    Last_Name,
                    Email
                 FROM user
                 WHERE Role_ID = 1
                 ORDER BY User_ID`
            );

            res.json({
                message: 'Trainers retrieved successfully',
                totalTrainers: trainers.length,
                trainers
            });

        } catch (error) {
            console.error('Admin trainers retrieval error:', error.message);

            res.status(500).json({
                message: 'Failed to retrieve trainers'
            });
        }
    }
);

app.post(
    '/api/admin/trainers',
    authenticateToken,
    authorizeRoles('Admin'),
    async (req, res) => {
        try {
            const { firstName, lastName, email, password } = req.body;

            // Validate required fields
            if (!firstName || !lastName || !email || !password) {
                return res.status(400).json({
                    message: 'All fields are required'
                });
            }

            const normalizedEmail = email.trim().toLowerCase();

            // Check whether email already exists
            const [existingUsers] = await db.query(
                'SELECT User_ID FROM user WHERE Email = ?',
                [normalizedEmail]
            );

            if (existingUsers.length > 0) {
                return res.status(409).json({
                    message: 'Email is already registered'
                });
            }

            // Validate password strength
            const passwordRegex =
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

            if (!passwordRegex.test(password)) {
                return res.status(400).json({
                    message: 'Password must contain at least 8 characters, including uppercase, lowercase, number and special character'
                });
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, 12);

            // Role_ID 1 = Trainer
            const [result] = await db.query(
                `INSERT INTO user
                (First_Name, Last_Name, Email, Password_Hash, Role_ID)
                VALUES (?, ?, ?, ?, ?)`,
                [
                    firstName.trim(),
                    lastName.trim(),
                    normalizedEmail,
                    passwordHash,
                    1
                ]
            );

            res.status(201).json({
                message: 'Trainer account created successfully',
                trainer: {
                    userId: result.insertId,
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    email: normalizedEmail,
                    roleId: 1,
                    roleName: 'Trainer'
                }
            });

        } catch (error) {
            console.error('Trainer creation error:', error.message);

            res.status(500).json({
                message: 'Failed to create Trainer account'
            });
        }
    }
);
app.post(
    '/api/admin/assign-trainer',
    authenticateToken,
    authorizeRoles('Admin'),
    async (req, res) => {
        try {
            const { trainerId, userId } = req.body;

            if (!trainerId || !userId) {
                return res.status(400).json({
                    message: 'Trainer ID and User ID are required'
                });
            }

            if (Number(trainerId) === Number(userId)) {
                return res.status(400).json({
                    message: 'A Trainer cannot be assigned to themselves'
                });
            }

            // Verify Trainer role
            const [trainers] = await db.query(
                'SELECT User_ID FROM user WHERE User_ID = ? AND Role_ID = 1',
                [trainerId]
            );

            if (trainers.length === 0) {
                return res.status(404).json({
                    message: 'Trainer not found'
                });
            }

            // Verify normal User role
            const [users] = await db.query(
                'SELECT User_ID FROM user WHERE User_ID = ? AND Role_ID = 2',
                [userId]
            );

            if (users.length === 0) {
                return res.status(404).json({
                    message: 'User not found'
                });
            }

            // Create assignment
            const [result] = await db.query(
                `INSERT INTO TRAINER_ASSIGNMENT
                (Trainer_ID, User_ID, Assigned_Date, Assignment_Status)
                VALUES (?, ?, CURDATE(), 'Active')`,
                [trainerId, userId]
            );

            res.status(201).json({
                message: 'User assigned to Trainer successfully',
                assignmentId: result.insertId,
                trainerId: Number(trainerId),
                userId: Number(userId),
                status: 'Active'
            });

        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    message: 'This Trainer and User are already assigned'
                });
            }

            console.error('Trainer assignment error:', error.message);

            res.status(500).json({
                message: 'Failed to assign User to Trainer'
            });
        }
    }
);

 // Admin - View All Trainer Assignments
app.get(
    '/api/admin/assignments',
    authenticateToken,
    authorizeRoles('Admin'),
    async (req, res) => {
        try {
            const [assignments] = await db.query(
                `SELECT
                    ta.Assignment_ID,
                    ta.Trainer_ID,
                    CONCAT(t.First_Name, ' ', t.Last_Name) AS Trainer_Name,
                    ta.User_ID,
                    CONCAT(u.First_Name, ' ', u.Last_Name) AS User_Name,
                    ta.Assigned_Date,
                    ta.Assignment_Status
                 FROM TRAINER_ASSIGNMENT ta
                 JOIN user t ON ta.Trainer_ID = t.User_ID
                 JOIN user u ON ta.User_ID = u.User_ID
                 ORDER BY ta.Assignment_ID DESC`
            );

            res.json({
                message: 'Trainer assignments retrieved successfully',
                totalAssignments: assignments.length,
                assignments
            });

        } catch (error) {
            console.error('Assignment retrieval error:', error.message);

            res.status(500).json({
                message: 'Failed to retrieve trainer assignments'
            });
        }
    }
);

// Trainer Dashboard - View Assigned Users
app.get(
    '/api/trainer/assigned-users',
    authenticateToken,
    authorizeRoles('Trainer'),
    async (req, res) => {
        try {
            const trainerId = req.user.User_ID;

            const [users] = await db.query(
                `SELECT
                    ta.Assignment_ID,
                    u.User_ID,
                    u.First_Name,
                    u.Last_Name,
                    u.Email,
                    u.Fitness_Level,
                    ta.Assigned_Date,
                    ta.Assignment_Status
                 FROM TRAINER_ASSIGNMENT ta
                 JOIN user u ON ta.User_ID = u.User_ID
                 WHERE ta.Trainer_ID = ?
                 AND ta.Assignment_Status = 'Active'
                 ORDER BY u.First_Name`,
                [trainerId]
            );

            res.json({
                message: 'Assigned users retrieved successfully',
                trainerId,
                totalAssignedUsers: users.length,
                users
            });

        } catch (error) {
            console.error('Trainer dashboard error:', error.message);

            res.status(500).json({
                message: 'Failed to retrieve assigned users'
            });
        }
    }
);
// Trainer views assigned user's workout history
app.get(
    '/api/trainer/users/:userId/workout-history',
    authenticateToken,
    authorizeRoles('Trainer'),
    async (req, res) => {
        try {
            const trainerId = req.user.User_ID;
            const userId = Number(req.params.userId);

            if (!Number.isInteger(userId) || userId <= 0) {
                return res.status(400).json({
                    message: 'Valid User ID is required'
                });
            }

            // Verify active Trainer-User assignment
            const [assignments] = await db.query(
                `SELECT Assignment_ID
                 FROM TRAINER_ASSIGNMENT
                 WHERE Trainer_ID = ?
                 AND User_ID = ?
                 AND Assignment_Status = 'Active'`,
                [trainerId, userId]
            );

            if (assignments.length === 0) {
                return res.status(403).json({
                    message: 'This User is not assigned to you'
                });
            }

            // Retrieve completed workout history
            const [history] = await db.query(
                `SELECT
                    ws.Session_ID,
                    ws.User_ID,
                    ws.Plan_ID,
                    wp.Plan_Name,
                    ws.Session_Date,
                    ws.Start_Time,
                    ws.End_Time,
                    ws.Calories_Burned,
                    ws.Session_Status
                 FROM workout_session ws
                 LEFT JOIN workout_plan wp
                    ON ws.Plan_ID = wp.Plan_ID
                    AND ws.User_ID = wp.User_ID
                 WHERE ws.User_ID = ?
                 AND ws.Session_Status = 'Completed'
                 ORDER BY ws.Session_Date DESC,
                          ws.Start_Time DESC`,
                [userId]
            );

            res.json({
                message: 'User workout history retrieved successfully',
                trainerId,
                userId,
                totalSessions: history.length,
                history
            });

        } catch (error) {
            console.error('Trainer workout history error:', error.message);

            res.status(500).json({
                message: 'Failed to retrieve workout history'
            });
        }
    }
);

// Trainer views assigned user's fitness progress
app.get(
    '/api/trainer/users/:userId/fitness-progress',
    authenticateToken,
    authorizeRoles('Trainer'),
    async (req, res) => {
        try {
            const trainerId = req.user.User_ID;
            const userId = Number(req.params.userId);

            if (!Number.isInteger(userId) || userId <= 0) {
                return res.status(400).json({
                    message: 'Valid User ID is required'
                });
            }

            // Verify active Trainer-User assignment
            const [assignments] = await db.query(
                `SELECT Assignment_ID
                 FROM TRAINER_ASSIGNMENT
                 WHERE Trainer_ID = ?
                 AND User_ID = ?
                 AND Assignment_Status = 'Active'`,
                [trainerId, userId]
            );

            if (assignments.length === 0) {
                return res.status(403).json({
                    message: 'This User is not assigned to you'
                });
            }

            // Retrieve fitness progress records
            const [progress] = await db.query(
                `SELECT
                    Progress_ID,
                    User_ID,
                    Record_Date,
                    Weight,
                    Body_Fat_Percentage,
                    Stamina_Minutes,
                    Fitness_Notes
                 FROM fitness_progress
                 WHERE User_ID = ?
                 ORDER BY Record_Date DESC, Progress_ID DESC`,
                [userId]
            );

            res.json({
                message: 'User fitness progress retrieved successfully',
                trainerId,
                userId,
                totalRecords: progress.length,
                progress
            });

        } catch (error) {
            console.error('Trainer fitness progress error:', error.message);

            res.status(500).json({
                message: 'Failed to retrieve fitness progress'
            });
        }
    }
);

// Trainer views assigned user's workout plans
app.get(
    '/api/trainer/users/:userId/workout-plans',
    authenticateToken,
    authorizeRoles('Trainer'),
    async (req, res) => {
        try {
            const trainerId = req.user.User_ID;
            const userId = Number(req.params.userId);

            if (!Number.isInteger(userId) || userId <= 0) {
                return res.status(400).json({
                    message: 'Valid User ID is required'
                });
            }

            // Verify active Trainer-User assignment
            const [assignments] = await db.query(
                `SELECT Assignment_ID
                 FROM TRAINER_ASSIGNMENT
                 WHERE Trainer_ID = ?
                 AND User_ID = ?
                 AND Assignment_Status = 'Active'`,
                [trainerId, userId]
            );

            if (assignments.length === 0) {
                return res.status(403).json({
                    message: 'This User is not assigned to you'
                });
            }

            // Retrieve workout plans and exercises
            const [rows] = await db.query(
                `SELECT
                    wp.Plan_ID,
                    wp.User_ID,
                    wp.Plan_Name,
                    wp.Plan_Type,
                    wp.Start_Date,
                    wp.End_Date,
                    wp.Plan_Status,
                    pe.Plan_Exercise_ID,
                    pe.Target_Sets,
                    pe.Target_Reps,
                    pe.Day_Number,
                    e.Exercise_ID,
                    e.Exercise_Name,
                    e.Exercise_Type,
                    e.Muscle_Group,
                    e.Difficulty_Level,
                    e.Equipment
                 FROM workout_plan wp
                 LEFT JOIN plan_exercise pe
                    ON wp.Plan_ID = pe.Plan_ID
                 LEFT JOIN exercise e
                    ON pe.Exercise_ID = e.Exercise_ID
                 WHERE wp.User_ID = ?
                 ORDER BY wp.Plan_ID, pe.Day_Number`,
                [userId]
            );

            const plansMap = new Map();

            rows.forEach(row => {
                if (!plansMap.has(row.Plan_ID)) {
                    plansMap.set(row.Plan_ID, {
                        Plan_ID: row.Plan_ID,
                        User_ID: row.User_ID,
                        Plan_Name: row.Plan_Name,
                        Plan_Type: row.Plan_Type,
                        Start_Date: row.Start_Date,
                        End_Date: row.End_Date,
                        Plan_Status: row.Plan_Status,
                        exercises: []
                    });
                }

                if (row.Exercise_ID !== null) {
                    plansMap.get(row.Plan_ID).exercises.push({
                        Plan_Exercise_ID: row.Plan_Exercise_ID,
                        Exercise_ID: row.Exercise_ID,
                        Exercise_Name: row.Exercise_Name,
                        Exercise_Type: row.Exercise_Type,
                        Muscle_Group: row.Muscle_Group,
                        Difficulty_Level: row.Difficulty_Level,
                        Equipment: row.Equipment,
                        Target_Sets: row.Target_Sets,
                        Target_Reps: row.Target_Reps,
                        Day_Number: row.Day_Number
                    });
                }
            });

            res.json({
                message: 'User workout plans retrieved successfully',
                trainerId,
                userId,
                totalPlans: plansMap.size,
                plans: Array.from(plansMap.values())
            });

        } catch (error) {
            console.error('Trainer workout plans error:', error.message);

            res.status(500).json({
                message: 'Failed to retrieve workout plans'
            });
        }
    }
);

// Trainer creates workout plan for assigned User
app.post(
    '/api/trainer/users/:userId/workout-plans',
    authenticateToken,
    authorizeRoles('Trainer'),
    async (req, res) => {
        try {
            const trainerId = req.user.User_ID;
            const userId = Number(req.params.userId);

            const {
                planName,
                planType,
                startDate,
                endDate
            } = req.body;

            // Validate User ID
            if (!Number.isInteger(userId) || userId <= 0) {
                return res.status(400).json({
                    message: 'Valid User ID is required'
                });
            }

            // Validate required fields
            if (!planName || !planType || !startDate) {
                return res.status(400).json({
                    message: 'Plan name, plan type and start date are required'
                });
            }

            // Verify active Trainer-User assignment
            const [assignments] = await db.query(
                `SELECT Assignment_ID
                 FROM TRAINER_ASSIGNMENT
                 WHERE Trainer_ID = ?
                 AND User_ID = ?
                 AND Assignment_Status = 'Active'`,
                [trainerId, userId]
            );

            if (assignments.length === 0) {
                return res.status(403).json({
                    message: 'This User is not assigned to you'
                });
            }

            // Validate date range
            if (
                endDate &&
                new Date(endDate) < new Date(startDate)
            ) {
                return res.status(400).json({
                    message: 'End date cannot be before start date'
                });
            }

            // Insert workout plan
            const [result] = await db.query(
                `INSERT INTO workout_plan
                (
                    User_ID,
                    Plan_Name,
                    Plan_Type,
                    Start_Date,
                    End_Date,
                    Plan_Status
                )
                VALUES (?, ?, ?, ?, ?, 'Active')`,
                [
                    userId,
                    planName.trim(),
                    planType.trim(),
                    startDate,
                    endDate || null
                ]
            );

            res.status(201).json({
                message: 'Workout plan created successfully',
                plan: {
                    planId: result.insertId,
                    userId,
                    trainerId,
                    planName: planName.trim(),
                    planType: planType.trim(),
                    startDate,
                    endDate: endDate || null,
                    planStatus: 'Active'
                }
            });

        } catch (error) {
            console.error('Trainer create plan error:', error.message);

            res.status(500).json({
                message: 'Failed to create workout plan'
            });
        }
    }
);

// Trainer adds exercises to an assigned User's workout plan
app.post(
    '/api/trainer/users/:userId/workout-plans/:planId/exercises',
    authenticateToken,
    authorizeRoles('Trainer'),
    async (req, res) => {
        try {
            const trainerId = req.user.User_ID;
            const userId = Number(req.params.userId);
            const planId = Number(req.params.planId);

            const {
                exerciseId,
                targetSets,
                targetReps,
                dayNumber
            } = req.body;

            // Validate IDs
            if (
                !Number.isInteger(userId) || userId <= 0 ||
                !Number.isInteger(planId) || planId <= 0 ||
                !Number.isInteger(exerciseId) || exerciseId <= 0
            ) {
                return res.status(400).json({
                    message: 'Valid User, Plan and Exercise IDs are required'
                });
            }

            // Validate exercise targets
            if (
                !Number.isInteger(targetSets) || targetSets <= 0 ||
                !Number.isInteger(targetReps) || targetReps <= 0 ||
                !Number.isInteger(dayNumber) || dayNumber <= 0
            ) {
                return res.status(400).json({
                    message: 'Sets, reps and day number must be positive integers'
                });
            }

            // Verify active Trainer-User assignment
            const [assignments] = await db.query(
                `SELECT Assignment_ID
                 FROM TRAINER_ASSIGNMENT
                 WHERE Trainer_ID = ?
                 AND User_ID = ?
                 AND Assignment_Status = 'Active'`,
                [trainerId, userId]
            );

            if (assignments.length === 0) {
                return res.status(403).json({
                    message: 'This User is not assigned to you'
                });
            }

            // Verify that the plan belongs to this User
            const [plans] = await db.query(
                `SELECT Plan_ID
                 FROM workout_plan
                 WHERE Plan_ID = ?
                 AND User_ID = ?`,
                [planId, userId]
            );

            if (plans.length === 0) {
                return res.status(404).json({
                    message: 'Workout plan not found for this User'
                });
            }

            // Verify that the exercise exists
            const [exercises] = await db.query(
                `SELECT Exercise_ID, Exercise_Name
                 FROM exercise
                 WHERE Exercise_ID = ?`,
                [exerciseId]
            );

            if (exercises.length === 0) {
                return res.status(404).json({
                    message: 'Exercise not found'
                });
            }

            // Insert exercise into plan
            const [result] = await db.query(
                `INSERT INTO plan_exercise
                (
                    Plan_ID,
                    Exercise_ID,
                    Target_Sets,
                    Target_Reps,
                    Day_Number
                )
                VALUES (?, ?, ?, ?, ?)`,
                [
                    planId,
                    exerciseId,
                    targetSets,
                    targetReps,
                    dayNumber
                ]
            );

            res.status(201).json({
                message: 'Exercise added to workout plan successfully',
                planExercise: {
                    planExerciseId: result.insertId,
                    planId,
                    userId,
                    exerciseId,
                    exerciseName: exercises[0].Exercise_Name,
                    targetSets,
                    targetReps,
                    dayNumber
                }
            });

        } catch (error) {
            console.error('Trainer add exercise error:', error.message);

            res.status(500).json({
                message: 'Failed to add exercise to workout plan'
            });
        }
    }
);

// Trainer updates a workout plan belonging to an assigned User
app.put(
    '/api/trainer/users/:userId/workout-plans/:planId',
    authenticateToken,
    authorizeRoles('Trainer'),
    async (req, res) => {
        try {
            const trainerId = req.user.User_ID;
            const userId = Number(req.params.userId);
            const planId = Number(req.params.planId);

            const {
                planName,
                planType,
                startDate,
                endDate,
                planStatus
            } = req.body;

            // Validate IDs
            if (
                !Number.isInteger(userId) || userId <= 0 ||
                !Number.isInteger(planId) || planId <= 0
            ) {
                return res.status(400).json({
                    message: 'Valid User ID and Plan ID are required'
                });
            }

            // Validate required fields
            if (
                typeof planName !== 'string' || !planName.trim() ||
                typeof planType !== 'string' || !planType.trim() ||
                !startDate ||
                !['Active', 'Completed', 'Cancelled'].includes(planStatus)
            ) {
                return res.status(400).json({
                    message: 'Valid plan name, type, start date and status are required'
                });
            }

            // Verify active Trainer-User assignment
            const [assignments] = await db.query(
                `SELECT Assignment_ID
                 FROM TRAINER_ASSIGNMENT
                 WHERE Trainer_ID = ?
                 AND User_ID = ?
                 AND Assignment_Status = 'Active'`,
                [trainerId, userId]
            );

            if (assignments.length === 0) {
                return res.status(403).json({
                    message: 'This User is not assigned to you'
                });
            }

            // Verify plan ownership
            const [plans] = await db.query(
                `SELECT Plan_ID
                 FROM workout_plan
                 WHERE Plan_ID = ?
                 AND User_ID = ?`,
                [planId, userId]
            );

            if (plans.length === 0) {
                return res.status(404).json({
                    message: 'Workout plan not found for this User'
                });
            }

            // Validate date range
            if (
                endDate &&
                new Date(endDate) < new Date(startDate)
            ) {
                return res.status(400).json({
                    message: 'End date cannot be before start date'
                });
            }

            // Update workout plan
            await db.query(
                `UPDATE workout_plan
                 SET Plan_Name = ?,
                     Plan_Type = ?,
                     Start_Date = ?,
                     End_Date = ?,
                     Plan_Status = ?
                 WHERE Plan_ID = ?
                 AND User_ID = ?`,
                [
                    planName.trim(),
                    planType.trim(),
                    startDate,
                    endDate || null,
                    planStatus,
                    planId,
                    userId
                ]
            );

            res.status(200).json({
                message: 'Workout plan updated successfully',
                planId,
                userId,
                trainerId,
                planName: planName.trim(),
                planType: planType.trim(),
                startDate,
                endDate: endDate || null,
                planStatus
            });

        } catch (error) {
            console.error('Trainer update plan error:', error.message);

            res.status(500).json({
                message: 'Failed to update workout plan'
            });
        }
    }
);

// Trainer removes an exercise from an assigned User's workout plan
app.delete(
    '/api/trainer/users/:userId/workout-plans/:planId/exercises/:planExerciseId',
    authenticateToken,
    authorizeRoles('Trainer'),
    async (req, res) => {
        try {
            const trainerId = req.user.User_ID;
            const userId = Number(req.params.userId);
            const planId = Number(req.params.planId);
            const planExerciseId = Number(req.params.planExerciseId);

            // Validate IDs
            if (
                !Number.isInteger(userId) || userId <= 0 ||
                !Number.isInteger(planId) || planId <= 0 ||
                !Number.isInteger(planExerciseId) || planExerciseId <= 0
            ) {
                return res.status(400).json({
                    message: 'Valid User, Plan and Plan Exercise IDs are required'
                });
            }

            // Verify active Trainer-User assignment
            const [assignments] = await db.query(
                `SELECT Assignment_ID
                 FROM TRAINER_ASSIGNMENT
                 WHERE Trainer_ID = ?
                 AND User_ID = ?
                 AND Assignment_Status = 'Active'`,
                [trainerId, userId]
            );

            if (assignments.length === 0) {
                return res.status(403).json({
                    message: 'This User is not assigned to you'
                });
            }

            // Verify plan ownership
            const [plans] = await db.query(
                `SELECT Plan_ID
                 FROM workout_plan
                 WHERE Plan_ID = ?
                 AND User_ID = ?`,
                [planId, userId]
            );

            if (plans.length === 0) {
                return res.status(404).json({
                    message: 'Workout plan not found for this User'
                });
            }

            // Verify exercise belongs to this plan
            const [planExercises] = await db.query(
                `SELECT Plan_Exercise_ID
                 FROM plan_exercise
                 WHERE Plan_Exercise_ID = ?
                 AND Plan_ID = ?`,
                [planExerciseId, planId]
            );

            if (planExercises.length === 0) {
                return res.status(404).json({
                    message: 'Exercise not found in this workout plan'
                });
            }

            // Delete exercise
            await db.query(
                `DELETE FROM plan_exercise
                 WHERE Plan_Exercise_ID = ?
                 AND Plan_ID = ?`,
                [planExerciseId, planId]
            );

            res.status(200).json({
                message: 'Exercise removed from workout plan successfully',
                planId,
                userId,
                planExerciseId
            });

        } catch (error) {
            console.error('Trainer remove exercise error:', error.message);

            res.status(500).json({
                message: 'Failed to remove exercise from workout plan'
            });
        }
    }
);

// Test JWT Authentication and Role Detection
app.get(
    '/api/auth-test',
    authenticateToken,
    (req, res) => {
        res.json({
            message: 'Authentication successful',
            userId: req.user.User_ID,
            email: req.user.Email,
            roleId: req.user.Role_ID,
            roleName: req.user.Role_Name
        });
    }
);

// Home API
app.get('/', (req, res) => {
    res.json({
        message: 'Smart Workout Tracker API is running'
    });
});

// Test MySQL
app.get('/api/mysql-test', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT DATABASE() AS database_name'
        );

        res.json({
            status: 'success',
            database: rows[0].database_name
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

// Test Redis
app.get('/api/redis-test', async (req, res) => {
    try {
        await redisClient.set('project_status', 'Working');

        const result = await redisClient.get('project_status');

        res.json({
            status: 'success',
            redis_value: result
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

// Start server
const PORT = 5000;

async function startServer() {
    try {
        await redisClient.connect();

        await db.query('SELECT 1');

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
            console.log('MySQL connected successfully!');
            console.log('Redis connected successfully!');
        });
    } catch (error) {
        console.error('Server startup failed:', error.message);
        if (redisClient.isOpen) {
            await redisClient.quit();
        }
        process.exit(1);
    }
}


startServer();
