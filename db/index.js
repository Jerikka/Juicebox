const { Client } = require('pg');

const client = new Client('postgress://localhost:5432/juicebox-dev');

async function createUser({username, password}) {
    try {
        const { rows } = await client.query(`
        SELECT username, password
        FROM users;
        `)

        return rows;
    } catch (error) {
        throw error;
    }
}

async function getAllUsers() {
    const {rows} = await client.query(`
        SELECT id, username
        FROM users;
    `)

    return rows;
}


module.exports = {
    client,
    createUser,
    getAllUsers,
}