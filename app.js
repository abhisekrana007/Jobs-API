const express = require('express')
const app = express()
require('dotenv').config();

const tasks = require('./Routes/tasks')

const connectdb = require('./db/connect')

//middleware
app.use(express.json())

//route
app.use('/api/v1/jwt',tasks)

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