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
  async (req, res) => {
    const jobs = await Job.find({ createdBy: req.user.userId });
    res.json(jobs);
  }
];

const getJob = [
  withCache(cacheKeys.singleJob, CACHE_TTL.SINGLE_JOB),
  async (req, res) => {
    const job = await Job.findOne({
      _id: req.params.id,
      createdBy: req.user.userId
    });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  }
];

const createJob = [
  async (req, res) => {
    const job = await Job.create({
      ...req.body,
      createdBy: req.user.userId
    });
    res.status(201).json(job);
  },
  invalidateCache([cacheKeys.userJobs, cacheKeys.allSearches])
];

const updateJob = [  
  async (req, res) => {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.locals.updatedData = job;
    res.json(job);
  },
  updateCache(cacheKeys.singleJob, CACHE_TTL.SINGLE_JOB)
];

const deleteJob = [  
  async (req, res) => {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.userId
    });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json({ success: true });
  },
  invalidateCache([cacheKeys.userJobs, cacheKeys.singleJob, cacheKeys.allSearches])
];

module.exports = { getAllMyJobs, getJob, createJob, deleteJob, updateJob };