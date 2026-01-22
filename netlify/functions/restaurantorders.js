import mongoose from "mongoose";
import Order from "../../models/Order.js";

// MongoDB connection caching for serverless (reuse connections across invocations)
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // Return existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Return existing promise if connection is in progress
  if (!cached.promise) {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not set");
    }

    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    }).then((mongoose) => {
      console.log("✅ MongoDB Connected Successfully!");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Helper function to parse path and extract ID
function parsePath(path, pathParameters) {
  // Use pathParameters if available (from Netlify routing)
  if (pathParameters && pathParameters.id) {
    const action = pathParameters.action || pathParameters.proxy;
    return { id: pathParameters.id, action };
  }
  
  // Otherwise parse from path string
  // Handle various path formats: /api/restaurant-orders/:id, /restaurant-orders/:id, etc.
  const cleanPath = path
    .replace(/^\/\.netlify\/functions\/restaurantorders/, "")
    .replace(/^\/api\/restaurant-orders/, "")
    .replace(/^\/restaurant-orders/, "");
  
  // Extract ID and action (status)
  const parts = cleanPath.split("/").filter(Boolean);
  const id = parts[0];
  const action = parts[1]; // e.g., "status"
  
  return { id, action };
}

// Helper function to validate ObjectId
function isValidObjectId(id) {
  return id && /^[0-9a-fA-F]{24}$/.test(id);
}

// Main handler function
export const handler = async (event) => {
  // Set CORS headers
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  };

  // Handle OPTIONS request for CORS
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  try {
    // Connect to database
    await connectDB();

    const { httpMethod, path, pathParameters, body } = event;
    const parsedBody = body ? JSON.parse(body) : {};
    const { id, action } = parsePath(path, pathParameters);
    
    // Debug logging (remove in production if needed)
    console.log("Request details:", { httpMethod, path, pathParameters, id, action });

    // Route: GET /api/restaurant-orders (get all orders)
    if (httpMethod === "GET" && !id) {
      try {
        const orders = await Order.find()
          .sort({ createdAt: -1 })
          .select("-__v");

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            orders: orders,
          }),
        };
      } catch (err) {
        console.error("GET RESTAURANT ORDERS ERROR:", err);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            error: err.message,
          }),
        };
      }
    }

    // Route: GET /api/restaurant-orders/:id (get single order)
    if (httpMethod === "GET" && id) {
      try {
        if (!isValidObjectId(id)) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: "Invalid order ID format",
            }),
          };
        }

        const order = await Order.findById(id).select("-__v");

        if (!order) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({
              success: false,
              error: "Order not found",
            }),
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            order: order,
          }),
        };
      } catch (err) {
        console.error("GET RESTAURANT ORDER ERROR:", err);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            error: err.message,
          }),
        };
      }
    }

    // Route: POST /api/restaurant-orders (create order)
    if (httpMethod === "POST") {
      try {
        const { name, order_items, address, phone_no, amount, collection, status } = parsedBody;

        // Validate required fields
        if (!name) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: "Name is required",
            }),
          };
        }

        if (!order_items || !Array.isArray(order_items) || order_items.length === 0) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: "Order items are required and must be an array",
            }),
          };
        }

        if (!address) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: "Address is required",
            }),
          };
        }

        if (!phone_no) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: "Phone number is required",
            }),
          };
        }

        if (!amount || amount <= 0) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: "Valid amount is required",
            }),
          };
        }

        if (!collection) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: "Collection method is required",
            }),
          };
        }

        // Create new order
        const order = new Order({
          name,
          order_items,
          address,
          phone_no,
          amount,
          collectionMethod: collection,
          status: status || "pending",
        });

        const savedOrder = await order.save();

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({
            success: true,
            orderId: savedOrder._id,
            message: "Restaurant order created successfully",
          }),
        };
      } catch (err) {
        console.error("CREATE RESTAURANT ORDER ERROR:", err);
        const statusCode = err.name === "ValidationError" ? 400 : 500;
        return {
          statusCode,
          headers,
          body: JSON.stringify({
            success: false,
            error: err.message,
          }),
        };
      }
    }

    // Route: PATCH /api/restaurant-orders/:id/status (update status only)
    if (httpMethod === "PATCH" && id && action === "status") {
      try {
        const { status } = parsedBody;

        if (!status) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: "Status is required",
            }),
          };
        }

        const validStatuses = ["pending", "processing", "ready", "completed", "cancelled"];
        if (!validStatuses.includes(status)) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: "Invalid status. Valid statuses are: pending, processing, ready, completed, cancelled",
            }),
          };
        }

        if (!isValidObjectId(id)) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: "Invalid order ID format",
            }),
          };
        }

        const order = await Order.findByIdAndUpdate(
          id,
          { status },
          { new: true, runValidators: true }
        ).select("-__v");

        if (!order) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({
              success: false,
              error: "Order not found",
            }),
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: "Order status updated successfully",
            order: order,
          }),
        };
      } catch (err) {
        console.error("UPDATE RESTAURANT ORDER STATUS ERROR:", err);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            error: err.message,
          }),
        };
      }
    }

    // Route: PATCH /api/restaurant-orders/:id (update order)
    if (httpMethod === "PATCH" && id && !action) {
      try {
        if (!isValidObjectId(id)) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: "Invalid order ID format",
            }),
          };
        }

        const { name, order_items, address, phone_no, amount, collection, status } = parsedBody;

        // Build update object dynamically
        const updateData = {};

        if (name !== undefined) {
          updateData.name = name;
        }

        if (order_items !== undefined) {
          if (!Array.isArray(order_items)) {
            return {
              statusCode: 400,
              headers,
              body: JSON.stringify({
                success: false,
                error: "Order items must be an array",
              }),
            };
          }
          updateData.order_items = order_items;
        }

        if (address !== undefined) {
          updateData.address = address;
        }

        if (phone_no !== undefined) {
          updateData.phone_no = phone_no;
        }

        if (amount !== undefined) {
          if (amount <= 0) {
            return {
              statusCode: 400,
              headers,
              body: JSON.stringify({
                success: false,
                error: "Amount must be greater than 0",
              }),
            };
          }
          updateData.amount = amount;
        }

        if (collection !== undefined) {
          updateData.collectionMethod = collection;
        }

        if (status !== undefined) {
          updateData.status = status;
        }

        if (Object.keys(updateData).length === 0) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: "No fields to update",
            }),
          };
        }

        const order = await Order.findByIdAndUpdate(
          id,
          updateData,
          { new: true, runValidators: true }
        ).select("-__v");

        if (!order) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({
              success: false,
              error: "Order not found",
            }),
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: "Order updated successfully",
            order: order,
          }),
        };
      } catch (err) {
        console.error("UPDATE RESTAURANT ORDER ERROR:", err);
        const statusCode = err.name === "ValidationError" ? 400 : 500;
        return {
          statusCode,
          headers,
          body: JSON.stringify({
            success: false,
            error: err.message,
          }),
        };
      }
    }

    // Route: DELETE /api/restaurant-orders/:id (delete order)
    if (httpMethod === "DELETE" && id) {
      try {
        if (!isValidObjectId(id)) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: "Invalid order ID format",
            }),
          };
        }

        const order = await Order.findByIdAndDelete(id);

        if (!order) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({
              success: false,
              error: "Order not found",
            }),
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: "Order deleted successfully",
          }),
        };
      } catch (err) {
        console.error("DELETE RESTAURANT ORDER ERROR:", err);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            error: err.message,
          }),
        };
      }
    }

    // Method not allowed
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Method Not Allowed",
      }),
    };
  } catch (error) {
    console.error("DATABASE CONNECTION ERROR:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: false,
        error: error.message || "Database connection failed",
      }),
    };
  }
};
