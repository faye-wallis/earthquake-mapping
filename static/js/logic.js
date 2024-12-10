const { MongoClient } = require('mongodb');

async function run() {
    // Connection URL
    const url = 'mongodb://localhost:27017/'; // replace with your MongoDB URL
    const client = new MongoClient(url);

    try {
        // Connect the client to the server
        await client.connect();

        // Specify the database and collection
        const database = client.db('autosaurus'); // replace with your database name
        const collection = database.collection('customers'); // replace with your collection name

        // Query the collection
        const query = {}; // define your query here
        const data = await collection.find(query).toArray();

        console.log(data); // Output the data
    } finally {
        // Close the connection
        await client.close();
    }
}

run().catch(console.error);