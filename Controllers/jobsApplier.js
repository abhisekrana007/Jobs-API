// controllers/jobApplier.js
const { withCache, invalidateCache, updateCache } = require('../decorators/cache');
const Job = require('../models/jobs');

const CACHE_TTL = {
  SEARCH: 600 // 10 minutes
};

const cacheKeys = {
  publicSearch: (req) => `jobs:search:${req.query.search || 'all'}:${req.query.location || 'all'}`,
  singleJob: (req) => `job:${req.params.id}`,
};

const getPublicJobs = [
  withCache(cacheKeys.publicSearch, CACHE_TTL.SEARCH),
  async (req, res, next) => {
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
  async (req, res, next) => {
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
  },
  updateCache(cacheKeys.singleJob, CACHE_TTL.SINGLE_JOB),

  invalidateCache([cacheKeys.publicSearch]),

  (req, res) => {
    res.status(200).json(res.locals.updatedData);
  }
];

const getMyApplication = [
  async (req, res, next) => {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const application = job.applicants.find(
      app => app.userId.toString() == req.user.userId && app._id.toString() == req.params.applicationId
    );
    
    if (!application) {
      return res.status(400).json({ error: 'Application not found or unauthorized' });
    }

    res.locals.data = application;
    next();
  },
  
  (req, res) => {
    res.status(200).json(res.locals.data);
  }
]

const deleteMyApplication = [
  async (req, res, next) => {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const applicationIndex = job.applicants.findIndex(
      app =>
        app.userId.toString() === req.user.userId &&
        app._id.toString() === req.params.applicationId
    );

    if (applicationIndex === -1) {
      return res.status(400).json({ error: 'Application not found or unauthorized' });
    }

    const removed = job.applicants.splice(applicationIndex, 1);
    await job.save();

    res.locals.updatedData = removed[0];
    next();
  },

  invalidateCache([cacheKeys.singleJob, cacheKeys.publicSearch]),

  (req, res) => {
    res.status(200).json({ message: 'Application deleted', application: res.locals.updatedData });
  }
];

const getAllMyApplications = [
  async (req, res, next) => {
    const jobs = await Job.find({ 'applicants.userId': req.user.userId });

    const applications = [];

    jobs.forEach(job => {
      const userApp = job.applicants.find(
        app => app.userId.toString() === req.user.userId
      );

      if (userApp) {
        const jobObj = job.toObject();
        delete jobObj.applicants;
        delete jobObj.createdBy;

        applications.push({
          job: jobObj,
          application: userApp
        });
      }
    });

    res.locals.data = applications;
    next();
  },

  (req, res) => {
    res.status(200).json(res.locals.data);
  }
];

module.exports = { getPublicJobs, applyForJob, getMyApplication, deleteMyApplication, getAllMyApplications };