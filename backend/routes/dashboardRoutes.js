const express = require('express');

module.exports = (db, redisClient) => {
    const router = express.Router();

    // GET DASHBOARD SUMMARY
    router.get('/:userId', async (req, res) => {
        try {
            const userId = Number(req.params.userId);

            if (!Number.isInteger(userId) || userId <= 0) {
                return res.status(400).json({
                    error: 'Invalid user ID'
                });
            }

            // 1. Get workout statistics from MySQL
            const [workoutRows] = await db.query(
                `SELECT
                    COUNT(*) AS totalSessions,
                    SUM(
                        CASE
                            WHEN Session_Status = 'Completed'
                            THEN 1 ELSE 0
                        END
                    ) AS completedWorkouts,
                    COALESCE(
                        SUM(
                            CASE
                                WHEN Session_Status = 'Completed'
                                THEN COALESCE(Calories_Burned, 0)
                                ELSE 0
                            END
                        ), 0
                    ) AS totalCaloriesBurned
                 FROM workout_session
                 WHERE User_ID = ?`,
                [userId]
            );

            // 2. Calculate exercise volume for completed workouts
            const [volumeRows] = await db.query(
                `SELECT
                    COALESCE(
                        SUM(
                            COALESCE(se.Weight_Used, 0)
                            * se.Sets_Completed
                            * se.Reps_Completed
                        ), 0
                    ) AS totalExerciseVolume
                 FROM session_exercise se
                 JOIN workout_session ws
                    ON se.Session_ID = ws.Session_ID
                 WHERE ws.User_ID = ?
                 AND ws.Session_Status = 'Completed'`,
                [userId]
            );

            // 3. Calculate workout completion percentage
            const totalSessions = Number(workoutRows[0].totalSessions) || 0;
            const completedWorkouts =
                Number(workoutRows[0].completedWorkouts) || 0;

            const completionPercentage = totalSessions > 0
                ? Number(
                    ((completedWorkouts / totalSessions) * 100).toFixed(2)
                  )
                : 0;

            // 4. Get today's date from MySQL
            const [dateRows] = await db.query(
                `SELECT DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS today`
            );

            const today = dateRows[0].today;

            // 5. Get daily statistics from Redis
            const dailyWorkoutCount = Number(
                await redisClient.get(
                    `user:${userId}:workouts:${today}`
                )
            ) || 0;

            const dailyCaloriesBurned = Number(
                await redisClient.get(
                    `user:${userId}:calories:${today}`
                )
            ) || 0;

            // 6. Send dashboard response
            res.json({
                userId,
                totalWorkouts: completedWorkouts,
                totalSessions,
                totalCaloriesBurned:
                    Number(workoutRows[0].totalCaloriesBurned),
                totalExerciseVolume:
                    Number(volumeRows[0].totalExerciseVolume),
                completionPercentage,
                today: {
                    date: today,
                    workoutCount: dailyWorkoutCount,
                    caloriesBurned: dailyCaloriesBurned
                }
            });

        } catch (error) {
            console.error('Dashboard API error:', error);

            res.status(500).json({
                error: error.message
            });
        }
    });
    // GET WORKOUT HISTORY
router.get('/:userId/history', async (req, res) => {
    try {
        const userId = Number(req.params.userId);

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                error: 'Invalid user ID'
            });
        }

        // Get all workout sessions for the user
        const [sessions] = await db.query(
            `SELECT
                ws.Session_ID,
                ws.User_ID,
                ws.Plan_ID,
                wp.Plan_Name,
                DATE_FORMAT(ws.Session_Date, '%Y-%m-%d') AS Session_Date,
                ws.Start_Time,
                ws.End_Time,
                ws.Calories_Burned,
                ws.Session_Status
             FROM workout_session ws
             LEFT JOIN workout_plan wp
                ON ws.Plan_ID = wp.Plan_ID
             WHERE ws.User_ID = ?
             ORDER BY ws.Session_Date DESC, ws.Start_Time DESC`,
            [userId]
        );

        // Get exercises for each workout session
        const workoutHistory = [];

        for (const session of sessions) {

            const [exercises] = await db.query(
                `SELECT
                    se.Session_Exercise_ID,
                    se.Exercise_ID,
                    e.Exercise_Name,
                    se.Sets_Completed,
                    se.Reps_Completed,
                    se.Weight_Used,
                    se.Duration
                 FROM session_exercise se
                 JOIN exercise e
                    ON se.Exercise_ID = e.Exercise_ID
                 WHERE se.Session_ID = ?
                 ORDER BY se.Session_Exercise_ID`,
                [session.Session_ID]
            );

            workoutHistory.push({
                sessionId: session.Session_ID,
                userId: session.User_ID,
                planId: session.Plan_ID,
                planName: session.Plan_Name,
                date: session.Session_Date,
                startTime: session.Start_Time,
                endTime: session.End_Time,
                caloriesBurned: session.Calories_Burned,
                status: session.Session_Status,
                exercises: exercises
            });
        }

        res.json({
            userId,
            totalSessions: workoutHistory.length,
            workoutHistory
        });

    } catch (error) {
        console.error('Workout history error:', error);

        res.status(500).json({
            error: error.message
        });
    }
});


// GET FITNESS GOAL PROGRESS FOR A USER

router.get('/:userId/goals', async (req, res) => {
    try {
        const userId = Number(req.params.userId);

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                error: 'Invalid user ID'
            });
        }

        // Retrieve each goal only once, with its first and latest measurements
        const [rows] = await db.query(
            `SELECT
                fg.Goal_ID,
                fg.User_ID,
                fg.Goal_Type,
                fg.Target_Value,
                fg.Target_Unit,
                fg.Start_Date,
                fg.Target_Date,
                fg.Goal_Status,

                (
                    SELECT fp.Weight
                    FROM fitness_progress fp
                    WHERE fp.User_ID = fg.User_ID
                      AND fp.Record_Date >= fg.Start_Date
                      AND fp.Weight IS NOT NULL
                    ORDER BY fp.Record_Date ASC, fp.Progress_ID ASC
                    LIMIT 1
                ) AS Starting_Weight,

                (
                    SELECT fp.Weight
                    FROM fitness_progress fp
                    WHERE fp.User_ID = fg.User_ID
                      AND fp.Weight IS NOT NULL
                    ORDER BY fp.Record_Date DESC, fp.Progress_ID DESC
                    LIMIT 1
                ) AS Current_Weight,

                (
                    SELECT fp.Stamina_Minutes
                    FROM fitness_progress fp
                    WHERE fp.User_ID = fg.User_ID
                      AND fp.Record_Date >= fg.Start_Date
                      AND fp.Stamina_Minutes IS NOT NULL
                    ORDER BY fp.Record_Date ASC, fp.Progress_ID ASC
                    LIMIT 1
                ) AS Starting_Stamina,

                (
                    SELECT fp.Stamina_Minutes
                    FROM fitness_progress fp
                    WHERE fp.User_ID = fg.User_ID
                      AND fp.Stamina_Minutes IS NOT NULL
                    ORDER BY fp.Record_Date DESC, fp.Progress_ID DESC
                    LIMIT 1
                ) AS Current_Stamina

            FROM fitness_goal fg
            WHERE fg.User_ID = ?
            ORDER BY fg.Goal_ID`,
            [userId]
        );

        const goals = rows.map(goal => {
            const target = Number(goal.Target_Value);

            let startingValue = null;
            let currentValue = null;
            let remainingValue = null;
            let progressPercentage = null;
            let progressStatus = 'Measurement not available';

            // WEIGHT LOSS
            if (
                goal.Goal_Type === 'Weight Loss' &&
                goal.Target_Unit === 'kg' &&
                goal.Starting_Weight !== null &&
                goal.Current_Weight !== null
            ) {
                startingValue = Number(goal.Starting_Weight);
                currentValue = Number(goal.Current_Weight);

                const totalToLose = startingValue - target;
                const weightLost = startingValue - currentValue;

                remainingValue = Math.max(0, currentValue - target);

                if (totalToLose > 0) {
                    progressPercentage = Math.min(
                        100,
                        Math.max(0, (weightLost / totalToLose) * 100)
                    );
                }

                progressStatus = currentValue <= target
                    ? 'Target achieved'
                    : 'Progress calculated from weight measurements';
            }

            // WEIGHT GAIN AND BUILD MUSCLE
            else if (
                ['Weight Gain', 'Build Muscle'].includes(goal.Goal_Type) &&
                goal.Target_Unit === 'kg' &&
                goal.Starting_Weight !== null &&
                goal.Current_Weight !== null
            ) {
                startingValue = Number(goal.Starting_Weight);
                currentValue = Number(goal.Current_Weight);

                const totalToGain = target - startingValue;
                const weightGained = currentValue - startingValue;

                remainingValue = Math.max(0, target - currentValue);

                if (totalToGain > 0) {
                    progressPercentage = Math.min(
                        100,
                        Math.max(0, (weightGained / totalToGain) * 100)
                    );
                }

                progressStatus = currentValue >= target
                    ? 'Target achieved'
                    : 'Progress calculated from weight measurements';
            }

            // IMPROVE STAMINA
            else if (
                goal.Goal_Type === 'Improve Stamina' &&
                goal.Target_Unit === 'minutes' &&
                goal.Starting_Stamina !== null &&
                goal.Current_Stamina !== null
            ) {
                startingValue = Number(goal.Starting_Stamina);
                currentValue = Number(goal.Current_Stamina);

                const totalToImprove = target - startingValue;
                const staminaImproved = currentValue - startingValue;

                remainingValue = Math.max(0, target - currentValue);

                if (totalToImprove > 0) {
                    progressPercentage = Math.min(
                        100,
                        Math.max(0, (staminaImproved / totalToImprove) * 100)
                    );
                }

                progressStatus = currentValue >= target
                    ? 'Target achieved'
                    : 'Progress calculated from stamina measurements';
            }

            // MAINTAIN FITNESS
            else if (
                goal.Goal_Type === 'Maintain Fitness' &&
                goal.Target_Unit === 'kg' &&
                goal.Current_Weight !== null
            ) {
                currentValue = Number(goal.Current_Weight);
                remainingValue = Math.abs(currentValue - target);

                progressStatus =
                    'Current weight compared with maintenance target';
            }

            return {
                goalId: goal.Goal_ID,
                userId: goal.User_ID,
                goalType: goal.Goal_Type,
                targetValue: target,
                unit: goal.Target_Unit,
                startingValue,
                currentValue,
                remainingValue:
                    remainingValue === null
                        ? null
                        : Number(remainingValue.toFixed(2)),
                progressPercentage:
                    progressPercentage === null
                        ? null
                        : Number(progressPercentage.toFixed(2)),
                progressStatus,
                goalStatus: goal.Goal_Status,
                startDate: goal.Start_Date,
                targetDate: goal.Target_Date
            };
        });

        res.json({
            userId,
            totalGoals: goals.length,
            goals
        });

    } catch (error) {
        console.error('Goal progress error:', error);

        res.status(500).json({
            error: 'Failed to retrieve fitness goal progress'
        });
    }
});

    return router;
};