const express = require('express');
const app = express()
const cors = require('cors');
const port = process.env.PORT || 3000;
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
app.use(express.json())
app.use(cors())


const uri = "mongodb+srv://academicore404:qOJBfn3aa3Ph18f7@cluster404.ppsob.mongodb.net/?appName=Cluster404";


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const usersCollection = client.db("academi_core").collection('users')

    app.post('/users',async(req,res)=>{
        const user = req.body;
        const result =await usersCollection.insertOne(user)
        res.send(result)
    })

    await client.db("admin").command({ ping: 1 });

    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  } finally {
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send('Students Management')
})

app.listen(port,()=>{
    console.log('Students Management Server running on port',port)
})

// academicore4
// dTplCISQ8tXRlyye