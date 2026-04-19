import mongoose from 'mongoose';

const jobDriveSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  package: {
    type: Number,
    required: true,
    min: 0
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  driveDate: {
    type: Date,
    required: true
  },
  lastDateToApply: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['OPEN', 'CLOSED', 'DRAFT'],
    default: 'DRAFT'
  },
  jobType: {
    type: String,
    enum: ['FULL_TIME', 'INTERNSHIP', 'PART_TIME'],
    default: 'FULL_TIME'
  },
  workMode: {
    type: String,
    enum: ['ONSITE', 'REMOTE', 'HYBRID'],
    default: 'ONSITE'
  },
  eligibility: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Eligibility'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries
jobDriveSchema.index({ company: 1, status: 1 });
jobDriveSchema.index({ driveDate: 1 });
jobDriveSchema.index({ lastDateToApply: 1 });
jobDriveSchema.index({ status: 1, lastDateToApply: 1 });

export const JobDrive = mongoose.model('JobDrive', jobDriveSchema);
export default JobDrive;
