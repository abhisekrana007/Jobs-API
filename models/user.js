const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true,'Must provide a name'],
        trim : true,
        minlength : 3,
        maxlength : 20,
    },
    email : {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: 'Email address is required',
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password : {
        type : String,
        required : [true,'Must provide a passowrd'],
        minlength : 3
    },
})

UserSchema.pre('save', async function(next){
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password,salt)
})

UserSchema.methods.createToken = function (){
    return jwt.sign(
        {name : this.name, userid : this._id},
        process.env.jwt_key,
        {expiresIn : process.env.expires_in}
    )
}
UserSchema.methods.comparePass = async function (pass){
    const comp = await bcrypt.compare(pass,this.password)
    return comp
}

module.exports = mongoose.model('User', UserSchema)