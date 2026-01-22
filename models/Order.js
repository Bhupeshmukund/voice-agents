import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    order_items: {
      type: Array,
      required: true,
      default: [],
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    phone_no: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    collectionMethod: {
      type: String,
      required: true,
      enum: ["delivery", "pickup"],
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "processing", "ready", "completed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true, // This automatically adds createdAt and updatedAt fields
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
