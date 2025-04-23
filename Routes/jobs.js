const express = require('express');
const router = express.Router();
const authmiddle = require('../Middleware/auth');

// Import controller middleware arrays
const {
  getAllMyJobs,
  getJob,
  createJob,
  deleteJob,
  updateJob
} = require('../Controllers/jobsCreator');

const {
  getPublicJobs,
  applyForJob,
  getApplicants
} = require('../Controllers/jobsApplier');

// Job Management Routes (all require auth)
router.route('/')
  .get(authmiddle, ...getAllMyJobs)
  .post(authmiddle, ...createJob);

router.get('/public', ...getPublicJobs);

router.route('/:id')
  .get(authmiddle, ...getJob)
  .patch(authmiddle, ...updateJob)
  .delete(authmiddle, ...deleteJob);



router.route('/:id/apply')
  .post(authmiddle, ...applyForJob); // Requires auth to apply

router.route('/:id/applicants')
  .get(authmiddle, ...getApplicants); // Requires auth to view applicants

module.exports = router;