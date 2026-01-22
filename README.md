# Restaurant Orders API

A Node.js REST API for managing restaurant orders using MongoDB.

## Features

- Create, read, update, and delete restaurant orders
- Update order status
- MongoDB database integration
- Express.js RESTful API

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB instance)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

3. Update the `.env` file with your MongoDB connection string:
```
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/restaurant-orders?retryWrites=true&w=majority
```

## Running the Application

Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### Get All Orders
- **GET** `/api/restaurant-orders`
- Returns all restaurant orders sorted by creation date (newest first)

### Get Single Order
- **GET** `/api/restaurant-orders/:id`
- Returns a single order by ID

### Create Order
- **POST** `/api/restaurant-orders`
- Body:
```json
{
  "name": "John Doe",
  "order_items": [
    {
      "item": "Pizza",
      "quantity": 2,
      "price": 25.99
    }
  ],
  "address": "123 Main St",
  "phone_no": "123-456-7890",
  "amount": 51.98,
  "collection": "delivery",
  "status": "pending"
}
```

### Update Order Status
- **PATCH** `/api/restaurant-orders/:id/status`
- Body:
```json
{
  "status": "processing"
}
```
- Valid statuses: `pending`, `processing`, `ready`, `completed`, `cancelled`

### Update Order
- **PATCH** `/api/restaurant-orders/:id`
- Body: (any combination of fields)
```json
{
  "name": "Jane Doe",
  "amount": 60.00
}
```

### Delete Order
- **DELETE** `/api/restaurant-orders/:id`

## Project Structure

```
.
├── config/
│   └── db.js          # MongoDB connection configuration
├── models/
│   └── Order.js       # Order Mongoose schema
├── routes/
│   └── resturantorders.js  # Order routes
├── server.js          # Main server file
├── package.json       # Dependencies and scripts
└── .env              # Environment variables (create this)
```

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- dotenv
