// Import the MongoDB native driver
import { MongoClient } from 'mongodb';

// Connection URI
const uri = 'mongodb+srv://slsaini28:wheels2go@wheels2go.0kdqcmz.mongodb.net/?retryWrites=true&w=majority';

// Database Name
const dbName = 'mydatabase';

// Create a new MongoClient
const client = new MongoClient(uri);

export async function connectToMongoDB() {
  try {
    // Connect the client to the server
    await client.connect();
    console.log('Connected to MongoDB server');

    // Access a specific database
    const db = client.db(dbName);
    
    return db; // Return the database connection
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error; // Throw the error for handling in the caller
  }
}

export async function closeMongoDBConnection() {
  try {
    await client.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    throw error; // Throw the error for handling in the caller
  }
}
