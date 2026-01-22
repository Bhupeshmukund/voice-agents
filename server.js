import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 3000;

// Connect to MongoDB for local development
connectDB();

// Start server for local development
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});
