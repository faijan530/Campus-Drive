import { Shortlist } from './shortlist.model.js';
import { Application } from '../application/application.model.js';
import { validationResult } from 'express-validator';

class ShortlistService {
  /**
   * Shortlist a student for a job drive
   * @param {String} applicationId - Application ID
   * @param {String} shortlistedBy - User ID (recruiter) shortlisting
   * @param {Object} shortlistData - Additional shortlist data
   * @returns {Object} Shortlist result
   */
  static async shortlistStudent(applicationId, shortlistedBy, shortlistData = {}) {
    try {
      // Validate input
      const errors = validationResult(shortlistData);
      if (!errors.isEmpty()) {
        throw new Error(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`);
      }

      // Get application
      const application = await Application.findById(applicationId)
        .populate('student', 'name email')
        .populate('jobDrive')
        .populate({
          path: 'jobDrive',
          populate: {
            path: 'company',
            select: 'name'
          }
        });

      if (!application) {
        throw new Error('Application not found');
      }

      // Check if application is eligible and in correct status
      if (application.status !== 'APPLIED') {
        throw new Error('Can only shortlist applied applications');
      }

      if (!application.isEligible) {
        throw new Error('Cannot shortlist ineligible application');
      }

      // Check if already shortlisted
      const existingShortlist = await Shortlist.findOne({
        application: applicationId
      });

      if (existingShortlist) {
        throw new Error('Application already shortlisted');
      }

      // Create shortlist
      const shortlist = new Shortlist({
        application: applicationId,
        student: application.student._id,
        jobDrive: application.jobDrive._id,
        company: application.jobDrive.company._id,
        shortlistedBy,
        ...shortlistData
      });

      await shortlist.save();

      // Update application status
      application.status = 'SHORTLISTED';
      await application.save();

      // Populate related data
      await shortlist.populate([
        { path: 'student', select: 'name email' },
        { path: 'jobDrive', select: 'title' },
        { path: 'company', select: 'name' },
        { path: 'shortlistedBy', select: 'name email' }
      ]);

      return {
        success: true,
        message: 'Student shortlisted successfully',
        shortlist
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to shortlist student'
      };
    }
  }

  /**
   * Get shortlists for a job drive
   * @param {String} jobDriveId - Job Drive ID
   * @param {Object} options - Query options
   * @returns {Object} List of shortlists
   */
  static async getJobDriveShortlists(jobDriveId, options = {}) {
    try {
      const {
        page = 1,
        limit = 50,
        status = '',
        priority = '',
        sortBy = 'shortlistedAt',
        sortOrder = 'desc'
      } = options;

      const query = { jobDrive: jobDriveId };
      if (status) {
        query.status = status;
      }
      if (priority) {
        query.priority = priority;
      }

      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const skip = (page - 1) * limit;
      
      const [shortlists, total] = await Promise.all([
        Shortlist.find(query)
          .populate('student', 'name email')
          .populate({
            path: 'student',
            populate: {
              path: 'profile'
            }
          })
          .populate('application', 'eligibilityScore appliedAt')
          .populate('shortlistedBy', 'name email')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Shortlist.countDocuments(query)
      ]);

      // Get status statistics
      const statusStats = await Shortlist.aggregate([
        { $match: { jobDrive: new mongoose.Types.ObjectId(jobDriveId) } },
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
        shortlists,
        stats: {
          total: Object.values(stats).reduce((sum, count) => sum + count, 0),
          shortlisted: stats.SHORTLISTED || 0,
          interviewScheduled: stats.INTERVIEW_SCHEDULED || 0,
          interviewCompleted: stats.INTERVIEW_COMPLETED || 0,
          selected: stats.SELECTED || 0,
          rejected: stats.REJECTED || 0
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
        message: error.message || 'Failed to fetch shortlists'
      };
    }
  }

  /**
   * Update shortlist status
   * @param {String} shortlistId - Shortlist ID
   * @param {String} status - New status
   * @param {String} updatedBy - User ID updating the status
   * @param {Object} updateData - Additional update data
   * @returns {Object} Updated shortlist
   */
  static async updateShortlistStatus(shortlistId, status, updatedBy, updateData = {}) {
    try {
      const shortlist = await Shortlist.findById(shortlistId)
        .populate('application');

      if (!shortlist) {
        throw new Error('Shortlist not found');
      }

      // Validate status transitions
      const validTransitions = {
        'SHORTLISTED': ['INTERVIEW_SCHEDULED', 'REJECTED'],
        'INTERVIEW_SCHEDULED': ['INTERVIEW_COMPLETED', 'REJECTED'],
        'INTERVIEW_COMPLETED': ['SELECTED', 'REJECTED'],
        'SELECTED': [], // Terminal state
        'REJECTED': [] // Terminal state
      };

      if (!validTransitions[shortlist.status].includes(status)) {
        throw new Error(`Invalid status transition from ${shortlist.status} to ${status}`);
      }

      // Update shortlist
      shortlist.status = status;
      
      if (updateData.interviewDate) {
        shortlist.interviewDate = new Date(updateData.interviewDate);
      }
      if (updateData.interviewLocation) {
        shortlist.interviewLocation = updateData.interviewLocation;
      }
      if (updateData.interviewMode) {
        shortlist.interviewMode = updateData.interviewMode;
      }
      if (updateData.interviewRound) {
        shortlist.interviewRound = updateData.interviewRound;
      }
      if (updateData.priority) {
        shortlist.priority = updateData.priority;
      }
      if (updateData.feedback) {
        shortlist.feedback = updateData.feedback;
      }
      if (updateData.rating) {
        shortlist.rating = updateData.rating;
      }
      if (updateData.notes) {
        shortlist.notes = updateData.notes;
      }

      await shortlist.save();

      // Update application status if needed
      if (status === 'SELECTED') {
        shortlist.application.status = 'SELECTED';
        await shortlist.application.save();
      } else if (status === 'REJECTED') {
        shortlist.application.status = 'REJECTED';
        await shortlist.application.save();
      }

      // Populate updated data
      await shortlist.populate([
        { path: 'student', select: 'name email' },
        { path: 'jobDrive', select: 'title' },
        { path: 'company', select: 'name' },
        { path: 'application', select: 'eligibilityScore' }
      ]);

      return {
        success: true,
        message: `Shortlist ${status.toLowerCase().replace('_', ' ')} successfully`,
        shortlist
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to update shortlist status'
      };
    }
  }

  /**
   * Schedule interview for shortlisted student
   * @param {String} shortlistId - Shortlist ID
   * @param {Object} interviewData - Interview details
   * @param {String} scheduledBy - User ID scheduling the interview
   * @returns {Object} Updated shortlist
   */
  static async scheduleInterview(shortlistId, interviewData, scheduledBy) {
    try {
      const shortlist = await Shortlist.findById(shortlistId);
      if (!shortlist) {
        throw new Error('Shortlist not found');
      }

      if (shortlist.status !== 'SHORTLISTED') {
        throw new Error('Can only schedule interview for shortlisted candidates');
      }

      // Validate interview date
      const interviewDate = new Date(interviewData.interviewDate);
      if (interviewDate <= new Date()) {
        throw new Error('Interview date must be in the future');
      }

      // Update shortlist with interview details
      shortlist.status = 'INTERVIEW_SCHEDULED';
      shortlist.interviewDate = interviewDate;
      shortlist.interviewLocation = interviewData.interviewLocation;
      shortlist.interviewMode = interviewData.interviewMode || 'VIDEO';
      shortlist.interviewRound = interviewData.interviewRound || 'SCREENING';
      shortlist.notes = interviewData.notes || '';

      await shortlist.save();

      // Populate related data
      await shortlist.populate([
        { path: 'student', select: 'name email' },
        { path: 'jobDrive', select: 'title' },
        { path: 'company', select: 'name' }
      ]);

      return {
        success: true,
        message: 'Interview scheduled successfully',
        shortlist
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to schedule interview'
      };
    }
  }

  /**
   * Get shortlists for a company
   * @param {String} companyId - Company ID
   * @param {Object} options - Query options
   * @returns {Object} List of shortlists
   */
  static async getCompanyShortlists(companyId, options = {}) {
    try {
      const {
        page = 1,
        limit = 50,
        status = '',
        priority = '',
        sortBy = 'shortlistedAt',
        sortOrder = 'desc'
      } = options;

      const query = { company: companyId };
      if (status) {
        query.status = status;
      }
      if (priority) {
        query.priority = priority;
      }

      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const skip = (page - 1) * limit;
      
      const [shortlists, total] = await Promise.all([
        Shortlist.find(query)
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
          .populate('application', 'eligibilityScore')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Shortlist.countDocuments(query)
      ]);

      return {
        success: true,
        shortlists,
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
        message: error.message || 'Failed to fetch company shortlists'
      };
    }
  }

  /**
   * Get student's shortlists
   * @param {String} studentId - Student user ID
   * @param {Object} options - Query options
   * @returns {Object} List of shortlists
   */
  static async getStudentShortlists(studentId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status = '',
        sortBy = 'shortlistedAt',
        sortOrder = 'desc'
      } = options;

      const query = { student: studentId };
      if (status) {
        query.status = status;
      }

      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const skip = (page - 1) * limit;
      
      const [shortlists, total] = await Promise.all([
        Shortlist.find(query)
          .populate('company', 'name industry website')
          .populate('jobDrive', 'title location package driveDate')
          .populate('shortlistedBy', 'name')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Shortlist.countDocuments(query)
      ]);

      return {
        success: true,
        shortlists,
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
        message: error.message || 'Failed to fetch student shortlists'
      };
    }
  }

  /**
   * Get shortlist statistics
   * @param {String} jobDriveId - Job Drive ID (optional)
   * @param {String} companyId - Company ID (optional)
   * @returns {Object} Shortlist statistics
   */
  static async getShortlistStats(jobDriveId = null, companyId = null) {
    try {
      const matchStage = {};
      if (jobDriveId) {
        matchStage.jobDrive = new mongoose.Types.ObjectId(jobDriveId);
      }
      if (companyId) {
        matchStage.company = new mongoose.Types.ObjectId(companyId);
      }

      const stats = await Shortlist.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalShortlists: { $sum: 1 },
            shortlisted: {
              $sum: { $cond: [{ $eq: ['$status', 'SHORTLISTED'] }, 1, 0] }
            },
            interviewScheduled: {
              $sum: { $cond: [{ $eq: ['$status', 'INTERVIEW_SCHEDULED'] }, 1, 0] }
            },
            interviewCompleted: {
              $sum: { $cond: [{ $eq: ['$status', 'INTERVIEW_COMPLETED'] }, 1, 0] }
            },
            selected: {
              $sum: { $cond: [{ $eq: ['$status', 'SELECTED'] }, 1, 0] }
            },
            rejected: {
              $sum: { $cond: [{ $eq: ['$status', 'REJECTED'] }, 1, 0] }
            },
            highPriority: {
              $sum: { $cond: [{ $eq: ['$priority', 'HIGH'] }, 1, 0] }
            }
          }
        }
      ]);

      return {
        success: true,
        stats: stats[0] || {
          totalShortlists: 0,
          shortlisted: 0,
          interviewScheduled: 0,
          interviewCompleted: 0,
          selected: 0,
          rejected: 0,
          highPriority: 0
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch shortlist statistics'
      };
    }
  }

  /**
   * Bulk shortlist students
   * @param {Array} applicationIds - Array of application IDs
   * @param {String} shortlistedBy - User ID shortlisting
   * @param {Object} shortlistData - Common shortlist data
   * @returns {Object} Bulk shortlist result
   */
  static async bulkShortlist(applicationIds, shortlistedBy, shortlistData = {}) {
    try {
      const results = {
        successful: [],
        failed: [],
        total: applicationIds.length
      };

      for (const applicationId of applicationIds) {
        try {
          const result = await this.shortlistStudent(applicationId, shortlistedBy, shortlistData);
          if (result.success) {
            results.successful.push({
              applicationId,
              shortlist: result.shortlist
            });
          } else {
            results.failed.push({
              applicationId,
              error: result.message
            });
          }
        } catch (error) {
          results.failed.push({
            applicationId,
            error: error.message
          });
        }
      }

      return {
        success: true,
        message: `Bulk shortlist completed: ${results.successful.length} successful, ${results.failed.length} failed`,
        results
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to bulk shortlist students'
      };
    }
  }
}

export { ShortlistService };
export default ShortlistService;
