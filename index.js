const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const cors = require("cors");
const { ObjectId } = require("mongodb");

require("dotenv").config();

const { MongoClient, ServerApiVersion } = require("mongodb");

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@homenest.fi0piji.mongodb.net/?appName=HomeNest`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const db = client.db("HomeNest");
    const propertyCollection = db.collection("properties");
    const reviewCollection = db.collection("reviews");

    await client.db("admin").command({ ping: 1 });
    console.log("Successfully connected to MongoDB!");
  } finally {
    // leave client open for server
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello HomeNest!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
