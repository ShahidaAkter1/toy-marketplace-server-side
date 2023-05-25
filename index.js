const express = require('express')
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
//dot env
require('dotenv').config()

const cors = require('cors');
const port = process.env.PORT || 5000;


//middleware
app.use(cors())
app.use(express.json())



// console.log(process.env.DB_USER);
// console.log(process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.843endu.mongodb.net/?retryWrites=true&w=majority`;

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


  




        //.....................................write code here..........
        const toyCollection = client.db("ToyDB").collection('toy');



        //create index on ywo fields
        const indexKeys = {toyName:1,  category:1 };
        const indexOptions={name:"toyNameCategory"};

        //search
        const result = await toyCollection.createIndex
        (indexKeys,indexOptions);
        app.get("/toySearchByTitle/:text", async(req,res) =>{
            const searchText = req.params.text;

            const result= await toyCollection.find({
                $or: [
                    { toyName: { $regex: searchText, $options: "i"}},
                    { category: { $regex: searchText , $options: "i"}},
                ],
            })
            .toArray();
            res.send(result);
        })

        

        //create
        app.post('/toy', async (req, res) => {
            const newToy = req.body;
            console.log( 'new toy :: ',newToy);
            const result = await toyCollection.insertOne(newToy);
            res.send(result);
        })

        // get multiple toy or all data in array format
        app.get('/toy', async (req, res) => {
            // const cursor = toyCollection.find().sort({"price": -1}) ;
            const cursor = toyCollection.find().limit(20).sort({"price": -1}) ;
            const result = await cursor.toArray();
            res.send(result);
        })



        app.get('/toy/:id', async (req, res) => {
            const id=req.params.id;
            console.log(id);
            const query = { _id: new ObjectId(id) }
            const result = await toyCollection.findOne(query);
            res.send(result);
        })


        app.put('/toy/:id', async (req, res) => {
            const id = req.params.id;//get id
            console.log('update id : ',id);
            const filter = { _id: new ObjectId(id) }//get specific data
            const options = { upsert: true }//if data exist update otherwise create
            const updatedToy = req.body;//get data from client side

            console.log(updatedToy);
           //set data
            const toy = {
              $set: {
                price: updatedToy.price,
                quantity: updatedToy.quantity,
                details: updatedToy.details
             }
         }
           const result = await toyCollection.updateOne(filter, toy, options)
           res.send(result);
         })
        


 
        //delete
        app.delete('/toy/:id', async (req, res) => {
            const getId = req.params.id;
            console.log(getId);
            const query = { _id: new ObjectId(getId) }
            const result = await toyCollection.deleteOne(query);
            res.send(result)
        })


 


        //.....................................End code here..........





















        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send(' Toy server is running')
})

app.listen(port, () => {
    console.log(`Running at port is ${port}`);
})





