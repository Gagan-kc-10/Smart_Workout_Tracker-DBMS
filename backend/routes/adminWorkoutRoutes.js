
module.exports = (db) => {
    const express = require("express");
    const router = express.Router();

    const { authenticateToken, authorizeRoles } =
        require("../middleware/authMiddleware")(db);

    // GET ADMIN WORKOUT SUMMARY
    router.get(
        "/summary",
        authenticateToken,
        authorizeRoles("Admin"),
        async (req, res) => {
            try {
                const [[planResult]] = await db.query(
                    `SELECT COUNT(*) AS totalPlans
                     FROM workout_plan`
                );

                const [[sessionResult]] = await db.query(
                    `SELECT
                        COUNT(*) AS totalSessions,
                        COALESCE(SUM(CASE
                            WHEN Session_Status = 'Completed'
                            THEN 1 ELSE 0
                        END), 0) AS completedSessions,
                        COALESCE(SUM(CASE
                            WHEN Session_Status = 'In Progress'
                            THEN 1 ELSE 0
                        END), 0) AS activeSessions,
                        COALESCE(SUM(Calories_Burned), 0)
                            AS totalCalories
                     FROM workout_session`
                );

                res.json({
                    success: true,
                    totalPlans: planResult.totalPlans,
                    totalSessions: sessionResult.totalSessions,
                    completedSessions: sessionResult.completedSessions,
                    activeSessions: sessionResult.activeSessions,
                    totalCalories: Number(
                        sessionResult.totalCalories
                    )
                });

            } catch (error) {
                console.error("Admin workout summary error:", error);

                res.status(500).json({
                    message: "Failed to load workout summary"
                });
            }
        }
    );

    // GET ALL WORKOUT PLANS
    router.get(
        "/plans",
        authenticateToken,
        authorizeRoles("Admin"),
        async (req, res) => {
            try {
                const [plans] = await db.query(
                    `SELECT
                        wp.Plan_ID,
                        wp.User_ID,
                        CONCAT(u.First_Name, ' ', u.Last_Name)
                            AS User_Name,
                        wp.Plan_Name,
                        wp.Plan_Type,
                        wp.Start_Date,
                        wp.End_Date,
                        wp.Plan_Status,
                        COUNT(pe.Plan_Exercise_ID) AS Total_Exercises
                     FROM workout_plan wp
                     JOIN user u
                        ON wp.User_ID = u.User_ID
                     LEFT JOIN plan_exercise pe
                        ON wp.Plan_ID = pe.Plan_ID
                     GROUP BY
                        wp.Plan_ID,
                        wp.User_ID,
                        u.First_Name,
                        u.Last_Name,
                        wp.Plan_Name,
                        wp.Plan_Type,
                        wp.Start_Date,
                        wp.End_Date,
                        wp.Plan_Status
                     ORDER BY wp.Plan_ID DESC`
                );

                res.json({
                    success: true,
                    totalPlans: plans.length,
                    plans
                });

            } catch (error) {
                console.error("Admin workout plans error:", error);

                res.status(500).json({
                    message: "Failed to load workout plans"
                });
            }
        }
    );

    // GET ALL WORKOUT SESSIONS
    router.get(
        "/sessions",
        authenticateToken,
        authorizeRoles("Admin"),
        async (req, res) => {
            try {
                const [sessions] = await db.query(
                    `SELECT
                        ws.Session_ID,
                        ws.User_ID,
                        CONCAT(u.First_Name, ' ', u.Last_Name)
                            AS User_Name,
                        ws.Plan_ID,
                        wp.Plan_Name,
                        ws.Session_Date,
                        ws.Start_Time,
                        ws.End_Time,
                        ws.Calories_Burned,
                        ws.Session_Status
                     FROM workout_session ws
                     JOIN user u
                        ON ws.User_ID = u.User_ID
                     LEFT JOIN workout_plan wp
                        ON ws.Plan_ID = wp.Plan_ID
                     ORDER BY
                        ws.Session_Date DESC,
                        ws.Start_Time DESC`
                );

                res.json({
                    success: true,
                    totalSessions: sessions.length,
                    sessions
                });

            } catch (error) {
                console.error("Admin workout sessions error:", error);

                res.status(500).json({
                    message: "Failed to load workout sessions"
                });
            }
        }
    );

    return router;
};
