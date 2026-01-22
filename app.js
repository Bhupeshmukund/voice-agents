import express from "express";
import connectDB from "./config/db.js";
import restaurantOrdersRoutes from "./routes/resturantorders.js";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB on first request (serverless-friendly)
// Connection will be reused across function invocations
let connectionPromise = null;

const ensureDBConnection = async () => {
  if (!connectionPromise) {
    connectionPromise = connectDB().catch(err => {
      connectionPromise = null; // Reset on error to allow retry
      throw err;
    });
  }
  return connectionPromise;
};

// Middleware to ensure DB connection before handling requests
app.use(async (req, res, next) => {
  try {
    await ensureDBConnection();
    next();
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({
      success: false,
      error: "Database connection failed"
    });
  }
});

// Routes
app.use("/api", restaurantOrdersRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({
    message: "Restaurant Orders API is running",
    version: "1.0.0"
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    error: err.message || "Internal server error"
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found"
  });
});

export default app;
