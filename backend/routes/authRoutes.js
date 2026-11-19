
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = (db) => {
    const router = express.Router();

    // REGISTER
    router.post('/register', async (req, res) => {
        try {
            const {
                firstName,
                lastName,
                email,
                password,
                dateOfBirth,
                gender,
                height,
                weight,
                fitnessLevel
            } = req.body;

            if (!firstName || !lastName || !email || !password) {
                return res.status(400).json({
                    message: 'First name, last name, email and password are required'
                });
            }

            // Validate password strength
const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

if (!passwordRegex.test(password)) {
    return res.status(400).json({
        message: 'Password must contain at least 8 characters, including uppercase, lowercase, number and special character (@$!%*?&)'
    });
}

            // Validate Date of Birth
if (dateOfBirth) {
    const today = new Date();

    const todayString = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    if (dateOfBirth > todayString) {
        return res.status(400).json({
            message: "Date of birth cannot be in the future"
        });
    }
}

            const normalizedEmail = email.trim().toLowerCase();

            const [existingUsers] = await db.query(
                'SELECT User_ID FROM user WHERE Email = ?',
                [normalizedEmail]
            );

            if (existingUsers.length > 0) {
                return res.status(409).json({
                    message: 'An account with this email already exists'
                });
            }

            const passwordHash = await bcrypt.hash(password, 12);

            const [result] = await db.query(
                `INSERT INTO user
                (First_Name, Last_Name, Email, Password_Hash,
                 Date_of_Birth, Gender, Height, Weight, Fitness_Level)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    firstName.trim(),
                    lastName.trim(),
                    normalizedEmail,
                    passwordHash,
                    dateOfBirth || null,
                    gender || null,
                    height || null,
                    weight || null,
                    fitnessLevel || null
                ]
            );

            res.status(201).json({
                message: 'Registration successful',
                userId: result.insertId
            });

        } catch (error) {
            console.error('Registration error:', error);

            res.status(500).json({
                message: 'Registration failed'
            });
        }
    });

    // LOGIN
    router.post('/login', async (req, res) => {
        console.log("ADMIN LOGIN ROUTE REACHED");
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    message: 'Email and password are required'
                });
            }

            const normalizedEmail = email.trim().toLowerCase();

            
const [users] = await db.query(
    `SELECT
        u.User_ID,
        u.First_Name,
        u.Last_Name,
        u.Email,
        u.Password_Hash,
        u.Date_of_Birth,
        u.Gender,
        u.Height,
        u.Weight,
        u.Fitness_Level,
        u.Role_ID,
        r.Role_Name
     FROM user u
     JOIN ROLE r ON u.Role_ID = r.Role_ID
     WHERE u.Email = ?`,
    [normalizedEmail]
);
console.log("LOGIN DEBUG - Email:", normalizedEmail);
console.log("LOGIN DEBUG - Users found:", users.length);


            if (users.length === 0) {
                return res.status(401).json({
                    message: 'Invalid email or password'
                });
            }

            const user = users[0];

console.log("LOGIN DEBUG - User ID:", user.User_ID);
console.log("LOGIN DEBUG - Hash length:", user.Password_Hash?.length);

const passwordMatches = await bcrypt.compare(password, user.Password_Hash);

console.log("LOGIN DEBUG - Password matches:", passwordMatches);

            if (!passwordMatches) {
                return res.status(401).json({
                    message: 'Invalid email or password'
                });
            }

            const token = jwt.sign(
    {
        userId: user.User_ID,
        roleId: user.Role_ID,
        roleName: user.Role_Name
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
);

delete user.Password_Hash;

res.json({
    message: 'Login successful',
    token,
    user: {
        ...user,
        Role_ID: user.Role_ID,
        Role_Name: user.Role_Name
    }
});

        } catch (error) {
            console.error('Login error:', error);

            res.status(500).json({
                message: 'Login failed'
            });
        }
    });

    // GET LOGGED-IN USER PROFILE
    router.get('/profile', async (req, res) => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({
                    message: 'Authentication required'
                });
            }

            const token = authHeader.split(' ')[1];

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            const [users] = await db.query(
                `SELECT User_ID, First_Name, Last_Name, Email,
                        Date_of_Birth, Gender, Height, Weight,
                        Fitness_Level
                 FROM user
                 WHERE User_ID = ?`,
                [decoded.userId]
            );

            if (users.length === 0) {
                return res.status(404).json({
                    message: 'User not found'
                });
            }

            res.json({ user: users[0] });

        } catch (error) {
            return res.status(401).json({
                message: 'Invalid or expired token'
            });
        }
    });

    
    // UPDATE USER PROFILE
    router.put('/profile', async (req, res) => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({
                    message: 'Authentication required'
                });
            }

            const token = authHeader.split(' ')[1];

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            const {
                firstName,
                lastName,
                email,
                dateOfBirth,
                gender,
                height,
                weight,
                fitnessLevel
            } = req.body;

            if (!firstName?.trim() || !lastName?.trim() || !email?.trim()) {
                return res.status(400).json({
                    message: 'First name, last name and email are required'
                });
            }

            const normalizedEmail = email.trim().toLowerCase();

            // Validate email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(normalizedEmail)) {
                return res.status(400).json({
                    message: 'Please enter a valid email address'
                });
            }

            // Validate Date of Birth
            if (dateOfBirth) {
                const dob = new Date(dateOfBirth + 'T00:00:00');
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (Number.isNaN(dob.getTime()) || dob > today) {
                    return res.status(400).json({
                        message: 'Please enter a valid date of birth'
                    });
                }
            }

            // Check whether email belongs to another user
            const [existingUsers] = await db.query(
                `SELECT User_ID FROM user
                 WHERE Email = ? AND User_ID != ?`,
                [normalizedEmail, decoded.userId]
            );

            if (existingUsers.length > 0) {
                return res.status(409).json({
                    message: 'This email is already registered'
                });
            }

            // Update profile in MySQL
            await db.query(
                `UPDATE user
                 SET First_Name = ?,
                     Last_Name = ?,
                     Email = ?,
                     Date_of_Birth = ?,
                     Gender = ?,
                     Height = ?,
                     Weight = ?,
                     Fitness_Level = ?
                 WHERE User_ID = ?`,
                [
                    firstName.trim(),
                    lastName.trim(),
                    normalizedEmail,
                    dateOfBirth || null,
                    gender || null,
                    height === '' || height == null ? null : height,
                    weight === '' || weight == null ? null : weight,
                    fitnessLevel || null,
                    decoded.userId
                ]
            );

            // Fetch updated profile
            const [users] = await db.query(
                `SELECT User_ID, First_Name, Last_Name, Email,
                        Date_of_Birth, Gender, Height, Weight,
                        Fitness_Level
                 FROM user
                 WHERE User_ID = ?`,
                [decoded.userId]
            );

            res.json({
                message: 'Profile updated successfully',
                user: users[0]
            });

        } catch (error) {
            console.error('Profile update error:', error);

            res.status(401).json({
                message: 'Unable to update profile. Please login again.'
            });
        }
    });


    // CHANGE PASSWORD
    router.put('/change-password', async (req, res) => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({
                    message: 'Authentication required'
                });
            }

            const token = authHeader.split(' ')[1];

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    message: 'Current password and new password are required'
                });
            }

            // Validate new password strength
            const passwordRegex =
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

            if (!passwordRegex.test(newPassword)) {
                return res.status(400).json({
                    message: 'New password must contain at least 8 characters, uppercase, lowercase, number and special character (@$!%*?&)'
                });
            }

            if (currentPassword === newPassword) {
                return res.status(400).json({
                    message: 'New password must be different from current password'
                });
            }

            // Fetch current password hash
            const [users] = await db.query(
                'SELECT Password_Hash FROM user WHERE User_ID = ?',
                [decoded.userId]
            );

            if (users.length === 0) {
                return res.status(404).json({
                    message: 'User not found'
                });
            }

            // Verify current password
            const passwordMatches = await bcrypt.compare(
                currentPassword,
                users[0].Password_Hash
            );

            if (!passwordMatches) {
                return res.status(401).json({
                    message: 'Current password is incorrect'
                });
            }

            // Hash and save new password
            const newPasswordHash = await bcrypt.hash(newPassword, 12);

            await db.query(
                'UPDATE user SET Password_Hash = ? WHERE User_ID = ?',
                [newPasswordHash, decoded.userId]
            );

            res.json({
                message: 'Password changed successfully'
            });

        } catch (error) {
            console.error('Change password error:', error);

            res.status(500).json({
                message: 'Unable to change password'
            });
        }
    });

    return router;
};
