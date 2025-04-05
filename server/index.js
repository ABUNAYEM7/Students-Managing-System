const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const multer = require("multer");

// middleware
app.use(express.json());
app.use(cors());
app.use("/files", express.static("files"));

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
    const facultiesCollection = client
      .db("academi_core")
      .collection("faculties");
    const courseCollection = client.db("academi_core").collection("courses");
    const materialsCollection = client
      .db("academi_core")
      .collection("materials");
    const assignmentsCollection = client
      .db("academi_core")
      .collection("assignments");

    const subAssignmentsCollection = client
      .db("academi_core")
      .collection("subAssignment");

    const attendanceCollection = client
      .db("academi_core")
      .collection("attendance");

    const leavesCollection = client.db("academi_core").collection("leaves");

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

    // save new faculty
    app.post("/add-faculty", async (req, res) => {
      const info = req.body;
      const result = await facultiesCollection.insertOne(info);
      res.send(result);
    });

    // save leave application
    app.post("/leave-application", async (req, res) => {
      const application = req.body;
      const result = await leavesCollection.insertOne(application);
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

    // POST: Mark attendance
    app.post("/mark-attendance", async (req, res) => {
      const { courseId, date, students, takenBy } = req.body;

      const alreadyTaken = await attendanceCollection.findOne({
        courseId,
        date,
      });
      if (alreadyTaken) {
        return res
          .status(409)
          .send({ message: "Attendance already taken for this date." });
      }

      const result = await attendanceCollection.insertOne({
        courseId,
        date,
        students,
        takenBy,
        createdAt: new Date().toISOString(),
      });

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
    app.patch("/update/user-info/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email };
      const data = req.body;
      const updatedInfo = {
        $set: { ...data },
      };
      const result = await usersCollection.updateOne(filter, updatedInfo);
      res.send(result);
    });

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

    // delete-material
    app.delete("/delete-material/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await materialsCollection.deleteOne(filter);
      res.send(result);
    });

    // delete-assignment
    app.delete("/delete-assignment/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await assignmentsCollection.deleteOne(filter);
      res.send(result);
    });

    // get user state
    app.get("/user-state", async (req, res) => {
      const totalUser = await usersCollection.estimatedDocumentCount({});
      const totalStudents = await usersCollection.countDocuments({
        role: "student",
      });
      const totalFaculty = await usersCollection.countDocuments({
        role: "faculty",
      });
      const totalAdmin = await usersCollection.countDocuments({
        role: "admin",
      });
      res.send({
        totalUser,
        totalStudents,
        totalFaculty,
        totalAdmin,
      });
    });

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

    // get-faculties
    app.get("/all-faculties", async (req, res) => {
      const result = await facultiesCollection.find({}).toArray();
      const totalStaff = await facultiesCollection.estimatedDocumentCount();
      res.send({ result, totalStaff });
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
      const filter = userRole ? { role: userRole } : {};
      const result = await usersCollection.find(filter).toArray();
      res.send(result);
    });

    // get all materials
    app.get("/materials/:email", async (req, res) => {
      const { email } = req.params;
      const filter = { email };
      const result = await materialsCollection.find(filter).toArray();
      res.send(result);
    });

    // get all assignment
    app.get("/assignments/:email", async (req, res) => {
      const { email } = req.params;
      const filter = { email };
      const result = await assignmentsCollection.find(filter).toArray();
      res.send(result);
    });

    app.get("/students-assignment/:email", async (req, res) => {
      const { email } = req.params;

      const assignments = await assignmentsCollection
        .aggregate([
          {
            $lookup: {
              from: "subAssignment",
              let: { assignmentId: { $toString: "$_id" } },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$assignmentId", "$$assignmentId"] },
                        { $eq: ["$email", email] },
                      ],
                    },
                  },
                },
                {
                  $project: {
                    _id: 0,
                    submitted: { $literal: true },
                    path: 1,
                  },
                },
              ],
              as: "submission",
            },
          },
          {
            $unwind: {
              path: "$submission",
              preserveNullAndEmptyArrays: true,
            },
          },
        ])
        .toArray();

      res.send(assignments);
    });

    // get specific materials
    app.get("/material/:id", async (req, res) => {
      const { id } = req.params;
      const filter = { _id: new ObjectId(id) };
      const result = await materialsCollection.findOne(filter);
      res.send(result);
    });

    // get specific assignment
    app.get("/assignment/:id", async (req, res) => {
      const { id } = req.params;
      const filter = { _id: new ObjectId(id) };
      const result = await assignmentsCollection.findOne(filter);
      res.send(result);
    });

    // Get all student submissions for a specific assignment
    app.get("/assignment-submissions/:assignmentId", async (req, res) => {
      const { assignmentId } = req.params;

      const submissions = await subAssignmentsCollection
        .find({ assignmentId })
        .project({ _id: 1, email: 1, comments: 1, path: 1, uploadedAt: 1 })
        .toArray();

      res.send(submissions);
    });

    // GET: Fetch submitted attendance data for a specific course and date
    app.get("/submitted-attendance", async (req, res) => {
      const { courseId, date } = req.query;
      try {
        const record = await attendanceCollection.findOne({ courseId, date });
        if (!record) {
          return res.status(404).send({ message: "Attendance not found" });
        }
        res.send({ students: record.students });
      } catch (error) {
        console.error("Error fetching submitted attendance:", error);
        res
          .status(500)
          .send({ message: "Server error while fetching attendance" });
      }
    });

    // GET: Get attendance report by course
    app.get("/attendance-report/:courseId", async (req, res) => {
      const { courseId } = req.params;
      const records = await attendanceCollection.find({ courseId }).toArray();
      res.send(records);
    });

    // get attendance status
    app.get("/attendance-status", async (req, res) => {
      const { courseId, date } = req.query;
      const existing = await attendanceCollection.findOne({ courseId, date });
      res.send({ submitted: !!existing });
    });

    // upload pdf procedures
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, "./files");
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now();
        cb(null, uniqueSuffix + file.originalname);
      },
    });

    const upload = multer({ storage: storage });

    // save the file to db
    app.post("/upload-file", upload.single("file"), async (req, res) => {
      try {
        const { courseId, title, email } = req.body;
        const fileInfo = req.file;
        const material = {
          courseId,
          title,
          email,
          filename: fileInfo.filename,
          originalname: fileInfo.originalname,
          path: fileInfo.path,
          size: fileInfo.size,
          mimetype: fileInfo.mimetype,
          uploadedAt: new Date().toISOString(),
        };
        const result = await materialsCollection.insertOne(material);
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: "Upload failed" });
      }
    });

    // save-assignment to db
    app.post("/upload-assignment", upload.single("file"), async (req, res) => {
      try {
        const { courseId, title, instructions, email, deadline } = req.body;
        const fileInfo = req.file;
        const assignment = {
          courseId,
          title,
          instructions,
          email,
          deadline,
          filename: fileInfo.filename,
          originalname: fileInfo.originalname,
          path: fileInfo.path,
          size: fileInfo.size,
          mimetype: fileInfo.mimetype,
          uploadedAt: new Date().toISOString(),
        };
        const result = await assignmentsCollection.insertOne(assignment);
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: "Upload failed" });
      }
    });

    // assignment-submission
    app.post(
      "/assignment-submission",
      upload.single("file"),
      async (req, res) => {
        const { assignmentId, email, comments } = req.body;
        const fileInfo = req.file;
        const subAssignment = {
          assignmentId,
          email,
          comments,
          filename: fileInfo.filename,
          originalname: fileInfo.originalname,
          path: fileInfo.path,
          size: fileInfo.size,
          mimetype: fileInfo.mimetype,
          uploadedAt: new Date().toISOString(),
        };
        const result = await subAssignmentsCollection.insertOne(subAssignment);
        res.send(result);
      }
    );

    // update material
    app.patch(
      "/update-material/:id",
      upload.single("file"),
      async (req, res) => {
        try {
          const { id } = req.params;
          if (!ObjectId.isValid(id)) {
            return res.status(400).send({ message: "Invalid ID" });
          }

          const existing = await materialsCollection.findOne({
            _id: new ObjectId(id),
          });
          if (!existing)
            return res.status(404).send({ message: "Material not found" });

          const { title, courseId, email } = req.body;

          const updateFields = {
            title: title || existing.title,
            courseId: courseId || existing.courseId,
            email: email || existing.email,
            updatedAt: new Date().toISOString(),
          };

          if (req.file) {
            updateFields.filename = req.file.filename;
            updateFields.originalname = req.file.originalname;
            updateFields.path = req.file.path;
            updateFields.size = req.file.size;
            updateFields.mimetype = req.file.mimetype;
          } else {
            updateFields.filename = existing.filename;
            updateFields.originalname = existing.originalname;
            updateFields.path = existing.path;
            updateFields.size = existing.size;
            updateFields.mimetype = existing.mimetype;
          }

          const result = await materialsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateFields }
          );

          res.send(result);
        } catch (err) {
          console.error(err);
          res.status(500).send({ message: "Update failed" });
        }
      }
    );
    // update assignment
    app.patch(
      "/update-assignment/:id",
      upload.single("file"),
      async (req, res) => {
        try {
          const { id } = req.params;
          if (!ObjectId.isValid(id)) {
            return res.status(400).send({ message: "Invalid ID" });
          }

          const existing = await assignmentsCollection.findOne({
            _id: new ObjectId(id),
          });
          if (!existing)
            return res.status(404).send({ message: "Material not found" });

          const { title, courseId, instructions, email } = req.body;

          const updateFields = {
            title: title || existing.title,
            courseId: courseId || existing.courseId,
            instructions: instructions || existing.instructions,
            email: email || existing.email,
            updatedAt: new Date().toISOString(),
          };

          if (req.file) {
            updateFields.filename = req.file.filename;
            updateFields.originalname = req.file.originalname;
            updateFields.path = req.file.path;
            updateFields.size = req.file.size;
            updateFields.mimetype = req.file.mimetype;
          } else {
            updateFields.filename = existing.filename;
            updateFields.originalname = existing.originalname;
            updateFields.path = existing.path;
            updateFields.size = existing.size;
            updateFields.mimetype = existing.mimetype;
          }

          const result = await assignmentsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateFields }
          );

          res.send(result);
        } catch (err) {
          console.error(err);
          res.status(500).send({ message: "Update failed" });
        }
      }
    );

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
  console.log("server running on");
});
