import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { v4 as uuid } from "uuid";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand
} from "@aws-sdk/lib-dynamodb";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ===========================================
// DynamoDB Configuration
// ===========================================

const client = new DynamoDBClient({
  region: process.env.AWS_REGION
});

const dynamoDB = DynamoDBDocumentClient.from(client);

const FOOD_TABLE = process.env.FOOD_TABLE;
const ORDER_TABLE = process.env.ORDER_TABLE;
const ORDER_ITEM_TABLE = process.env.ORDER_ITEM_TABLE;

// ===========================================
// Home
// ===========================================

app.get("/", (req, res) => {

  res.json({
    application: "Food Ordering API",
    status: "Running"
  });

});

// ===========================================
// Health Check
// ===========================================

app.get("/health", (req, res) => {

  res.json({
    status: "OK",
    message: "Backend is running successfully"
  });

});

// ===========================================
// GET FOOD MENU
// ===========================================

app.get("/api/foods", async (req, res) => {

  try {

    const command = new ScanCommand({
      TableName: FOOD_TABLE
    });

    const result = await dynamoDB.send(command);

    res.status(200).json(result.Items || []);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Unable to fetch food items",
      error: error.message
    });

  }

});

// ===========================================
// PLACE ORDER
// ===========================================

app.post("/api/orders", async (req, res) => {

  try {

    const {

      customer_name,

      customer_email,

      items

    } = req.body;

    if (
      !customer_name ||
      !customer_email ||
      !items ||
      items.length === 0
    ) {

      return res.status(400).json({

        message: "Invalid order data"

      });

    }

    // Get food menu

    const menu = await dynamoDB.send(

      new ScanCommand({

        TableName: FOOD_TABLE

      })

    );

    const foods = menu.Items || [];

    const priceMap = {};

    foods.forEach(food => {

      priceMap[food.id] = Number(food.price);

    });

    let totalAmount = 0;

    for (const item of items) {

      if (!priceMap[item.food_id]) {

        return res.status(400).json({

          message: `Food ID ${item.food_id} not found`

        });

      }

      totalAmount +=

        priceMap[item.food_id] *

        Number(item.quantity);

    }

    const orderId = uuid();

    // Save Order

    await dynamoDB.send(

      new PutCommand({

        TableName: ORDER_TABLE,

        Item: {

          orderId,

          customer_name,

          customer_email,

          total_amount: totalAmount,

          created_at: new Date().toISOString()

        }

      })

    );

    // Save Order Items

    for (const item of items) {

      await dynamoDB.send(

        new PutCommand({

          TableName: ORDER_ITEM_TABLE,

          Item: {

            itemId: uuid(),

            orderId,

            foodId: item.food_id,

            quantity: Number(item.quantity),

            price: priceMap[item.food_id]

          }

        })

      );

    }

    res.status(201).json({

      message: "Order placed successfully",

      order_id: orderId,

      total_amount: totalAmount

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      message: "Failed to place order",

      error: error.message

    });

  }

});

// ===========================================
// GET ORDERS
// ===========================================

app.get("/api/orders", async (req, res) => {

  try {

    const command = new ScanCommand({

      TableName: ORDER_TABLE

    });

    const result = await dynamoDB.send(command);

    res.status(200).json(result.Items || []);

  } catch (error) {

    console.error(error);

    res.status(500).json({

      message: "Unable to fetch orders",

      error: error.message

    });

  }

});

// ===========================================
// Start Server
// ===========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {

  console.log("===================================");

  console.log(" Food Ordering Backend Started");

  console.log(` Server Running : ${PORT}`);

  console.log(` Health Check : http://localhost:${PORT}/health`);

  console.log("===================================");

});
