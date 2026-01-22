import mongoose from "mongoose";
import dotenv from "dotenv";

// Only load dotenv in local development (not in Netlify)
if (process.env.NODE_ENV !== 'production' || !process.env.NETLIFY) {
  dotenv.config();
}

const MONGODB_URI = process.env.MONGODB_URI;

// Validate that MONGODB_URI is set and not a placeholder
if (!MONGODB_URI || MONGODB_URI.includes('your-cluster-link-here')) {
  const errorMsg = "MONGODB_URI environment variable is not set or is using placeholder value. Please set it in Netlify environment variables.";
  console.error("❌", errorMsg);
  throw new Error(errorMsg);
}

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
    if (MONGODB_URI) {
      console.log(`Connection URI: ${MONGODB_URI.replace(/:[^:@]+@/, ':****@')}`); // Hide password in logs
    }
    
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
    console.error(`   Error Code: ${error.code || 'N/A'}`);
    console.error(`   MONGODB_URI is set: ${!!MONGODB_URI}`);
    console.error(`   MONGODB_URI starts with mongodb: ${MONGODB_URI?.startsWith('mongodb') || false}`);
    console.error("   Please check:");
    console.error("   1. MONGODB_URI is set in Netlify environment variables");
    console.error("   2. MongoDB Atlas network access allows connections from anywhere (0.0.0.0/0)");
    console.error("   3. Connection string is correct and includes database name");
    // Don't exit process in serverless environment
    if (process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      // Serverless environment - just throw, don't exit
      throw error;
    }
    process.exit(1);
  }
};

export default connectDB;
