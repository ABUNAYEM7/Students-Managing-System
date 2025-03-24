const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.VITE_USER}:${process.env.VITE_PASS}.ppsob.mongodb.net/?appName=Cluster404`;

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

    const usersCollection = client.db("academi_core").collection("users");
    const courseCollection = client.db("academi_core").collection("courses");

    // save new user data in db
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // save new courses data in db
    app.post("/add-courses", async (req, res) => {
      const course = req.body;
      const result = await courseCollection.insertOne(course);
      res.send(result);
    });

    // update specific course
    app.patch("/update-course/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const data = req.body;
      const updatedCourse = {
        $set: {
          course: data.course,
          name: data.name,
          credit: data.credit,
          description: data.description,
          date: data.date,
        },
      };
      const result = await courseCollection.updateOne(filter, updatedCourse);
      res.send(result);
    });

    // update user role
    app.patch("/update/user-role/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const { role } = req.body;
      const updatedRole = {
        $set: {
          role: role,
        },
      };
      const result = await usersCollection.updateOne(filter, updatedRole);
      res.send(result);
    });

    // update user information
    app.patch('/update/user-info/:email',async(req,res)=>{
      const email = req.params.email;
      const filter = {email}
      const data = req.body;
      const updatedInfo = {
        $set:{... data}
      }
      const result = await usersCollection.updateOne(filter,updatedInfo)
      res.send(result)
    })

    // delete-course
    app.delete("/delete-course/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await courseCollection.deleteOne(filter);
      res.send(result);
    });

    // delete-user
    app.delete("/delete-user/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(filter);
      res.send(result);
    });

    // get user state
    app.get('/user-state',async(req,res)=>{
      const totalUser = await usersCollection.estimatedDocumentCount({})
      const totalStudents = await usersCollection.countDocuments({role : 'student'})
      const totalFaculty = await usersCollection.countDocuments({role : 'faculty'})
      const totalAdmin= await usersCollection.countDocuments({role : 'admin'})
      res.send({
        totalUser,totalStudents,totalFaculty,totalAdmin
      })
    })

    // GET USER ROLE BY USER EMAIL
    app.get("/user-role/:email", async (req, res) => {
      const email = req.params.email;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      const filter = { email };
      const result = await usersCollection.findOne(filter);
      res.send(result);
    });

    // get-courses from db
    app.get("/all-courses", async (req, res) => {
      const result = await courseCollection.find({}).toArray();
      res.send(result);
    });

    // get specific courses from db
    app.get("/courses/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await courseCollection.findOne(filter);
      res.send(result);
    });

    // get all users from db
    app.get("/all-users", async (req, res) => {
      const userRole = req.query.role;
      const filter = userRole ? {role : userRole} : {}
      const result = await usersCollection.find(filter).toArray();
      res.send(result);
    });

    

    await client.db("admin").command({ ping: 1 });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Students Management");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
