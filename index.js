const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 3000

// middleware
app.use(cors())
app.use(express.json())
// mongodb

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mwhjnw6.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  const toyCollection=client.db('products').collection('toys');
  try {
    await client.connect();
// post data
    app.post('/add-Toy',async(req,res)=>{
      const data=req.body;
      const result = await toyCollection.insertOne(data);
      res.send(result)
    })
  //  get all data
    app.get('/allToy',async(req,res)=>{
      const result= await toyCollection.find().limit(20).toArray();
      res.send(result)
    })
  //  get data by name
  app.get('/allToyBySearch/:searchText',async(req,res)=>{
    const SearchText=req.params.searchText;
    const result= await toyCollection.find({
      $or:[
        {name:{$regex:SearchText,$options:"i"}}
      ]
    }).toArray();
    res.send(result)
  })
  // get data by id
  app.get('/allToy/:id',async(req,res)=>{
    const id=req.params.id;
    const query={_id:new ObjectId(id)}
    const result=await toyCollection.findOne(query);
    res.send(result)
  })
  // get data by category
  app.get('/toyCategory/:text',async(req,res)=>{
    const text=req.params.text
    const query={category:text}
    const result= await toyCollection.find(query).toArray();
    res.send(result)
  })
  // get data by email
  app.get('/myToy/',async(req,res)=>{
    const email=req.query.email;
    console.log(email)
    const query={Seller_email:email};
    const result= await toyCollection.find(query).sort({price:1}).toArray();
    res.send(result)
  })
  // update toy
  app.put('/updateToy/:id',async(req,res)=>{
    const id=req.params.id;
    console.log(id)
    const filter = {_id:new ObjectId(id)};
    const options = { upsert: true };
    const updateToy=req.body;
    console.log(updateToy)
    const updateDoc = {
      $set: {
        price:updateToy.price,
        number:updateToy.number,
        description:updateToy.description
      }
    }
    const result=await toyCollection.updateOne(filter,updateDoc,options);
    res.send(result)
  })
  app.delete('/deleteToy/:id',async(req,res)=>{
    const id=req.params.id;
    const query={_id:new ObjectId(id)};
    const result=await toyCollection.deleteOne(query);
    res.send(result)
  })
    console.log('mongodb connected')
  } finally {
    
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})