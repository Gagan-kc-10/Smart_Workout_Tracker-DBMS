
const express = require('express');

module.exports = (db, redisClient) => {
    console.log("WORKOUT ROUTES FILE LOADED:", __filename);
    const router = express.Router();

    // MET values from matching activity categories
    // in the 2024 Adult Compendium.

    const MET_MAPPING = {
        "push-ups": {
            met: 3.8,
            code: "02022",
            description: "Moderate calisthenics"
        },

        "squats": {
            met: 3.0,
            code: "02056",
            description: "General body-weight resistance exercises"
        },

        "plank": {
            met: 2.8,
            code: "02024",
            description: "Light calisthenics"
        },

        "lunges": {
            met: 3.8,
            code: "02022",
            description: "Moderate calisthenics"
        },

        "pull-ups": {
            met: 3.8,
            code: "02022",
            description: "Moderate calisthenics"
        },

        "deadlifts": {
            met: 5.0,
            code: "02052",
            description: "Resistance training - squats and deadlifts"
        },

        "burpees": {
            met: 7.5,
            code: "02020",
            description: "Vigorous calisthenics"
        }
    };


    // GET WORKOUT PLANS FOR A USER

    router.get('/plans/:userId', async (req, res) => {
        try {
            const { userId } = req.params;

            if (!Number.isInteger(Number(userId)) ||
                Number(userId) <= 0) {
                return res.status(400).json({
                    error: 'Valid userId is required'
                });
            }

            const [rows] = await db.query(
                `SELECT
                    wp.Plan_ID AS planId,
                    wp.User_ID AS userId,
                    wp.Plan_Name AS planName,
                    wp.Plan_Type AS planType,
                    wp.Start_Date AS startDate,
                    wp.End_Date AS endDate,
                    wp.Plan_Status AS planStatus,

                    pe.Plan_Exercise_ID AS planExerciseId,
                    pe.Target_Sets AS targetSets,
                    pe.Target_Reps AS targetReps,
                    pe.Day_Number AS dayNumber,

                    e.Exercise_ID AS exerciseId,
                    e.Exercise_Name AS exerciseName,
                    e.Exercise_Type AS exerciseType,
                    e.Muscle_Group AS muscleGroup,
                    e.Difficulty_Level AS difficultyLevel,
                    e.Equipment AS equipment

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
                if (!plansMap.has(row.planId)) {
                    plansMap.set(row.planId, {
                        planId: row.planId,
                        userId: row.userId,
                        planName: row.planName,
                        planType: row.planType,
                        startDate: row.startDate,
                        endDate: row.endDate,
                        planStatus: row.planStatus,
                        exercises: []
                    });
                }

                if (row.exerciseId !== null) {
                    plansMap.get(row.planId).exercises.push({
                        planExerciseId: row.planExerciseId,
                        exerciseId: row.exerciseId,
                        exerciseName: row.exerciseName,
                        exerciseType: row.exerciseType,
                        muscleGroup: row.muscleGroup,
                        difficultyLevel: row.difficultyLevel,
                        equipment: row.equipment,
                        targetSets: row.targetSets,
                        targetReps: row.targetReps,
                        dayNumber: row.dayNumber
                    });
                }
            });

            res.json({
                success: true,
                totalPlans: plansMap.size,
                plans: Array.from(plansMap.values())
            });

        } catch (error) {
            console.error('Workout plans error:', error);

            res.status(500).json({
                error: error.message
            });
        }
    });


    // START WORKOUT

    router.post('/start', async (req, res) => {
        try {
            const { userId, planId } = req.body;

            if (!userId) {
                return res.status(400).json({
                    error: 'userId is required'
                });
            }

            const [result] = await db.query(
                `INSERT INTO workout_session
                (User_ID, Plan_ID, Session_Date, Start_Time, Session_Status)
                VALUES (?, ?, CURDATE(), CURTIME(), 'In Progress')`,
                [userId, planId || null]
            );

            const sessionId = result.insertId;

            const activeSession = {
                sessionId,
                userId,
                planId: planId || null,
                startedAt: new Date().toISOString()
            };

            await redisClient.set(
                `user:${userId}:active_session`,
                JSON.stringify(activeSession)
            );

            res.status(201).json({
                message: 'Workout started successfully',
                sessionId,
                redis: 'Active session stored'
            });

        } catch (error) {
            console.error('Start workout error:', error);

            res.status(500).json({
                error: error.message
            });
        }
    });


    // ADD EXERCISE TO WORKOUT SESSION

    router.post('/:sessionId/exercises', async (req, res) => {
        console.log("ADD EXERCISE API CALLED:", req.params.sessionId);
        try {
            const { sessionId } = req.params;

            const {
                userId,
                exerciseId,
                setsCompleted,
                repsCompleted,
                weightUsed = null,
                duration = null
            } = req.body || {};

            if (
                !Number.isInteger(Number(userId)) ||
                Number(userId) <= 0 ||
                !Number.isInteger(Number(exerciseId)) ||
                Number(exerciseId) <= 0 ||
                !Number.isInteger(Number(setsCompleted)) ||
                Number(setsCompleted) < 0 ||
                !Number.isInteger(Number(repsCompleted)) ||
                Number(repsCompleted) < 0
            ) {
                return res.status(400).json({
                    error: 'Invalid userId, exerciseId, setsCompleted or repsCompleted'
                });
            }

            if (
                weightUsed !== null &&
                (!Number.isFinite(Number(weightUsed)) ||
                    Number(weightUsed) < 0)
            ) {
                return res.status(400).json({
                    error: 'weightUsed must be a non-negative number'
                });
            }

            if (
                duration !== null &&
                (!Number.isInteger(Number(duration)) ||
                    Number(duration) < 0)
            ) {
                return res.status(400).json({
                    error: 'duration must be a non-negative integer'
                });
            }

            // Verify session ownership and status

            const [sessions] = await db.query(
                `SELECT Session_ID
                 FROM workout_session
                 WHERE Session_ID = ?
                 AND User_ID = ?
                 AND Session_Status = 'In Progress'`,
                [sessionId, userId]
            );

            if (sessions.length === 0) {
                return res.status(404).json({
                    error: 'Active workout session not found'
                });
            }

            // Verify exercise exists

            const [exercises] = await db.query(
                `SELECT Exercise_ID, Exercise_Name
                 FROM exercise
                 WHERE Exercise_ID = ?`,
                [exerciseId]
            );

            if (exercises.length === 0) {
                return res.status(404).json({
                    error: 'Exercise not found'
                });
            }

            const exerciseName = exercises[0].Exercise_Name;
            const normalizedName = exerciseName.trim().toLowerCase();

            const metDetails = MET_MAPPING[normalizedName] || null;

            // Get latest recorded body weight.
            // Fallback to user.Weight.

            const [weightRows] = await db.query(
                `SELECT COALESCE(
                    (
                        SELECT Weight
                        FROM fitness_progress
                        WHERE User_ID = ?
                        ORDER BY Record_Date DESC, Progress_ID DESC
                        LIMIT 1
                    ),
                    (
                        SELECT Weight
                        FROM \`user\`
                        WHERE User_ID = ?
                    )
                ) AS bodyWeight`,
                [userId, userId]
            );

            const bodyWeight = Number(weightRows[0]?.bodyWeight);
            console.log("CALORIE DEBUG:", {
                exerciseName,
                normalizedName,
                metDetails,
                duration,
                bodyWeight
            });

            console.log("CALCULATED CALORIES:", caloriesEstimated);

            // Calculate calories

            let caloriesEstimated = 0;

            if (
                metDetails &&
                duration !== null &&
                Number(duration) > 0 &&
                Number.isFinite(bodyWeight) &&
                bodyWeight > 0
            ) {
                const durationMinutes = Number(duration) / 60;

                caloriesEstimated =
                    (
                        metDetails.met *
                        3.5 *
                        bodyWeight /
                        200
                    ) * durationMinutes;

                caloriesEstimated = Number(
                    caloriesEstimated.toFixed(2)
                );
            }

            // Save exercise and calorie estimate

            const [insertResult] = await db.query(
                `INSERT INTO session_exercise
                (
                    Session_ID,
                    Exercise_ID,
                    Sets_Completed,
                    Reps_Completed,
                    Weight_Used,
                    Duration,
                    Calories_Estimated
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    sessionId,
                    exerciseId,
                    setsCompleted,
                    repsCompleted,
                    weightUsed,
                    duration,
                    caloriesEstimated
                ]
            );

            res.status(201).json({
                message: 'Exercise added to workout successfully',
                sessionExerciseId: insertResult.insertId,
                sessionId: Number(sessionId),
                exerciseId: Number(exerciseId),
                exerciseName,
                setsCompleted: Number(setsCompleted),
                repsCompleted: Number(repsCompleted),
                weightUsed,
                duration,
                metValue: metDetails ? metDetails.met : null,
                metCode: metDetails ? metDetails.code : null,
                metDescription: metDetails ? metDetails.description : null,
                caloriesEstimated,
                estimateAvailable:
                    Boolean(metDetails) &&
                    duration !== null &&
                    Number(duration) > 0 &&
                    Number.isFinite(bodyWeight) &&
                    bodyWeight > 0
            });

        } catch (error) {
            console.error('Exercise tracking error:', error);

            res.status(500).json({
                error: error.message
            });
        }
    });


    // GET ACTIVE WORKOUT

router.get('/active/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!Number.isInteger(Number(userId)) || Number(userId) <= 0) {
            return res.status(400).json({
                error: 'Valid userId is required'
            });
        }

        // MySQL is the permanent source of truth
        const [sessions] = await db.query(
            `SELECT
                Session_ID AS sessionId,
                User_ID AS userId,
                Plan_ID AS planId,
                Session_Date AS sessionDate,
                Start_Time AS startTime,
                Session_Status AS sessionStatus
             FROM workout_session
             WHERE User_ID = ?
             AND Session_Status = 'In Progress'
             ORDER BY Session_ID DESC
             LIMIT 1`,
            [userId]
        );

        if (sessions.length === 0) {
            await redisClient.del(
                `user:${userId}:active_session`
            );

            return res.json({
                active: false,
                message: 'No active workout found'
            });
        }

        const session = sessions[0];

        // Refresh Redis using the MySQL record
        await redisClient.set(
            `user:${userId}:active_session`,
            JSON.stringify({
                sessionId: session.sessionId,
                userId: session.userId,
                planId: session.planId,
                startedAt: session.startTime
            })
        );

        res.json({
            active: true,
            ...session
        });

    } catch (error) {
        console.error('Active workout error:', error);

        res.status(500).json({
            error: error.message
        });
    }
});

    // COMPLETE WORKOUT

    router.post('/:sessionId/complete', async (req, res) => {
        try {
            const { sessionId } = req.params;
            const { userId } = req.body || {};

            if (
                !Number.isInteger(Number(userId)) ||
                Number(userId) <= 0
            ) {
                return res.status(400).json({
                    error: 'Valid userId is required'
                });
            }

            // Verify workout session

            const [rows] = await db.query(
                `SELECT
                    Session_ID,
                    DATE_FORMAT(Session_Date, '%Y-%m-%d') AS Session_Date,
                    Session_Status
                 FROM workout_session
                 WHERE Session_ID = ? AND User_ID = ?`,
                [sessionId, userId]
            );

            if (rows.length === 0) {
                return res.status(404).json({
                    error: 'Workout session not found'
                });
            }

            if (rows[0].Session_Status === 'Completed') {
                return res.status(409).json({
                    error: 'Workout is already completed'
                });
            }

            // Calculate total calories from saved exercises

            const [calorieRows] = await db.query(
                `SELECT
                    COALESCE(SUM(Calories_Estimated), 0) AS totalCalories,
                    COUNT(*) AS totalExercises
                 FROM session_exercise
                 WHERE Session_ID = ?`,
                [sessionId]
            );

            const caloriesBurned = Number(
                Number(calorieRows[0].totalCalories).toFixed(2)
            );

            // Update permanent workout record

            await db.query(
                `UPDATE workout_session
                 SET End_Time = CURTIME(),
                     Calories_Burned = ?,
                     Session_Status = 'Completed'
                 WHERE Session_ID = ? AND User_ID = ?`,
                [caloriesBurned, sessionId, userId]
            );

            // Update daily Redis counters

            const date = rows[0].Session_Date;

            const workoutCountKey =
                `user:${userId}:workouts:${date}`;

            const caloriesKey =
                `user:${userId}:calories:${date}`;

            await redisClient.incr(workoutCountKey);

            await redisClient.incrByFloat(
                caloriesKey,
                caloriesBurned
            );

            await redisClient.expire(workoutCountKey, 172800);
            await redisClient.expire(caloriesKey, 172800);

            // Clear active workout

            await redisClient.del(
                `user:${userId}:active_session`
            );

            res.json({
                message: 'Workout completed successfully',
                sessionId: Number(sessionId),
                totalExercises: Number(calorieRows[0].totalExercises),
                caloriesBurned,
                dailyWorkoutCount: Number(
                    await redisClient.get(workoutCountKey)
                ),
                dailyCaloriesBurned: Number(
                    await redisClient.get(caloriesKey)
                )
            });

        } catch (error) {
            console.error('Complete workout error:', error);

            res.status(500).json({
                error: error.message
            });
        }
    });

    
// GET WORKOUT HISTORY

router.get('/history/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        const [history] = await db.query(
            `SELECT
                Session_ID,
                User_ID,
                Plan_ID,
                Session_Date,
                Start_Time,
                End_Time,
                Calories_Burned,
                Session_Status
             FROM workout_session
             WHERE User_ID = ?
             AND Session_Status = 'Completed'
             ORDER BY Session_Date DESC, Start_Time DESC`,
            [userId]
        );

        res.json({
            userId: Number(userId),
            totalSessions: history.length,
            history: history
        });

    } catch (error) {
        console.error('Workout history error:', error);

        res.status(500).json({
            error: error.message
        });
    }
});

    return router;
};
