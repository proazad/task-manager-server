const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
app.use(
    cors({
        origin: ["http://localhost:5173"],
        // origin: ["https://taskman.surge.sh/"],
        credentials: true,
    })
);
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.h7gpv70.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection

        const userCollection = client.db("task-manager").collection("user");
        const taskCollection = client.db("task-manager").collection("task");
        // Create User API 
        app.post("/users", async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result);
        });

        // Get All User 
        app.get("/users", async (req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result);
        });

        //Get Single User 
        app.get("/users/:email", async (req, res) => {
            const email = req.params.email;
            const filter = { email: email }
            const result = await userCollection.findOne(filter);
            res.send(result);
        });

        // Create New Task API 
        app.post("/task", async (req, res) => {
            const task = req.body;
            const result = await taskCollection.insertOne(task);
            res.send(result);
        });

        // Get All Task 
        app.get("/tasks", async (req, res) => {
            const result = await taskCollection.find().toArray();
            res.send(result);
        });

        // Get All Task By  User ID
        app.get("/tasks/:userid", async (req, res) => {
            const uid = req.params.userid;
            const filter = { user: uid }
            const result = await taskCollection.find(filter).toArray();
            res.send(result);
        });

        //Get Single Task by Task ID 
        app.get("/task/:id", async (req, res) => {
            const taskid = req.params.id;
            const query = { _id: new ObjectId(taskid) }
            const result = await taskCollection.findOne(query);
            res.send(result);
        });

        //Update Single Task 
        app.patch("/task/:id", async (req, res) => {
            const id = req.params.id;
            const updateTask = req.body;
            const filter = { _id: new ObjectId(id) }
            const UpdateDoc = {
                $set: {
                    title: updateTask.title,
                    deadline: updateTask.deadline,
                    priority: updateTask.priority,
                    description: updateTask.description,
                }
            }
            const result = await taskCollection.updateOne(filter, UpdateDoc);
            res.send(result)
        });


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get("/", (req, res) => {
    res.send("Task Manager Server is Running");
});

app.listen(port, () => {
    console.log(`Task Manager Server is Running on Port: ${port}`);
});
