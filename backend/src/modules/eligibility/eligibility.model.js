import mongoose from 'mongoose';

const eligibilitySchema = new mongoose.Schema({
  jobDrive: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobDrive',
    required: true,
    unique: true
  },
  minPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  allowedBranches: [{
    type: String,
    trim: true
  }],
  maxBacklogs: {
    type: Number,
    required: true,
    min: 0
  },
  minTestScore: {
    type: Number,
    min: 0
  },
  educationLevel: {
    type: String,
    enum: ['BACHELOR', 'MASTER', 'DIPLOMA', 'PHD'],
    default: 'BACHELOR'
  },
  passingYear: {
    from: {
      type: Number,
      min: 2000
    },
    to: {
      type: Number,
      min: 2000
    }
  },
  skills: [{
    type: String,
    trim: true
  }],
  additionalCriteria: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
eligibilitySchema.index({ jobDrive: 1 });
eligibilitySchema.index({ isActive: 1 });

export const Eligibility = mongoose.model('Eligibility', eligibilitySchema);
export default Eligibility;
