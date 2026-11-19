require('dotenv').config({
    path: require('path').join(__dirname, '.env'),
    override: true
});

const db = require('./config/mysql');
const bcrypt = require('bcryptjs');

async function test() {
    try {
        const [users] = await db.query(
            `SELECT User_ID, Email, Role_ID, Password_Hash
             FROM user
             WHERE Email = ?`,
            ['arjun.mehta@smartworkout.com']
        );

        if (users.length === 0) {
            console.log('Admin user not found.');
            return;
        }

        const admin = users[0];

        console.log('User ID:', admin.User_ID);
        console.log('Email:', admin.Email);
        console.log('Role ID:', admin.Role_ID);
        console.log('Hash length:', admin.Password_Hash.length);

        const isMatch = await bcrypt.compare(
            'Admin@12345',
            admin.Password_Hash
        );

        console.log('Password match:', isMatch);

    } catch (error) {
        console.error('Test error:', error.message);
    } finally {
        await db.end();
    }
}

test();