
const jwt = require('jsonwebtoken');

module.exports = (db) => {

    // Verify JWT and identify the current user
    const authenticateToken = async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({
                    message: 'Authentication required'
                });
            }

            const token = authHeader.split(' ')[1];

const decoded = jwt.verify(token, process.env.JWT_SECRET);


            // Fetch current role from MySQL
            const [users] = await db.query(
                `SELECT
                    u.User_ID,
                    u.Email,
                    u.Role_ID,
                    r.Role_Name
                 FROM user u
                 JOIN ROLE r ON u.Role_ID = r.Role_ID
                 WHERE u.User_ID = ?`,
                [decoded.userId]
            );

            if (users.length === 0) {
                return res.status(401).json({
                    message: 'User account not found'
                });
            }

            // Attach authenticated user information
            req.user = users[0];
            console.log("AUTH DEBUG - User ID:", req.user.User_ID);
            console.log("AUTH DEBUG - Role Name:", req.user.Role_Name);

            next();

        } catch (error) {

    return res.status(401).json({
        message: 'Invalid or expired token'
    });
}
    };

    // Check whether the user has the required role
    const authorizeRoles = (...allowedRoles) => {
        return (req, res, next) => {

            if (!req.user) {
                return res.status(401).json({
                    message: 'Authentication required'
                });
            }
            console.log("AUTH DEBUG - Allowed Roles:", allowedRoles);
            console.log("AUTH DEBUG - Actual Role:", req.user.Role_Name);

            if (!allowedRoles.includes(req.user.Role_Name)) {
                return res.status(403).json({
                    message: 'Access denied. Insufficient permissions.'
                });
            }

            next();
        };
    };

    return {
        authenticateToken,
        authorizeRoles
    };
};
