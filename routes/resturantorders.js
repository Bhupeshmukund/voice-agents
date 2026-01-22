import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

// Get all restaurant orders
router.get("/restaurant-orders", async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .select("-__v");

    res.json({
      success: true,
      orders: orders
    });
  } catch (err) {
    console.error("GET RESTAURANT ORDERS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get a single restaurant order by ID
router.get("/restaurant-orders/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid order ID format" });
    }

    const order = await Order.findById(id).select("-__v");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({
      success: true,
      order: order
    });
  } catch (err) {
    console.error("GET RESTAURANT ORDER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// Create a new restaurant order
router.post("/restaurant-orders", async (req, res) => {
  try {
    const { name, order_items, address, phone_no, amount, collection, status } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    if (!order_items || !Array.isArray(order_items) || order_items.length === 0) {
      return res.status(400).json({ error: "Order items are required and must be an array" });
    }

    if (!address) {
      return res.status(400).json({ error: "Address is required" });
    }

    if (!phone_no) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Valid amount is required" });
    }

    if (!collection) {
      return res.status(400).json({ error: "Collection method is required" });
    }

    // Create new order
    const order = new Order({
      name,
      order_items,
      address,
      phone_no,
      amount,
      collectionMethod: collection, // Map 'collection' from request to 'collectionMethod' in schema
      status: status || "pending"
    });

    const savedOrder = await order.save();

    res.status(201).json({
      success: true,
      orderId: savedOrder._id,
      message: "Restaurant order created successfully"
    });
  } catch (err) {
    console.error("CREATE RESTAURANT ORDER ERROR:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// Update restaurant order status
router.patch("/restaurant-orders/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const validStatuses = ["pending", "processing", "ready", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status. Valid statuses are: pending, processing, ready, completed, cancelled" });
    }

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid order ID format" });
    }

    // Update order status
    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({
      success: true,
      message: "Order status updated successfully",
      order: order
    });
  } catch (err) {
    console.error("UPDATE RESTAURANT ORDER STATUS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// Update restaurant order
router.patch("/restaurant-orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, order_items, address, phone_no, amount, collection, status } = req.body;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid order ID format" });
    }

    // Build update object dynamically based on provided fields
    const updateData = {};

    if (name !== undefined) {
      updateData.name = name;
    }

    if (order_items !== undefined) {
      if (!Array.isArray(order_items)) {
        return res.status(400).json({ error: "Order items must be an array" });
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
        return res.status(400).json({ error: "Amount must be greater than 0" });
      }
      updateData.amount = amount;
    }

    if (collection !== undefined) {
      updateData.collectionMethod = collection; // Map 'collection' from request to 'collectionMethod' in schema
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select("-__v");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({
      success: true,
      message: "Order updated successfully",
      order: order
    });
  } catch (err) {
    console.error("UPDATE RESTAURANT ORDER ERROR:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// Delete restaurant order
router.delete("/restaurant-orders/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid order ID format" });
    }

    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({
      success: true,
      message: "Order deleted successfully"
    });
  } catch (err) {
    console.error("DELETE RESTAURANT ORDER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
export { router };