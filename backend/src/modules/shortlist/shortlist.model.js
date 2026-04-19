import mongoose from 'mongoose';

const shortlistSchema = new mongoose.Schema({
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true,
    unique: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobDrive: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobDrive',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  shortlistedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shortlistedAt: {
    type: Date,
    default: Date.now
  },
  priority: {
    type: String,
    enum: ['HIGH', 'MEDIUM', 'LOW'],
    default: 'MEDIUM'
  },
  interviewRound: {
    type: String,
    enum: ['SCREENING', 'TECHNICAL', 'HR', 'FINAL'],
    default: 'SCREENING'
  },
  interviewDate: {
    type: Date
  },
  interviewLocation: {
    type: String,
    trim: true
  },
  interviewMode: {
    type: String,
    enum: ['ONSITE', 'REMOTE', 'PHONE', 'VIDEO'],
    default: 'VIDEO'
  },
  status: {
    type: String,
    enum: ['SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'SELECTED', 'REJECTED'],
    default: 'SHORTLISTED'
  },
  feedback: {
    type: String,
    trim: true
  },
  rating: {
    technical: {
      type: Number,
      min: 1,
      max: 10
    },
    communication: {
      type: Number,
      min: 1,
      max: 10
    },
    overall: {
      type: Number,
      min: 1,
      max: 10
    }
  },
  notes: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries
shortlistSchema.index({ application: 1 }, { unique: true });
shortlistSchema.index({ jobDrive: 1, status: 1 });
shortlistSchema.index({ student: 1, status: 1 });
shortlistSchema.index({ company: 1, status: 1 });
shortlistSchema.index({ shortlistedBy: 1 });
shortlistSchema.index({ priority: 1, status: 1 });

export const Shortlist = mongoose.model('Shortlist', shortlistSchema);
export default Shortlist;
