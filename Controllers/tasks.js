const jwt = require('jsonwebtoken')



const user = async (req,res) =>{
    const {name,pass} = req.body
    if(!name || !pass){
        res.status(400).json('Give a Username and Password')
    }
    const token = jwt.sign({name},process.env.jwt_key)

    res.status(200).json({token})
}

const info = async (req,res) =>{
    res.status(200).json({username : `${req.user.name}`})
    
}

module.exports = {info,user}