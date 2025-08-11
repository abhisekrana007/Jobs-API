// controllers/jobCreator.js
const { withCache, invalidateCache, updateCache } = require('../decorators/cache');
const cache = require('../services/cache');
const Job = require('../models/jobs');

// Cache configuration
const CACHE_TTL = {
  USER_JOBS: 3600, // 1 hour
  SINGLE_JOB: 1800 // 30 minutes
};

const cacheKeys = {
  userJobs: (req) => `jobs:user:${req.user.userId}`,
  singleJob: (req) => `job:${req.params.id}`,
  allSearches: () => 'jobs:search:*'
};

// Controller methods as middleware arrays
const getAllMyJobs = [
  withCache(cacheKeys.userJobs, CACHE_TTL.USER_JOBS),
  async (req, res, next) => {
    const jobs = await Job.find({ createdBy: req.user.userId });
    res.json(jobs);
  }
];

const getJob = [
  withCache(cacheKeys.singleJob, CACHE_TTL.SINGLE_JOB),
  async (req, res, next) => {
    const job = await Job.findOne({
      _id: req.params.id,
      createdBy: req.user.userId
    });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  }
];

const createJob = [
  async (req, res, next) => {
    const job = await Job.create({
      ...req.body,
      createdBy: req.user.userId
    });
    res.locals.newJob = job;
    next();
  },
  invalidateCache([cacheKeys.userJobs, cacheKeys.allSearches]),

  (req, res) => {
    res.status(201).json(res.locals.newJob);
  }
];

const updateJob = [  
  async (req, res, next) => {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.locals.updatedData = job;
    next();
  },
  updateCache(cacheKeys.singleJob, CACHE_TTL.SINGLE_JOB),

  invalidateCache([cacheKeys.userJobs, cacheKeys.allSearches]),

  (req, res) => {
    res.status(200).json(res.locals.updatedData);
  }
];

const deleteJob = [  
  async (req, res, next) => {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.userId
    });
    res.locals.deletedData = job;
    next();
  },
  invalidateCache([cacheKeys.userJobs, cacheKeys.singleJob, cacheKeys.allSearches]),

  (req, res) => {
    if (!res.locals.deletedData) return res.status(404).json({ error: 'Job not found' });    
    res.status(200).json({ success: true });
  }
];

const getApplicants = [
  async (req, res, next) => {
    const job = await Job.findOne({
      _id: req.params.id,
      createdBy: req.user.userId
    }).populate('applicants.userId', 'name email');

    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json({
      count: job.applicants.length,
      applicants: job.applicants
    });
  }
];

module.exports = { getAllMyJobs, getJob, createJob, deleteJob, updateJob, getApplicants};