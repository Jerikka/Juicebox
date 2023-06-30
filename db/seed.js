const { 
    client,
    getAllUsers,
    createUser
} = require('./index');

async function rebuildDB() {
   
    try {
        client.connect();

        await dropTables();
        await createTables();
        await createInitialUsers();
    } catch (error) {
        console.error(error);
    }
}

async function createInitialUsers() {
    try {

        console.log("Starting to create users...");

        const jacob = await createUser({ username: 'jacob', password: 'jacorbonthecob'});
        const jerikka = await createUser({ username: 'jerikka', password: 'ihategreenbeans'});
        const john = await createUser({username: 'john', password: 'fullstackacademyteacher'});
        const chester = await createUser({ username: 'chester', password: 'hotFryMan'});

        console.log(jacob);

        console.log("Finished creating users!");
        
    } catch (error) {
        console.log("Error creating users!");
        throw error;
    }
}

async function dropTables() {
    try {
        console.log("Starting to drop tables...");

        await client.query(`
        DROP TABLE IF EXISTS users;
        `);

        console.log("Finished dropping tables!");
    } catch (error) {
        console.error("There was a problem dropping tables!");
        throw error; 
    }
}

async function createTables() {
    try {
        console.log("Starting to build tables...")
    
        await client.query(`
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL
        );
        `);

        console.log("Finished building the tables!")
    } catch (error) {
        console.error("There was a problem building the tables!")
        throw error; 
    }
}


async function testDB() {
    try {
        console.log("Starting to test database...")

        const users = await getAllUsers();
        console.log("getAllUsers:", users);

        console.log("Finished testing the database!")
    } catch (error) {
        console.error("There was a problem testing the database :( ");
        throw error; 
    }
}


rebuildDB()
    .then(testDB)
    .catch(console.error)
    .finally(() => client.end());