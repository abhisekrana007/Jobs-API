const express = require('express')
const app = express()

require('dotenv').config();
require('express-async-errors');

const auth = require('./Routes/auth')
const jobs = require('./Routes/jobs')
const connectdb = require('./db/connect')

app.get('/hello', (req, res) => {
    res.send('Hello')
})

//middleware
app.use(express.json())

// Add to app.js before your routes
// app.use((req, res, next) => {
//     res.locals.redisAvailable = redis.status === 'ready';
//     next();
// });

//route
app.use('/api/v1/auth', auth)
app.use('/api/v1/jobs', jobs)

const port = process.env.port || 3000

const start = async () => {
    try {
        await connectdb(process.env.connectstring)
        app.listen(port, console.log(`Server is Listening on port ${port}...`))
    } catch (error) {
        console.log(error)
    }
}

start()