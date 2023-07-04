const { 
    client,
    createUser,
    updateUser,
    getAllUsers,
    getUserById,
    createPost,
    updatePost,
    getAllPosts,
    createTags,
    getPostsByTagName,
    addTagsToPost
} = require('./index');

async function dropTables() {
    try {
        console.log("Starting to drop tables...");

        await client.query(`
        DROP TABLE IF EXISTS post_tags;
        DROP TABLE IF EXISTS tags;
        DROP TABLE IF EXISTS posts;
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
            password VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            location VARCHAR(255) NOT NULL,
            active BOOLEAN DEFAULT true
        );

        CREATE TABLE posts (
            id SERIAL PRIMARY KEY,
            "authorId" INTEGER REFERENCES users(id),
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            active BOOLEAN DEFAULT true
        );

        CREATE TABLE tags (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL
        );

        CREATE TABLE post_tags (
            "postId" INTEGER REFERENCES posts(id),
            "tagId" INTEGER REFERENCES tags(id),
            CONSTRAINT post_tags_unique UNIQUE ("postId", "tagId")
        );
        `);

        console.log("Finished building the tables!")
    } catch (error) {
        console.error("There was a problem building the tables!")
        throw error; 
    }
}

async function createInitialUsers() {
    try {

        console.log("Starting to create users...");

        await createUser({ 
            username: 'jacob', 
            password: 'jacornonthecob', 
            name:'theJacob', 
            location:'Memphis, Tennessee'
        });
        
        await createUser({ 
            username: 'jerikka', 
            password: 'ihategreenbeans', 
            name: 'JerBear', 
            location: 'Shreveport, Louisiana'
        });
        
        await createUser({ 
            username: 'john', 
            password: 'fullstackacademyteacher', 
            name: 'JohnCastrillon', 
            location: 'theUnitedStates'
        });
        
        await createUser({ 
            username: 'chester', 
            password: 'hotFryMan', 
            name: 'ChesterTheTiger', 
            location: 'OnAHotFriesBag, Anywhere'
        });

        console.log("Finished creating users!");
        
    } catch (error) {
        console.log("Error creating users!");
        throw error;
    }
}

async function createInitialPosts() {
    try {
        const [jacob, jerikka, john, chester] = await getAllUsers();

        console.log("Starting to create posts...")
        await createPost({
            authorId: jacob.id,
            title: "First Post",
            content: "This is my first posts. I'm super excited.",
            tags: ["#happy", "#isthislikefacebook?"]
        });

        await createPost({
            authorId: jerikka.id,
            title: "This is New",
            content: "I just joined, make sure you guys follow me!!",
            tags: ["#happy", "#follow-me<3"]
        });

        await createPost({
            authorId: john.id,
            title: "How Do I Work This Thing?",
            content: "I have no idea how to work this, someone help.",
            tags: ["#isthislikefacebook?"]
        });

        await createPost({
            authorId: chester.id,
            title: "This is hot stuff!",
            content: "This reminds me of those hot cheetos that all the kids are raving about..",
            tags: ["#happy", "#hotfries"]
        });
        console.log("Finished creating posts!");
    } catch (error) {
        console.log("Error creating posts!")
        throw error;
    };
}

async function rebuildDB() {
   
    try {
        client.connect();

        await dropTables();
        await createTables();
        await createInitialUsers();
        await createInitialPosts();
    } catch (error) {
        console.log("There is a problem during rebuildDB")
        throw error;
    }
}

async function testDB() {
    try {
        console.log("Starting to test database...")

        console.log("Calling getAllUsers")
        const users = await getAllUsers();
        console.log("Result:", users);

        console.log("Calling updateUser on users[0]")
        const updateUserResult = await updateUser(users[0].id, {
            name: "Catchup Mustard",
            location: "New York City, New York"
        });
        console.log("Result:", updateUserResult);

        console.log("Calling getAllPosts");
        const posts = await getAllPosts();
        console.log("Result:", posts);

        console.log("Calling updatePost on post[1], only updating tags");
        const updatePostTagsResult = await updatePost(posts[1].id, {
            tags: ["#follow-me<3", "#happy", "#isthislikefacebook?"]
        });
        console.log("Result:", updatePostTagsResult);

        console.log("Calling getPostsByTagName with #happy");
        const postsWithHappy = await getPostsByTagName("#happy")
        console.log("Result:", postsWithHappy);

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