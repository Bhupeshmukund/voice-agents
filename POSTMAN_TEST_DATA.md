# Postman Test Data for Restaurant Orders API

## Base URL
```
http://localhost:3000/api
```

---

## 1. Create Order (POST)

**Endpoint:** `POST http://localhost:3000/api/restaurant-orders`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "John Doe",
  "order_items": [
    {
      "item": "Margherita Pizza",
      "quantity": 2,
      "price": 12.99,
      "notes": "Extra cheese"
    },
    {
      "item": "Caesar Salad",
      "quantity": 1,
      "price": 8.99
    },
    {
      "item": "Coca Cola",
      "quantity": 2,
      "price": 2.50
    }
  ],
  "address": "123 Main Street, New York, NY 10001",
  "phone_no": "+1-555-123-4567",
  "amount": 39.97,
  "collection": "delivery",
  "status": "pending"
}
```

**Alternative Example (Pickup):**
```json
{
  "name": "Jane Smith",
  "order_items": [
    {
      "item": "Chicken Burger",
      "quantity": 1,
      "price": 9.99
    },
    {
      "item": "French Fries",
      "quantity": 1,
      "price": 4.99
    }
  ],
  "address": "456 Oak Avenue, Los Angeles, CA 90001",
  "phone_no": "+1-555-987-6543",
  "amount": 14.98,
  "collection": "pickup",
  "status": "pending"
}
```

**Minimal Example:**
```json
{
  "name": "Bob Johnson",
  "order_items": [
    {
      "item": "Pasta Carbonara",
      "quantity": 1,
      "price": 15.99
    }
  ],
  "address": "789 Pine Road, Chicago, IL 60601",
  "phone_no": "555-456-7890",
  "amount": 15.99,
  "collection": "delivery"
}
```

---

## 2. Get All Orders (GET)

**Endpoint:** `GET http://localhost:3000/api/restaurant-orders`

**No body required**

---

## 3. Get Single Order (GET)

**Endpoint:** `GET http://localhost:3000/api/restaurant-orders/{orderId}`

**Example:**
```
GET http://localhost:3000/api/restaurant-orders/65a1b2c3d4e5f6a7b8c9d0e1
```

**Note:** Replace `{orderId}` with the actual MongoDB ObjectId from a created order.

---

## 4. Update Order Status (PATCH)

**Endpoint:** `PATCH http://localhost:3000/api/restaurant-orders/{orderId}/status`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "status": "processing"
}
```

**Valid status values:**
- `pending`
- `processing`
- `ready`
- `completed`
- `cancelled`

**Example:**
```
PATCH http://localhost:3000/api/restaurant-orders/65a1b2c3d4e5f6a7b8c9d0e1/status
```

---

## 5. Update Order (PATCH)

**Endpoint:** `PATCH http://localhost:3000/api/restaurant-orders/{orderId}`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON) - You can update any combination of fields:**
```json
{
  "name": "John Doe Updated",
  "amount": 45.00,
  "status": "ready"
}
```

**Example with all fields:**
```json
{
  "name": "Jane Smith",
  "order_items": [
    {
      "item": "Updated Item",
      "quantity": 3,
      "price": 10.99
    }
  ],
  "address": "New Address 123",
  "phone_no": "+1-555-999-8888",
  "amount": 32.97,
  "collection": "pickup",
  "status": "processing"
}
```

---

## 6. Delete Order (DELETE)

**Endpoint:** `DELETE http://localhost:3000/api/restaurant-orders/{orderId}`

**No body required**

**Example:**
```
DELETE http://localhost:3000/api/restaurant-orders/65a1b2c3d4e5f6a7b8c9d0e1
```

---

## Testing Workflow

1. **Create an order** using POST endpoint
2. **Copy the `orderId`** from the response
3. **Get all orders** to see your created order
4. **Get single order** using the copied orderId
5. **Update order status** to "processing" or "ready"
6. **Update order** with new information
7. **Delete order** when done testing

---

## Expected Response Examples

### Successful Create Order Response:
```json
{
  "success": true,
  "orderId": "65a1b2c3d4e5f6a7b8c9d0e1",
  "message": "Restaurant order created successfully"
}
```

### Get All Orders Response:
```json
{
  "success": true,
  "orders": [
    {
      "_id": "65a1b2c3d4e5f6a7b8c9d0e1",
      "name": "John Doe",
      "order_items": [...],
      "address": "123 Main Street",
      "phone_no": "+1-555-123-4567",
      "amount": 39.97,
      "collectionMethod": "delivery",
      "status": "pending",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

## Notes

- The `collection` field in requests maps to `collectionMethod` in the database
- All timestamps are automatically managed by MongoDB
- Order IDs are MongoDB ObjectIds (24 character hex strings)
- The `status` field defaults to "pending" if not provided
- Collection method must be either "delivery" or "pickup"
