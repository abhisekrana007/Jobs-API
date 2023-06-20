const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const JobSchema = new mongoose.Schema(
    {
        company : {
            type : String,
            required : [true,'Must provide a company'],
            trim : true,
            maxlength : 20,
        },
        position : {
            type: String,
            trim: true,
            required: [true,'Position of the job is required'],
        },
        status : {
            type : String,
            required : [true,'Must provide a passowrd'],
            enum : ['interview','pending','declined'],
            default : 'pending'
        },
        createdby : {
            type : mongoose.Types.ObjectId,
            ref : 'User',
            required : [true,'Provide a User']
        }
    },
    {
        timestamps : true
    }
)

module.exports = mongoose.model('Job', JobSchema)