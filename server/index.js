const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const multer = require("multer");
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const dayjs = require("dayjs");

// middleware
app.use(express.json());
app.use(cors());
app.use("/files", express.static("files"));

// mongodb url
const uri = `mongodb+srv://${process.env.VITE_USER}:${process.env.VITE_PASS}@cluster404.ppsob.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// socket io server
const io = new Server(server, {
  cors: {
    origin: "*", // allow frontend origin here for safety in production
    methods: ["GET", "POST"],
  },
});

// Socket.IO event listeners
io.on("connection", (socket) => {
  console.log("✅ A user connected:", socket.id);

  // Join role-based room (emitted from frontend)
  socket.on("join-role", (role, email) => {
    const room = `${role}-room`;

    socket.join(room);
    console.log(`🔐 Socket ${socket.id} joined room: ${room}`);

    // Optionally, join email-based private room (for direct notifications)
    if (email) {
      socket.join(email);
      console.log(`📩 Socket ${socket.id} also joined personal room: ${email}`);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });

  // Example chat event still optional
  socket.on("chat-message", (msg) => {
    console.log("💬 Message received:", msg);
    io.emit("chat-message", msg); // Broadcast to all
  });
});

// mongodb function
async function run() {
  try {
    await client.connect();

    // collections
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

    const routinesCollection = client.db("academi_core").collection("routine");
    const messageCollection = client.db("academi_core").collection("message");
    const notificationCollection = client
      .db("academi_core")
      .collection("notification");

    // save new user data in db
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // save new faculty
    app.post("/add-faculty", async (req, res) => {
      const info = req.body;

      try {
        const user = await usersCollection.findOne({ email: info.email });

        if (user) {
          // Update role to 'faculty' if user exists
          await usersCollection.updateOne(
            { email: info.email },
            { $set: { role: "faculty" } }
          );
        } else {
          // Create new user with role 'faculty' if user doesn't exist
          await usersCollection.insertOne({
            name: `${info.firstName} ${info.lastName}`,
            photo: info.staffPhoto,
            email: info.email,
            role: "faculty",
          });
        }

        // Create faculty in the facultiesCollection regardless
        const result = await facultiesCollection.insertOne(info);

        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Failed to add faculty" });
      }
    });

    // save leave application
    // app.post("/leave-application", async (req, res) => {
    //   const application = req.body;
    //   const result = await leavesCollection.insertOne(application);
    //   res.send(result);
    // });

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

        if (!Array.isArray(studentGrades) || !semester) {
          return res
            .status(400)
            .send({ success: false, message: "Invalid data" });
        }

        let upsertCount = 0;
        const alreadyGraded = [];

        for (const record of studentGrades) {
          const { studentEmail, courseId, studentName } = record;

          // Check for existing grade for this course and semester
          const exists = await gradesCollection.findOne({
            studentEmail,
            "grades.courseId": courseId,
            "grades.semester": semester,
          });

          if (exists) {
            alreadyGraded.push({
              studentEmail,
              studentName,
              courseId,
            });
            continue;
          }

          // Insert the new grade
          const filter = { studentEmail, semester };

          const update = {
            $setOnInsert: {
              studentEmail,
              studentName,
              semester,
              createdAt: new Date(),
            },
            $set: {
              updatedAt: new Date(),
            },
            $push: {
              grades: {
                courseId,
                facultyEmail: record.facultyEmail,
                point: parseFloat(record.point),
                outOf: record.outOf || 5.0,
                semester,
                submittedAt: new Date(record.submittedAt),
              },
            },
          };

          await gradesCollection.updateOne(filter, update, { upsert: true });
          upsertCount++;
        }

        // Return result
        if (alreadyGraded.length > 0) {
          return res.send({
            success: false,
            message: `${alreadyGraded.length} grade(s) were already submitted.`,
            alreadyGraded, // Send list of blocked ones
            upsertCount,
          });
        }

        res.send({
          success: true,
          message: `${upsertCount} grade(s) submitted successfully.`,
        });
      } catch (err) {
        console.error("❌ Grade upsert error:", err);
        res.status(500).send({ success: false, message: "Server error." });
      }
    });

    // post weekly routine
    app.post("/add/weekly-routine", async (req, res) => {
      try {
        const data = req.body;

        // Validate required fields
        if (
          !data.semester ||
          !data.department ||
          !Array.isArray(data.routines)
        ) {
          return res.status(400).send({ message: "Missing required fields." });
        }

        const result = await routinesCollection.insertOne({
          semester: data.semester,
          department: data.department,
          weekStartDate: data.weekStartDate,
          routines: data.routines,
          createdBy: data.createdBy,
          createdAt: new Date(),
        });

        res.send({ success: true, insertedId: result.insertedId });
      } catch (err) {
        console.error("❌ Error storing weekly routine:", err);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    // ✅ POST: Send & store message
    app.post("/send-message", async (req, res) => {
      const {
        name,
        email,
        subject,
        description,
        recipients,
        recipientRole,
        replyTo, // ✅ capture replyTo from frontend
      } = req.body;

      if (
        !name ||
        !email ||
        !subject ||
        !description ||
        !recipients?.length ||
        !recipientRole
      ) {
        return res.status(400).send({ message: "Missing required fields" });
      }

      try {
        const message = {
          name,
          email, // sender email
          subject,
          description,
          recipients,
          recipientRole,
          sender: email,
          replyTo: replyTo || null, // ✅ include replyTo if present
          createdAt: new Date().toISOString(),
        };

        const result = await messageCollection.insertOne(message);
        res.send({ success: true, insertedId: result.insertedId });
      } catch (err) {
        console.error("❌ Failed to send message:", err);
        res.status(500).send({ message: "Internal server error" });
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

    // ✅ PATCH: Update leave status (approve/decline)
    app.patch("/update-leave-status/:id", async (req, res) => {
      const { id } = req.params;
      const { status } = req.body;

      // Ensure status is either "approved" or "declined"
      if (!["approved", "declined"].includes(status)) {
        return res.status(400).send({ message: "Invalid status value" });
      }

      try {
        const result = await leavesCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              status,
              updatedAt: new Date(),
            },
          }
        );

        if (result.modifiedCount > 0) {
          res.send({ success: true, modifiedCount: result.modifiedCount });
        } else {
          res.status(404).send({
            success: false,
            message: "Leave not found or already updated",
          });
        }
      } catch (err) {
        console.error("Error updating leave status:", err);
        res.status(500).send({ message: "Failed to update leave status" });
      }
    });

    // PATCH: Update a single day in the weekly routine
    app.patch("/update-routine-day/:routineId/:dayIndex", async (req, res) => {
      const { routineId, dayIndex } = req.params;
      const updatedDay = req.body;

      if (!ObjectId.isValid(routineId)) {
        return res.status(400).send({ message: "Invalid routine ID" });
      }

      try {
        const routine = await routinesCollection.findOne({
          _id: new ObjectId(routineId),
        });

        if (!routine) {
          return res.status(404).send({ message: "Routine not found" });
        }

        // Ensure dayIndex is valid
        const index = parseInt(dayIndex, 10);
        if (isNaN(index) || index < 0 || index >= routine.routines.length) {
          return res.status(400).send({ message: "Invalid day index" });
        }

        // Update specific day's routine
        const updateQuery = {
          $set: {
            [`routines.${index}`]: updatedDay,
            updatedAt: new Date(),
          },
        };

        const result = await routinesCollection.updateOne(
          { _id: new ObjectId(routineId) },
          updateQuery
        );

        res.send({ success: true, modifiedCount: result.modifiedCount });
      } catch (error) {
        console.error("Error updating routine day:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    // PATCH: Update routine day status
    app.patch(
      "/update-routine-day-status/:routineId/:dayIndex",
      async (req, res) => {
        const { routineId, dayIndex } = req.params;
        const { status } = req.body;

        if (!["pending", "completed"].includes(status)) {
          return res.status(400).send({ message: "Invalid status" });
        }

        try {
          const index = parseInt(dayIndex);
          const result = await routinesCollection.updateOne(
            { _id: new ObjectId(routineId) },
            {
              $set: {
                [`routines.${index}.status`]: status,
              },
            }
          );

          res.send({ success: true, modifiedCount: result.modifiedCount });
        } catch (error) {
          console.error("Error updating status:", error);
          res.status(500).send({ message: "Failed to update status" });
        }
      }
    );

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

    // delete-faculty
    app.delete("/delete-faculty/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await facultiesCollection.deleteOne(filter);
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

    // delete leave request
    app.delete("/delete-leaveReq/:id", async (req, res) => {
      const { id } = req.params;
      const filter = { _id: new ObjectId(id) };
      const result = await leavesCollection.deleteOne(filter);
      res.send(result);
    });

    // delete weekly  routine
    app.delete("/delete/weekly-routine/:id", async (req, res) => {
      const { id } = req.params;
      const filter = { _id: new ObjectId(id) };
      const result = await routinesCollection.deleteOne(filter);
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

    // get specific user by id
    app.get("/specific-user/:id", async (req, res) => {
      const { id } = req.params;
      const filter = { _id: new ObjectId(id) };
      const result = await usersCollection.findOne(filter);
      res.send(result);
    });

    // get specific user by email
    app.get("/user-details/:email", async (req, res) => {
      const { email } = req.params;
      const filter = { email };
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

    // get-specific-faculty by id
    app.get("/specific-faculty/:id", async (req, res) => {
      const { id } = req.params;
      const filter = { _id: new ObjectId(id) };
      const result = await facultiesCollection.findOne(filter);
      res.send(result);
    });

    // get-specific-faculty by email
    app.get("/faculty-email/:email", async (req, res) => {
      const { email } = req.params;
      const result = await facultiesCollection.findOne({ email });
      if (!result) {
        return res.status(404).send({ error: "Faculty not found" });
      }
      res.send(result);
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

    // GET all faculties by department
    app.get("/faculties-by-department", async (req, res) => {
      const { department } = req.query;
      if (!department)
        return res.status(400).send({ error: "Department is required" });

      const result = await courseCollection.find({ department }).toArray();
      res.send(result);
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
        res.send(result);
      } catch (err) {
        console.error("Error fetching students by course enrollment", err);
        res.status(500).send({ error: "Failed to fetch students" });
      }
    });

    // get course enrolled based student for the grades page
    app.get("/students-by-course", async (req, res) => {
      const courseId = req.query.courseId;
      const semester = req.query.semester;

      if (!courseId || !semester) {
        return res.status(400).send({ error: "Missing courseId or semester" });
      }

      try {
        // Get actual course _id from courseId string
        const course = await courseCollection.findOne({ courseId: courseId });
        if (!course) {
          return res.status(404).send({ error: "Course not found" });
        }

        const courseObjectId = course._id.toString();

        // Fetch students enrolled in that course (_id match)
        const students = await studentsCollection
          .find({
            courses: {
              $elemMatch: {
                courseId: courseObjectId,
              },
            },
          })
          .project({ name: 1, email: 1, photo: 1 })
          .toArray();

        // Fetch grades for those students (by email)
        const studentEmails = students.map((s) => s.email);
        const gradeRecords = await gradesCollection
          .find({ studentEmail: { $in: studentEmails }, semester })
          .toArray();

        const studentMap = students.map((student) => {
          const gradeDoc = gradeRecords.find(
            (g) => g.studentEmail === student.email
          );
          let alreadyGraded = null;

          if (gradeDoc && Array.isArray(gradeDoc.grades)) {
            const foundGrade = gradeDoc.grades.find(
              (g) => g.courseId === courseId && g.semester === semester
            );
            if (foundGrade) {
              alreadyGraded = { point: foundGrade.point };
            }
          }

          return {
            name: student.name,
            email: student.email,
            photo: student.photo,
            alreadyGraded, // Will be null if not graded
          };
        });

        res.send(studentMap);
      } catch (error) {
        console.error("❌ Error fetching students with grade status:", error);
        res.status(500).send({ error: "Internal server error" });
      }
    });

    // get specific students
    app.get("/student/:email", async (req, res) => {
      const { email } = req.params;
      const filter = { email };
      const result = await studentsCollection.findOne(filter);
      res.send(result);
    });

    // get specific student attendance
    app.get("/student-assignment/:email", async (req, res) => {
      const { email } = req.params;

      const cursor = attendanceCollection.find({ "students.email": email });

      const allDocs = await cursor.toArray();

      const studentAttendance = allDocs.map((doc) => {
        const student = doc.students.find((s) => s.email === email);
        return {
          date: doc.date,
          courseId: doc.courseId,
          status: student?.status || "not found",
          takenBy: doc.takenBy,
          createdAt: doc.createdAt,
        };
      });
      res.send({ email, records: studentAttendance });
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

      try {
        // 1. Get student's enrolled courses
        const student = await studentsCollection.findOne({ email });
        if (!student || !student.courses) {
          return res.send([]); // Return empty if no student or not enrolled
        }

        const enrolledCourseIds = student.courses.map((c) => c.courseId);

        // 2. Get assignments for enrolled courses with submission info
        const assignments = await assignmentsCollection
          .aggregate([
            {
              $match: {
                courseId: { $in: enrolledCourseIds },
              },
            },
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
      } catch (err) {
        console.error("Error fetching assignments:", err);
        res.status(500).send({ error: "Internal server error" });
      }
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

    app.get("/student-leave/request/:email", async (req, res) => {
      const { email } = req.params;
      const filter = { email };
      const result = await leavesCollection.find(filter).toArray();
      res.send(result);
    });
    // ✅ Faculty-specific leave requests
    app.get("/faculty-leaves", async (req, res) => {
      const { facultyEmail, courseId } = req.query;
      if (!facultyEmail || !courseId) {
        return res
          .status(400)
          .send({ error: "facultyEmail and courseId are required" });
      }

      try {
        // Step 1: Verify the course belongs to the faculty
        const isAssigned = await courseCollection.findOne({
          _id: new ObjectId(courseId),
          facultyEmail,
        });

        if (!isAssigned) {
          return res
            .status(403)
            .send({ error: "Unauthorized access to course" });
        }

        // Step 2: Get all students enrolled in this course
        const students = await studentsCollection
          .find({
            courses: {
              $elemMatch: { courseId },
            },
          })
          .project({ email: 1 })
          .toArray();

        const studentEmails = students.map((s) => s.email);

        // Step 3: Get today's ISO date string part (YYYY-MM-DD)
        const todayDateStr = new Date().toISOString().split("T")[0];

        // Step 4: Match applicationDate string starting with todayDateStr
        const leaves = await leavesCollection
          .find({
            email: { $in: studentEmails },
            applicationDate: { $regex: `^${todayDateStr}` },
          })
          .sort({ applicationDate: -1 })
          .toArray();
        res.send(leaves);
      } catch (err) {
        console.error("Error fetching course-specific leaves:", err);
        res.status(500).send({ error: "Internal server error" });
      }
    });

    // get specific student grade
    app.get("/student-result/:email", async (req, res) => {
      const { email } = req.params;
      const filter = { studentEmail: email };
      const result = await gradesCollection.findOne(filter);
      res.send(result);
    });

    // GET: All weekly routines sorted by months
    app.get("/all/weekly-routines", async (req, res) => {
      try {
        const { monthYear } = req.query; // e.g., "April 2025"
        let filter = {};

        if (monthYear) {
          const [monthName, year] = monthYear.split(" ");
          const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();

          const startOfMonth = new Date(`${year}-${monthIndex + 1}-01`);
          const endOfMonth = new Date(year, monthIndex + 1, 0); // Last day of the month

          filter = {
            weekStartDate: {
              $gte: startOfMonth.toISOString().split("T")[0],
              $lte: endOfMonth.toISOString().split("T")[0],
            },
          };
        }

        const routines = await routinesCollection
          .find(filter)
          .sort({ weekStartDate: -1 })
          .toArray();

        res.send(routines);
      } catch (err) {
        console.error("❌ Failed to fetch weekly routines:", err);
        res.status(500).send({ error: "Internal server error" });
      }
    });

    // GET: Fetch single weekly routine by ID
    app.get("/get-routine/:routineId", async (req, res) => {
      const { routineId } = req.params;

      if (!ObjectId.isValid(routineId)) {
        return res.status(400).send({ message: "Invalid routine ID" });
      }

      try {
        const routine = await routinesCollection.findOne({
          _id: new ObjectId(routineId),
        });

        if (!routine) {
          return res.status(404).send({ message: "Routine not found" });
        }

        res.send(routine);
      } catch (error) {
        console.error("❌ Error fetching routine:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    // get routine by faculty email
    app.get("/get-weekly/routine/:email", async (req, res) => {
      const { email } = req.params;
      const { monthYear } = req.query;

      try {
        const filter = {
          "routines.facultyEmails": email,
        };

        if (monthYear) {
          const [monthName, year] = monthYear.split(" ");
          const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();

          const startOfMonth = new Date(`${year}-${monthIndex + 1}-01`);
          const endOfMonth = new Date(year, monthIndex + 1, 0); // Last day of the month

          filter.weekStartDate = {
            $gte: startOfMonth.toISOString().split("T")[0],
            $lte: endOfMonth.toISOString().split("T")[0],
          };
        }

        const result = await routinesCollection.find(filter).toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching faculty weekly routine:", error);
        res.status(500).send({ error: "Internal server error" });
      }
    });

    // GET: Routine for a specific student by department (with optional month filter)
    app.get("/student/routine/:email", async (req, res) => {
      const { email } = req.params;
      const { monthYear } = req.query;

      try {
        // Get the student's department
        const student = await studentsCollection.findOne({ email });
        if (!student || !student.department) {
          return res
            .status(404)
            .send({ message: "Student or department not found" });
        }

        let filter = { department: student.department };

        if (monthYear) {
          const [monthName, year] = monthYear.split(" ");
          const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
          const startOfMonth = new Date(`${year}-${monthIndex + 1}-01`);
          const endOfMonth = new Date(year, monthIndex + 1, 0);

          filter.weekStartDate = {
            $gte: startOfMonth.toISOString().split("T")[0],
            $lte: endOfMonth.toISOString().split("T")[0],
          };
        }

        const routines = await routinesCollection
          .find(filter)
          .sort({ weekStartDate: -1 })
          .toArray();

        res.send(routines);
      } catch (err) {
        console.error("Error fetching student routine:", err);
        res.status(500).send({ message: "Server error" });
      }
    });

    // get message based on email
    app.get("/messages/:email", async (req, res) => {
      const { email } = req.params;

      if (!email) {
        return res.status(400).send({ message: "Email is required" });
      }

      try {
        const messages = await messageCollection
          .find({ recipients: email })
          .sort({ createdAt: -1 }) // optional: latest first
          .toArray();
        res.send(messages);
      } catch (err) {
        console.error("❌ Error fetching messages:", err);
        res.status(500).send({ message: "Failed to retrieve messages" });
      }
    });

    // get specific message by id
    app.get("/messages/:email", async (req, res) => {
      const { email } = req.params;
      console.log(email);
      if (!email) {
        return res.status(400).send({ message: "Email is required" });
      }

      try {
        const messages = await messageCollection
          .find({
            $or: [{ recipients: email }, { sender: email }],
          })
          .sort({ createdAt: -1 })
          .toArray();
        console.log(messages);
        res.send(messages);
      } catch (err) {
        console.error("❌ Error fetching messages:", err);
        res.status(500).send({ message: "Failed to retrieve messages" });
      }
    });

    // ✅ GET: A single message by its ID
    app.get("/message/:id", async (req, res) => {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ message: "Invalid message ID" });
      }

      try {
        const message = await messageCollection.findOne({
          _id: new ObjectId(id),
        });
        if (!message) {
          return res.status(404).send({ message: "Message not found" });
        }
        res.send(message);
      } catch (err) {
        console.error("❌ Error fetching message by ID:", err);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    // get all reply for specific message
    app.get("/message/:id/replies", async (req, res) => {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ message: "Invalid message ID" });
      }

      try {
        const replies = await messageCollection
          .find({ replyTo: id })
          .sort({ createdAt: 1 }) // optional: newest first => sort({ createdAt: -1 })
          .toArray();

        res.send(replies);
      } catch (err) {
        console.error("❌ Error fetching replies:", err);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    // get specific user email
    app.get('/user-send/message/:email',async(req,res)=>{
      const {email} = req.params;
      const filter = {email};
      const result = await  messageCollection.find(filter).toArray()
      res.send(result)
    })

    // notifications routes

    // ✅ Save new course and notify assigned faculty
    app.post("/add-courses", async (req, res) => {
      const course = req.body;
      try {
        const result = await courseCollection.insertOne(course);

        // ✅ Store notification in DB
        await notificationCollection.insertOne({
          type: "course-assigned",
          facultyEmail: course.facultyEmail,
          courseId: result.insertedId,
          courseName: course.name,
          applicationDate: new Date(),
          reason: "📚 New Course Assigned",
          seen: false,
        });

        // ✅ Emit notification to faculty-room
        io.to("faculty-room").emit("faculty-notification", {
          type: "course-assigned",
          facultyEmail: course.facultyEmail,
          courseId: result.insertedId,
          courseName: course.name,
          applicationDate: new Date(),
          reason: "📚 New Course Assigned",
        });

        res.send(result);
      } catch (error) {
        console.error("❌ Error adding course or sending notification:", error);
        res.status(500).send({ error: "Failed to add course" });
      }
    });

    // ✅ Notify clients when a new leave is submitted
    app.post("/leave-application", async (req, res) => {
      const application = req.body;
      const result = await leavesCollection.insertOne(application);

      // Derive facultyEmail from student's first course
      let facultyEmail = null;
      const student = await studentsCollection.findOne({
        email: application.email,
      });

      if (student?.courses?.length) {
        const courseIds = student.courses.map((c) => c.courseId);
        const course = await courseCollection.findOne({
          _id: new ObjectId(courseIds[0]),
        });
        facultyEmail = course?.facultyEmail || null;
      }

      const notification = {
        type: "leave-request",
        facultyEmail,
        email: application.email,
        applicationDate: new Date(),
        reason: application.reason || "📩 New Leave Request",
        seen: false,
      };

      await notificationCollection.insertOne(notification);

      // Emit notification to faculty-room only
      io.to("faculty-room").emit("faculty-notification", notification);
      res.send(result);
    });

    // ✅ POST: Enroll a student into a course + Notify assigned faculty
    app.post("/enroll-course", async (req, res) => {
      try {
        const { email, course } = req.body;
        
        if (!email || !course?.courseId || !course?.courseName) {
          return res
            .status(400)
            .send({ success: false, message: "Missing required fields." });
        }
    
        // ✅ Fetch student info
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
        // ✅ Find course by _id (parsed from string)
        let actualCourse = null;
        if (ObjectId.isValid(course.courseId)) {
          actualCourse = await courseCollection.findOne({
            _id: new ObjectId(course.courseId),
          });
        } else {
          console.log("❌ Invalid ObjectId:", course.courseId);
        }
    
        if (actualCourse?.facultyEmail) {
          // ✅ Store notification in DB
          const notification = {
            type: "student-enrolled",
            facultyEmail: actualCourse.facultyEmail,
            email, // student email
            courseId: actualCourse._id.toString(), // for clarity
            courseName: actualCourse.name,
            applicationDate: new Date(),
            reason: `👨‍🎓 ${studentName} enrolled in ${actualCourse.name}`,
            seen: false,
          };
    
          console.log("🔔 Creating notification:", notification);
    
          await notificationCollection.insertOne(notification);
          io.to("faculty-room").emit("faculty-notification", notification);
    
          console.log("📢 Notification emitted to faculty room.");
        } else {
          console.log("⚠️ No faculty email found for course:", actualCourse);
        }
    
        res.send({ success: true, result });
      } catch (error) {
        console.error("❌ Enroll Error:", error);
        res.status(500).send({ success: false, message: "Server error" });
      }
    });
    
    // ✅ PATCH: Mark faculty notifications as seen
    app.patch("/faculty-notifications/mark-seen", async (req, res) => {
      const { notificationIds } = req.body;
      if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
        return res
          .status(400)
          .send({ error: "notificationIds must be a non-empty array" });
      }

      try {
        const objectIds = notificationIds.map((id) => new ObjectId(id));

        const result = await notificationCollection.updateMany(
          { _id: { $in: objectIds } },
          { $set: { seen: true } }
        );

        res.send({ success: true, modified: result.modifiedCount });
      } catch (err) {
        console.error("❌ Failed to mark notifications as seen:", err);
        res.status(500).send({ error: "Server error" });
      }
    });

    // get faculty notification route
    app.get("/faculty-notifications", async (req, res) => {
      const { facultyEmail } = req.query;
      if (!facultyEmail) {
        return res.status(400).send({ error: "facultyEmail is required" });
      }

      try {
        const notifications = await notificationCollection
          .find({ facultyEmail })
          .sort({ applicationDate: -1 })
          .toArray();
        res.send(notifications);
      } catch (err) {
        console.error("❌ Error fetching faculty notifications:", err);
        res.status(500).send({ error: "Server error" });
      }
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

server.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
