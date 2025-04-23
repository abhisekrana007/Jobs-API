// controllers/jobApplier.js
const { withCache, invalidateCache, updateCache } = require('../decorators/cache');
const Job = require('../models/jobs');

const CACHE_TTL = {
  SEARCH: 600 // 10 minutes
};

const cacheKeys = {
  publicSearch: (req) => 
    `jobs:search:${req.query.search || 'all'}:${req.query.location || 'all'}`
};

const getPublicJobs = [
  withCache(cacheKeys.publicSearch, CACHE_TTL.SEARCH),
  async (req, res) => {
    const { search, location } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (location) query.location = { $regex: location, $options: 'i' };

    const jobs = await Job.find(query).select('-applicants -createdBy');
    res.json(jobs);
  }
];

const applyForJob = [
  updateCache(
    (req) => cacheKeys.singleJob(req), // Reuse your key generator
    CACHE_TTL.SINGLE_JOB
  ),
  async (req, res) => {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const hasApplied = job.applicants.some(
      app => app.userId.toString() === req.user.userId
    );
    
    if (hasApplied) {
      return res.status(400).json({ error: 'Already applied' });
    }

    job.applicants.push({ userId: req.user.userId });
    await job.save();

    res.locals.updatedData = job;
    res.json({ success: true });
  }
];

const getApplicants = [
  async (req, res) => {
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

module.exports = { getPublicJobs, applyForJob, getApplicants };