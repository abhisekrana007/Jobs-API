const mongoose = require('mongoose')

const TaskSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true,'Must provide a name for the Item'],
        trim : true,
    },
    featured : {
        type : Boolean,
        default : false,
    },
    price : {
        type : Number,
        required : [true,'Must provide a price for the Item'],
    },
    rating : {
        type : Number,
        default : 4.5,
    },
    createdAt : {
        type : Date,
        default : Date.now(),
    },
    company : {
        type : String,
        required : [true,'Must provide Company name of the Item'],
        enum : {
            values : ['ikea','metro','dmart','reliance','amazon'],
            message : '{VALUE} is not supported',
        },
    },
})

module.exports = mongoose.model('Task',TaskSchema)