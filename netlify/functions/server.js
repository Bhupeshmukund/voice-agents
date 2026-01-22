import serverless from "serverless-http";
import app from "../../app.js";

// Export the serverless-wrapped Express app
export const handler = serverless(app);
