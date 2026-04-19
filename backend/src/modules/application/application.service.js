import { Application } from './application.model.js';
import { JobDrive } from '../job/job.model.js';
import { EligibilityEngine } from '../eligibility/eligibility.engine.js';
import { validationResult } from 'express-validator';

class ApplicationService {
  /**
   * Apply for a job drive
   * @param {String} studentId - Student user ID
   * @param {String} jobDriveId - Job Drive ID
   * @param {Object} applicationData - Additional application data
   * @returns {Object} Application result
   */
  static async applyForJob(studentId, jobDriveId, applicationData = {}) {
    try {
      // Validate input
      const errors = validationResult(applicationData);
      if (!errors.isEmpty()) {
        throw new Error(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`);
      }

      // Check if job drive exists and is open
      const jobDrive = await JobDrive.findById(jobDriveId);
      if (!jobDrive) {
        throw new Error('Job drive not found');
      }

      if (jobDrive.status !== 'OPEN') {
        throw new Error('Job drive is not open for applications');
      }

      if (new Date() > new Date(jobDrive.lastDateToApply)) {
        throw new Error('Last date to apply has passed');
      }

      // Check if already applied
      const existingApplication = await Application.findOne({
        student: studentId,
        jobDrive: jobDriveId
      });

      if (existingApplication) {
        throw new Error('Already applied for this job drive');
      }

      // Check eligibility
      const eligibilityResult = await EligibilityEngine.checkEligibility(studentId, jobDriveId);
      
      if (!eligibilityResult.isEligible) {
        throw new Error(`Not eligible: ${eligibilityResult.reason || 'Does not meet eligibility criteria'}`);
      }

      // Create application
      const application = new Application({
        student: studentId,
        jobDrive: jobDriveId,
        isEligible: eligibilityResult.isEligible,
        eligibilityScore: eligibilityResult.score,
        ...applicationData
      });

      await application.save();

      // Populate related data
      await application.populate([
        { path: 'student', select: 'name email' },
        { path: 'jobDrive', populate: { path: 'company', select: 'name' } }
      ]);

      return {
        success: true,
        message: 'Application submitted successfully',
        application,
        eligibility: eligibilityResult
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to submit application'
      };
    }
  }

  /**
   * Get student's applications
   * @param {String} studentId - Student user ID
   * @param {Object} options - Query options
   * @returns {Object} List of applications
   */
  static async getStudentApplications(studentId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status = '',
        sortBy = 'appliedAt',
        sortOrder = 'desc'
      } = options;

      const query = { student: studentId };
      if (status) {
        query.status = status;
      }

      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const skip = (page - 1) * limit;
      
      const [applications, total] = await Promise.all([
        Application.find(query)
          .populate({
            path: 'jobDrive',
            populate: {
              path: 'company',
              select: 'name industry website'
            }
          })
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Application.countDocuments(query)
      ]);

      return {
        success: true,
        applications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch applications'
      };
    }
  }

  /**
   * Get applications for a job drive (for recruiters)
   * @param {String} jobDriveId - Job Drive ID
   * @param {Object} options - Query options
   * @returns {Object} List of applications
   */
  static async getJobDriveApplications(jobDriveId, options = {}) {
    try {
      const {
        page = 1,
        limit = 50,
        status = '',
        minScore = 0,
        sortBy = 'eligibilityScore',
        sortOrder = 'desc',
        eligibleOnly = false
      } = options;

      const query = { jobDrive: jobDriveId };
      
      if (status) {
        query.status = status;
      }

      if (eligibleOnly) {
        query.isEligible = true;
      }

      if (minScore > 0) {
        query.eligibilityScore = { $gte: minScore };
      }

      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const skip = (page - 1) * limit;
      
      const [applications, total] = await Promise.all([
        Application.find(query)
          .populate('student', 'name email')
          .populate({
            path: 'student',
            populate: {
              path: 'profile'
            }
          })
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Application.countDocuments(query)
      ]);

      // Get status statistics
      const statusStats = await Application.aggregate([
        { $match: { jobDrive: jobDriveId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const stats = {};
      statusStats.forEach(stat => {
        stats[stat._id] = stat.count;
      });

      return {
        success: true,
        applications,
        stats: {
          total: Object.values(stats).reduce((sum, count) => sum + count, 0),
          applied: stats.APPLIED || 0,
          shortlisted: stats.SHORTLISTED || 0,
          selected: stats.SELECTED || 0,
          rejected: stats.REJECTED || 0,
          withdrawn: stats.WITHDRAWN || 0
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch applications'
      };
    }
  }

  /**
   * Update application status (for recruiters)
   * @param {String} applicationId - Application ID
   * @param {String} status - New status
   * @param {String} updatedBy - User ID updating the status
   * @param {Object} updateData - Additional update data
   * @returns {Object} Updated application
   */
  static async updateApplicationStatus(applicationId, status, updatedBy, updateData = {}) {
    try {
      const application = await Application.findById(applicationId)
        .populate('jobDrive');

      if (!application) {
        throw new Error('Application not found');
      }

      // Validate status transitions
      const validTransitions = {
        'APPLIED': ['SHORTLISTED', 'REJECTED'],
        'SHORTLISTED': ['SELECTED', 'REJECTED'],
        'REJECTED': [], // Terminal state
        'SELECTED': [], // Terminal state
        'WITHDRAWN': [] // Terminal state
      };

      if (!validTransitions[application.status].includes(status)) {
        throw new Error(`Invalid status transition from ${application.status} to ${status}`);
      }

      // Update application
      application.status = status;
      if (updateData.recruiterNotes) {
        application.recruiterNotes = updateData.recruiterNotes;
      }
      if (updateData.notes) {
        application.notes = updateData.notes;
      }

      await application.save();

      // Populate updated data
      await application.populate([
        { path: 'student', select: 'name email' },
        { path: 'jobDrive', populate: { path: 'company', select: 'name' } }
      ]);

      return {
        success: true,
        message: `Application ${status.toLowerCase()} successfully`,
        application
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to update application status'
      };
    }
  }

  /**
   * Withdraw application (for students)
   * @param {String} applicationId - Application ID
   * @param {String} studentId - Student user ID
   * @returns {Object} Withdrawal result
   */
  static async withdrawApplication(applicationId, studentId) {
    try {
      const application = await Application.findOne({
        _id: applicationId,
        student: studentId
      });

      if (!application) {
        throw new Error('Application not found');
      }

      if (application.status === 'WITHDRAWN') {
        throw new Error('Application already withdrawn');
      }

      if (application.status === 'SELECTED') {
        throw new Error('Cannot withdraw selected application');
      }

      // Check if withdrawal is allowed (before drive date)
      const jobDrive = await JobDrive.findById(application.jobDrive);
      if (new Date() > new Date(jobDrive.driveDate)) {
        throw new Error('Cannot withdraw application after drive date');
      }

      application.status = 'WITHDRAWN';
      await application.save();

      return {
        success: true,
        message: 'Application withdrawn successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to withdraw application'
      };
    }
  }

  /**
   * Get application statistics
   * @param {String} jobDriveId - Job Drive ID (optional)
   * @param {String} studentId - Student ID (optional)
   * @returns {Object} Application statistics
   */
  static async getApplicationStats(jobDriveId = null, studentId = null) {
    try {
      const matchStage = {};
      if (jobDriveId) {
        matchStage.jobDrive = new mongoose.Types.ObjectId(jobDriveId);
      }
      if (studentId) {
        matchStage.student = new mongoose.Types.ObjectId(studentId);
      }

      const stats = await Application.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalApplications: { $sum: 1 },
            applied: {
              $sum: { $cond: [{ $eq: ['$status', 'APPLIED'] }, 1, 0] }
            },
            shortlisted: {
              $sum: { $cond: [{ $eq: ['$status', 'SHORTLISTED'] }, 1, 0] }
            },
            selected: {
              $sum: { $cond: [{ $eq: ['$status', 'SELECTED'] }, 1, 0] }
            },
            rejected: {
              $sum: { $cond: [{ $eq: ['$status', 'REJECTED'] }, 1, 0] }
            },
            withdrawn: {
              $sum: { $cond: [{ $eq: ['$status', 'WITHDRAWN'] }, 1, 0] }
            },
            eligibleApplications: {
              $sum: { $cond: ['$isEligible', 1, 0] }
            },
            avgEligibilityScore: {
              $avg: '$eligibilityScore'
            }
          }
        }
      ]);

      return {
        success: true,
        stats: stats[0] || {
          totalApplications: 0,
          applied: 0,
          shortlisted: 0,
          selected: 0,
          rejected: 0,
          withdrawn: 0,
          eligibleApplications: 0,
          avgEligibilityScore: 0
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch application statistics'
      };
    }
  }

  /**
   * Get applications by company
   * @param {String} companyId - Company ID
   * @param {Object} options - Query options
   * @returns {Object} List of applications
   */
  static async getCompanyApplications(companyId, options = {}) {
    try {
      const {
        page = 1,
        limit = 50,
        status = '',
        sortBy = 'appliedAt',
        sortOrder = 'desc'
      } = options;

      // Get job drives for this company
      const jobDrives = await JobDrive.find({ company: companyId }).select('_id');
      const jobDriveIds = jobDrives.map(jd => jd._id);

      const query = { jobDrive: { $in: jobDriveIds } };
      if (status) {
        query.status = status;
      }

      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const skip = (page - 1) * limit;
      
      const [applications, total] = await Promise.all([
        Application.find(query)
          .populate('student', 'name email')
          .populate({
            path: 'student',
            populate: {
              path: 'profile'
            }
          })
          .populate({
            path: 'jobDrive',
            select: 'title driveDate'
          })
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Application.countDocuments(query)
      ]);

      return {
        success: true,
        applications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch company applications'
      };
    }
  }
}

export { ApplicationService };
export default ApplicationService;
