const User = require('../models/user')

const newuser = async (req,res) =>{
    const Person = await User.create({...req.body})
    const token = Person.createToken()
    res.status(200).json({token})
    
}
const olduser = async (req,res) =>{
    const {email,password} = req.body
    if(!email || !password){
        res.status(500).json({msg : 'Provide Email and Password'})
    }
    const Person = await User.findOne({email})
    if(!Person){
        res.status(500).json({msg : 'No User Exists'})
    }
    const comp = await Person.comparePass(password)
    if(comp){
        const token = Person.createToken()
        res.status(200).json({name : Person.name, token})
    }
}

module.exports = {newuser,olduser}