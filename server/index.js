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

    const studentsCollection = client.db("academi_core").collection("students");

    const gradesCollection = client.db("academi_core").collection("grades");

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

    // create new students from user
    app.post("/create-student", async (req, res) => {
      const studentInfo = req.body;
      const result = await studentsCollection.insertOne(studentInfo);
      res.send(result);
    });

    // POST: Upsert grades by semester
    app.post("/student-grades/upsert", async (req, res) => {
      try {
        const { studentGrades, semester } = req.body;

        for (const record of studentGrades) {
          const filter = {
            studentEmail: record.studentEmail,
            semester,
          };

          const update = {
            $setOnInsert: {
              studentEmail: record.studentEmail,
              studentName: record.studentName,
              semester,
              createdAt: new Date(),
            },
            $set: {
              updatedAt: new Date(),
            },
            $addToSet: {
              grades: {
                courseId: record.courseId,
                facultyEmail: record.facultyEmail,
                point: parseFloat(record.point), // ✅ FIXED: correctly access "point"
                outOf: record.outOf || 5.0,
                submittedAt: new Date(record.submittedAt),
              },
            },
          };

          await gradesCollection.updateOne(filter, update, { upsert: true });
        }

        res.send({ success: true });
      } catch (err) {
        console.error("Grade upsert error:", err);
        res.status(500).send({ success: false, message: "Server error." });
      }
    });

    // POST: Enroll a student into a course
    app.post("/enroll-course", async (req, res) => {
      try {
        const { email, course } = req.body;

        if (!email || !course?.courseId || !course?.courseName) {
          return res
            .status(400)
            .send({ success: false, message: "Missing required fields." });
        }

        // Optionally: fetch student info from users collection if needed
        const user = await usersCollection.findOne({ email });

        const studentName = user?.name || course.studentName || "Unknown";
        const studentPhoto =
          user?.photo ||
          course.photo ||
          "https://i.ibb.co/2K2tkj1/default-avatar.png";

        const filter = { email };

        const update = {
          $setOnInsert: {
            email,
            name: studentName,
            photo: studentPhoto,
            createdAt: new Date(),
          },
          $addToSet: {
            courses: {
              courseId: course.courseId,
              courseName: course.courseName,
              credit: course.credit,
              semester: course.semester,
              enrolledAt: new Date(course.enrolledAt || Date.now()),
            },
          },
          $set: {
            updatedAt: new Date(),
          },
        };

        const result = await studentsCollection.updateOne(filter, update, {
          upsert: true,
        });

        res.send({ success: true, result });
      } catch (error) {
        console.error("Enroll Error:", error);
        res.status(500).send({ success: false, message: "Server error" });
      }
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

    // delete-student
    app.delete("/delete-student/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await studentsCollection.deleteOne(filter);
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

    // get specific user
    app.get("/specific-user/:id", async (req, res) => {
      const { id } = req.params;
      const filter = { _id: new ObjectId(id) };
      const result = await usersCollection.findOne(filter);
      res.send(result);
    });

    // get-courses from db
    app.get("/all-courses-by-department", async (req, res) => {
      const department = req.query.department;
      const filter = department ? { department } : {};
      const result = await courseCollection.find(filter).toArray();
      res.send(result);
    });

    // get-faculties
    app.get("/all-faculties", async (req, res) => {
      const filter = { role: "Faculty" };
      const result = await facultiesCollection.find(filter).toArray();
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

    // get faculty assign courses
    app.get("/faculty-assign/courses/:email", async (req, res) => {
      const { email } = req.params;
      const filter = { facultyEmail: email };
      const result = await courseCollection.find(filter).toArray();
      res.send(result);
    });

    // get faculties dashboard state
    app.get("/faculty-dashboard/state/:email", async (req, res) => {
      try {
        const { email } = req.params;

        const totalCourses = await courseCollection.countDocuments({
          facultyEmail: email,
        });
        const totalAssignments = await assignmentsCollection.countDocuments({
          email: email,
        });
        const totalStudents = await usersCollection.countDocuments({
          role: "student",
        });

        res.send({ totalCourses, totalAssignments, totalStudents });
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Failed to fetch dashboard data" });
      }
    });

    // get all users from db
    app.get("/all-users", async (req, res) => {
      const userRole = req.query.role;
      const filter = userRole ? { role: userRole } : {};
      const result = await usersCollection.find(filter).toArray();
      res.send(result);
    });

    // get all students and for courses based student for attendance
    app.get("/all-students", async (req, res) => {
      const courseIds = req.query.courseId;
      let query = {};

      if (courseIds) {
        const idsArray = Array.isArray(courseIds) ? courseIds : [courseIds];
        query = {
          courses: {
            $elemMatch: {
              courseId: { $in: idsArray },
            },
          },
        };
      }

      try {
        const result = await studentsCollection
          .find(query)
          .project({ name: 1, email: 1, photo: 1, courses: 1 })
          .toArray();
          console.log(result)
        res.send(result);
      } catch (err) {
        console.error("Error fetching students by course enrollment", err);
        res.status(500).send({ error: "Failed to fetch students" });
      }
    });

    // get specific students
    app.get("/student/:email", async (req, res) => {
      const { email } = req.params;
      const filter = { email };
      const result = await studentsCollection.findOne(filter);
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

    // get all assignment with the status
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

    // get specific student grade
    app.get("/student-result/:email", async (req, res) => {
      const { email } = req.params;
      const filter = { studentEmail: email };
      const result = await gradesCollection.findOne(filter);
      res.send(result);
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
        const { courseId, title, instructions, email, deadline, semester } =
          req.body;
        const fileInfo = req.file;
        const assignment = {
          courseId,
          semester,
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
