const jwt = require('jsonwebtoken')
const Job = require('../models/jobs')

const getAllJobs = async (req,res) =>{
    const job = await Job.find({createdby : req.user.userid})
    res.status(200).json({job})
}
const getJob = async (req,res) =>{
    const job = await Job.findOne({createdby : req.user.userid, _id : req.params.id})
    if(!job){
        res.status(500).json({msg: error})
    }
    res.status(200).json({job})
}
const createJob = async (req,res) =>{
    req.body.createdby = req.user.userid
    const job = await Job.create({...req.body})
    res.status(200).json({job})
    
}
const deleteJob = async (req,res) =>{
    const job = await Job.findOneAndRemove({createdby : req.user.userid, _id : req.params.id})
    if(!job){
        res.status(500).json({msg: error})
    }
    res.status(200).json({job})
}
const updateJob = async (req,res) =>{
    const job = await Job.findOneAndUpdate({createdby : req.user.userid, _id : req.params.id},req.body,{ new: true, runValidators: true })
    if(!job){
        res.status(500).json({msg: error})
    }
    res.status(200).json({job})
    
}

module.exports = {getAllJobs,getJob,createJob,deleteJob,updateJob}