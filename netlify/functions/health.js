export const handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      message: "Restaurant Orders API is running",
      version: "1.0.0",
      status: "healthy",
    }),
  };
};
