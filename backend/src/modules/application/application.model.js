import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['APPLIED', 'SHORTLISTED', 'REJECTED', 'SELECTED', 'WITHDRAWN'],
    default: 'APPLIED'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  shortlistedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  },
  selectedAt: {
    type: Date
  },
  withdrawnAt: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  },
  recruiterNotes: {
    type: String,
    trim: true
  },
  eligibilityScore: {
    type: Number,
    min: 0,
    max: 100
  },
  isEligible: {
    type: Boolean,
    required: true
  },
  resumeUrl: {
    type: String,
    trim: true
  },
  portfolioUrl: {
    type: String,
    trim: true
  },
  additionalDocuments: [{
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for faster queries
applicationSchema.index({ student: 1, jobDrive: 1 }, { unique: true }); // One application per job per student
applicationSchema.index({ jobDrive: 1, status: 1 });
applicationSchema.index({ student: 1, status: 1 });
applicationSchema.index({ appliedAt: -1 });
applicationSchema.index({ isEligible: 1, status: 1 });

// Pre-save middleware to update timestamp based on status
applicationSchema.pre('save', function(next) {
  const now = new Date();
  if (this.isModified('status')) {
    switch (this.status) {
      case 'SHORTLISTED':
        this.shortlistedAt = this.shortlistedAt || now;
        break;
      case 'REJECTED':
        this.rejectedAt = this.rejectedAt || now;
        break;
      case 'SELECTED':
        this.selectedAt = this.selectedAt || now;
        break;
      case 'WITHDRAWN':
        this.withdrawnAt = this.withdrawnAt || now;
        break;
    }
  }
  next();
});

export const Application = mongoose.model('Application', applicationSchema);
export default Application;
