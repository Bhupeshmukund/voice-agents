import serverless from "serverless-http";
import appModule from "../../app.js";

// Handle default export for Netlify serverless environment
const app = appModule?.default || appModule;

// Export the serverless-wrapped Express app
export const handler = serverless(app);
