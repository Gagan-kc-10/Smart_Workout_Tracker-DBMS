
const bcrypt = require('bcryptjs');
const db = require('../config/mysql');

async function createAdmin() {
    try {
        const firstName = 'Admin';
        const lastName = 'Account';
        const email = 'admin@smartworkout.com';

        // Check whether this email already exists
        const [existing] = await db.query(
            'SELECT User_ID FROM user WHERE Email = ?',
            [email]
        );

        if (existing.length > 0) {
            console.log('Admin account already exists.');
            return;
        }

        // Enter a password locally when prompted
        const password = process.env.ADMIN_PASSWORD;

        if (!password) {
            throw new Error('ADMIN_PASSWORD is not configured.');
        }

        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!passwordRegex.test(password)) {
            throw new Error('Password does not meet the required strength.');
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const [result] = await db.query(
            `INSERT INTO user
            (First_Name, Last_Name, Email, Password_Hash, Role_ID)
            VALUES (?, ?, ?, ?, ?)`,
            [firstName, lastName, email, passwordHash, 3]
        );

        console.log('Admin account created successfully.');
        console.log('Admin User_ID:', result.insertId);
        console.log('Admin Email:', email);

    } catch (error) {
        console.error('Admin creation failed:', error.message);
    } finally {
        await db.end();
    }
}

createAdmin();
