const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
});

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: 100
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: 50
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['active', 'review', 'closed'],
    default: 'active',
    index: true
  },
  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator ID is required']
  },
  applicants: [ApplicationSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Job', JobSchema);