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

    // Protected middleware simulation
    function verifyUser(req, res, next) {
      if (!req.headers["user-email"]) {
        return res.status(401).send({ message: "Unauthorized" });
      }
      next();
    }

    /*** PROPERTIES ROUTES ***/
    app.post("/properties", verifyUser, async (req, res) => {
      try {
        const propertyData = req.body;
        propertyData.createdAt = new Date();

        const result = await propertyCollection.insertOne(propertyData);
        res
          .status(201)
          .send({ success: true, message: "Property added", data: result });
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .send({ success: false, message: "Failed to add property" });
      }
    });

    app.get("/properties", async (req, res) => {
      try {
        const query = req.query.userEmail
          ? { userEmail: req.query.userEmail }
          : {};
        const properties = await propertyCollection.find(query).toArray();
        res.status(200).send(properties);
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .send({ success: false, message: "Failed to fetch properties" });
      }
    });

    app.get("/properties/:id", async (req, res) => {
      const { id } = req.params;
      try {
        const property = await propertyCollection.findOne({
          _id: new ObjectId(id),
        });
        if (property) {
          res.status(200).json(property);
        } else {
          res.status(404).json({ message: "Property not found" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch property" });
      }
    });

    app.put("/properties/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedData = req.body;

        if (
          !updatedData.name ||
          !updatedData.description ||
          !updatedData.category ||
          !updatedData.price ||
          !updatedData.location ||
          !updatedData.imageURL
        ) {
          return res.status(400).json({ message: "All fields are required!" });
        }

        const result = await propertyCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData }
        );

        if (result.modifiedCount > 0) {
          res.status(200).json({ message: "Property updated successfully!" });
        } else {
          res
            .status(404)
            .json({ message: "Property not found or no changes made." });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.delete("/properties/:id", async (req, res) => {
      const { id } = req.params;
      try {
        const result = await propertyCollection.deleteOne({
          _id: new ObjectId(id),
        });
        if (result.deletedCount > 0) {
          res.status(200).send({ success: true, message: "Property deleted" });
        } else {
          res
            .status(404)
            .send({ success: false, message: "Property not found" });
        }
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .send({ success: false, message: "Failed to delete property" });
      }
    });

    /*** REVIEWS ROUTES ***/
    // Add review
    app.post("/reviews", async (req, res) => {
      try {
        const reviewData = req.body;
        reviewData.createdAt = new Date();

        const result = await reviewCollection.insertOne(reviewData);
        res
          .status(201)
          .send({ success: true, message: "Review added", data: reviewData });
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .send({ success: false, message: "Failed to add review" });
      }
    });

    // Get reviews for a property
    app.get("/reviews", async (req, res) => {
      try {
        const query = req.query.propertyId
          ? { propertyId: req.query.propertyId }
          : {};
        const reviews = await reviewCollection.find(query).toArray();
        res.status(200).send(reviews);
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .send({ success: false, message: "Failed to fetch reviews" });
      }
    });
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
