const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

//middleware/

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.n3lnz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log(uri);


async function run (){
    try{
            await client.connect();
            console.log('database connected successfully');
            const database = client.db("simbaStore");
            const productsCollection = database.collection("products");
            const clientOrderCollection = database.collection('clientOrders')
            const userCollection = database.collection('users');
            const reviewsCollection = database.collection('reviews');

            
            // get single product
            app.get('/products/:id', async(req, res)=>{
                const id = req.params.id;
                const query = {_id:ObjectId(id)};
                const product = await productsCollection.findOne(query);
                res.json(product);
            })
            
            //get all data
            app.get('/products', async(req, res)=>{
                const cursor = productsCollection.find({});
                const products = await cursor.toArray();
                res.send(products);
            })

            // review
            app.get('/reviews', async(req, res)=>{
                const cursor = reviewsCollection.find({});
                const revies = await cursor.toArray();
                res.send(revies);
            })

            //clint post api

            app.post('/orders', async (req, res)=>{
                const order = req.body;
                const result = await clientOrderCollection.insertOne(order);

                res.json(result)

            });

            //client get with email api
            app.get('/orders', async (req, res)=>{
                let query = {}
               const email = req.query.email;
               if(email){
                    query = {email : email};
               }
                const cursor = clientOrderCollection.find(query);
                const orders = await cursor.toArray();
                res.send(orders);
            });

            //client get all api
            app.get('/orders', async (req, res)=>{
                const cursor = clientOrderCollection.find({});
                const orders = await cursor.toArray();
                res.send(orders);
            });

            //delete api
            app.delete('/orders/:id', async(req, res) =>{
                const id = req.params.id;
                const query = {_id:ObjectId(id)};
                const result = await clientOrderCollection.deleteOne(query);
                res.json(result);

            })


            app.delete('/products/:id', async(req, res) =>{
                const id = req.params.id;
                const query = {_id:ObjectId(id)};
                const result = await productsCollection.deleteOne(query);
                res.json(result);

            })


            //POST API
            app.post('/products', async (req, res)=>{
                const product = req.body;

                const result = await productsCollection.insertOne(product)

                res.json(result)

            });

            //review
            app.post('/reviews', async (req, res)=>{
                const reviews = req.body;

                const result = await reviewsCollection.insertOne(reviews)

                res.json(result)

            });

            // users api post

            app.post('/users', async (req, res)=>{
                const user = req.body;
                const result = await userCollection.insertOne(user)
                res.json(result);
            });

            // get user admin only

            app.get('/users/:email', async(req, res)=>{
                const email = req.params.email;
                const query = {email: email};
                const user = await userCollection.findOne(query);
                let isAdmin = false;
               if(user?.role === 'admin'){
                isAdmin = true;
               }
               res.json({admin : isAdmin});
            })

            app.put('/users', async (req, res)=>{
                const user = req.body;
                const query = {email: user.email};
                const options = {upsert: true};
                const updateDoc = {$set: user};
                const result = userCollection.updateOne(query, updateDoc, options);
                res.json(result); 

            });

            app.put('/users/admin', async (req, res)=>{
                const user = req.body;
                console.log('put', user);
                const query = {email: user.email};
                const updateDoc = {$set:{role: 'admin'}};
                const result = await userCollection.updateOne(query, updateDoc);
                res.json(result);
            })
    }

    finally{
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) =>{
    res.send('simba is running');
});


app.listen(port, ()=>{
    console.log('Server running at port', 5000);
})