import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://your-cluster-link-here";

// Set up connection event listeners
mongoose.connection.on("connected", () => {
  console.log("✅ MongoDB Connection: ACTIVE");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB Connection Error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  MongoDB Connection: DISCONNECTED");
});

const connectDB = async () => {
  try {
    // Check if already connected (for serverless function reuse)
    if (mongoose.connection.readyState === 1) {
      console.log("✅ MongoDB Already Connected (Reusing connection)");
      return mongoose.connection;
    }

    console.log("Attempting to connect to MongoDB...");
    console.log(`Connection URI: ${MONGODB_URI.replace(/:[^:@]+@/, ':****@')}`); // Hide password in logs
    
    const conn = await mongoose.connect(MONGODB_URI, {
      // These options are recommended for MongoDB Atlas
      serverSelectionTimeoutMS: 10000, // Increased timeout for better connection reliability
      socketTimeoutMS: 45000,
    });

    // Wait a moment to ensure connection is fully established
    await new Promise(resolve => setTimeout(resolve, 100));

    console.log("✅ MongoDB Connected Successfully!");
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Ready State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    return conn;
  } catch (error) {
    console.error("❌ MongoDB Connection Failed!");
    console.error(`   Error: ${error.message}`);
    console.error("   Please check your connection string and network access settings.");
    // Don't exit process in serverless environment
    if (process.env.NETLIFY !== 'true') {
      process.exit(1);
    }
    throw error;
  }
};

export default connectDB;
