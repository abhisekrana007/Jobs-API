const express = require('express')
const app = express()

require('dotenv').config();
require('express-async-errors');

const auth = require('./Routes/auth')
const jobs = require('./Routes/jobs')

const connectdb = require('./db/connect')

const authmiddle = require('./Middleware/auth')

app.get('/hello',(req,res)=>{
    res.send('Hello')
})

//middleware
app.use(express.json())

//route
app.use('/api/v1/auth',auth)
app.use('/api/v1/jobs',authmiddle,jobs)

const port = process.env.port || 3000

const start = async () =>{
    try {
        await connectdb(process.env.connectstring)
        app.listen(port,console.log(`Server is Listening on port ${port}...`))
    } catch (error) {
        console.log(error)
    }
}

start()