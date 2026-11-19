
const db = require('./config/mysql');

async function testMySQL() {
    try {
        const [rows] = await db.query(
            'SELECT DATABASE() AS database_name'
        );

        console.log('MySQL connected successfully!');
        console.log('Database:', rows[0].database_name);

    } catch (error) {
        console.error('MySQL connection failed:', error.message);

    } finally {
        await db.end();
    }
}

testMySQL();
