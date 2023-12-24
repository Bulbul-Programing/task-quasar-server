const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000

require('dotenv').config()
app.use(express.json())
app.use(cors({
    origin: ['http://localhost:5174', 'http://localhost:5173', 'https://task-quasar-2.firebaseapp.com'],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}))



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.grjx6dw.mongodb.net/?retryWrites=true&w=majority`;

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
        // await client.connect();
        const taskCollection = client.db('taskDB').collection('tasks')

        app.get('/totalTask/:email', async(req, res)=>{
            const email = req.params.email
            const query = {email : email}
            const result = await taskCollection.find(query).toArray()
            res.send(result)
        })

        app.get('/taskWithStatus/task/:email', async(req, res)=>{
            const userEmail = req.params.email
            const status = req.params.status
            const query1 = {email : userEmail}
            const query2 = {status : 'task'}
            const query = { $and: [query1, query2] };
            const result = await taskCollection.find(query).toArray()
            res.send(result)
        })
        app.get('/taskPending/:email', async(req, res)=>{
            const userEmail = req.params.email
            const query1 = {email : userEmail}
            const query2 = {status : 'pending'}
            const query = { $and: [query1, query2] };
            const result = await taskCollection.find(query).toArray()
            res.send(result)
        })
        app.get('/taskComplete/:email', async(req, res)=>{
            const userEmail = req.params.email
            const query1 = {email : userEmail}
            const query2 = {status : 'complete'}
            const query = { $and: [query1, query2] };
            const result = await taskCollection.find(query).toArray()
            res.send(result)
        })

        app.get('/singleTask/:id', async(req, res)=>{
            const id = req.params.id
            const query = {_id : new ObjectId(id)}
            const result = await taskCollection.findOne(query)
            res.send(result)
        })

        app.post('/addTask', async (req, res) => {
            const data = req.body
            const result = await taskCollection.insertOne(data)
            res.send(result)
        })

        app.put('/updateTask/:id', async(req, res)=>{
            const id = req.params.id
            const data = req.body
            const filter = {_id : new ObjectId(id)}
            const options = { upsert: true };
            const update = {
                $set:{
                    title : data.title,
                    description : data.description,
                    modify : data.modify,
                    date : data.date,
                }
            }
            const result = await taskCollection.updateOne(filter, update, options)
            res.send(result)
        })

        app.put('/statusUpdate/:id', async(req, res)=>{
            const id = req.params.id
            const updateStatus = req.body
            const filter = {_id : new ObjectId(id)}
            const options = { upsert: true };
            const update = {
                $set:{
                    status : updateStatus.status
                }
            }
            const result = await taskCollection.updateOne(filter, update, options)
            res.send(result)
        })


        app.delete('/taskDelete/:id', async(req, res)=>{
            const id = req.params.id
            const query = {_id : new ObjectId(id)}
            const result = await taskCollection.deleteOne(query)
            res.send(result)
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Server is running')
})

app.listen(port, () => {
    console.log(`port is running ${port}`);
})