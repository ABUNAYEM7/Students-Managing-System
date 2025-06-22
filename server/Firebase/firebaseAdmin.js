// firebaseAdmin.js
const admin = require("firebase-admin");
const serviceAccount = require("./firebase-service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "students-management-a611c.firebasestorage.app", 
});

const bucket = admin.storage().bucket();
module.exports = bucket;
