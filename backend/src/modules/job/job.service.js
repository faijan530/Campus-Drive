import { JobDrive } from './job.model.js';
import { Company } from '../company/company.model.js';
import { Eligibility } from '../eligibility/eligibility.model.js';
import { Application } from '../application/application.model.js';
import { EligibilityEngine } from '../eligibility/eligibility.engine.js';
import { validationResult } from 'express-validator';

class JobDriveService {
  /**
   * Create a new job drive
   * @param {Object} jobData - Job drive details
   * @param {String} createdBy - User ID creating the job drive
   * @returns {Object} Created job drive
   */
  static async createJobDrive(jobData, createdBy) {
    try {
      // Validate input
      const errors = validationResult(jobData);
      if (!errors.isEmpty()) {
        throw new Error(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`);
      }

      // Check if company exists and is active
      const company = await Company.findById(jobData.company);
      if (!company) {
        throw new Error('Company not found');
      }

      if (!company.isActive) {
        throw new Error('Company is not active');
      }

      // Validate dates
      const now = new Date();
      const driveDate = new Date(jobData.driveDate);
      const lastDateToApply = new Date(jobData.lastDateToApply);

      if (lastDateToApply <= now) {
        throw new Error('Last date to apply must be in the future');
      }

      if (driveDate <= lastDateToApply) {
        throw new Error('Drive date must be after last date to apply');
      }

      // Create job drive
      const jobDrive = new JobDrive({
        ...jobData,
        createdBy
      });

      await jobDrive.save();
      
      // Populate related data
      await jobDrive.populate([
        { path: 'company', select: 'name industry' },
        { path: 'createdBy', select: 'name email' }
      ]);

      return {
        success: true,
        message: 'Job drive created successfully',
        jobDrive
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to create job drive'
      };
    }
  }

  /**
   * Get job drive by ID
   * @param {String} jobDriveId - Job Drive ID
   * @returns {Object} Job drive details
   */
  static async getJobDriveById(jobDriveId) {
    try {
      const jobDrive = await JobDrive.findById(jobDriveId)
        .populate('company', 'name industry description website')
        .populate('eligibility')
        .populate('createdBy', 'name email')
        .lean();

      if (!jobDrive) {
        throw new Error('Job drive not found');
      }

      // Get application stats
      const applicationStats = await Application.aggregate([
        { $match: { jobDrive: jobDrive._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const stats = {};
      applicationStats.forEach(stat => {
        stats[stat._id] = stat.count;
      });

      return {
        success: true,
        jobDrive: {
          ...jobDrive,
          stats: {
            totalApplications: Object.values(stats).reduce((sum, count) => sum + count, 0),
            applied: stats.APPLIED || 0,
            shortlisted: stats.SHORTLISTED || 0,
            selected: stats.SELECTED || 0,
            rejected: stats.REJECTED || 0
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch job drive'
      };
    }
  }

  /**
   * Get all job drives with pagination and filters
   * @param {Object} options - Query options
   * @returns {Object} List of job drives with pagination
   */
  static async getAllJobDrives(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        company = '',
        status = '',
        jobType = '',
        workMode = '',
        sortBy = 'createdAt',
        sortOrder = 'desc',
        upcoming = false,
        closingSoon = false
      } = options;

      // Build query
      const query = {};
      
      if (status) {
        query.status = status;
      }

      if (company) {
        query.company = company;
      }

      if (jobType) {
        query.jobType = jobType;
      }

      if (workMode) {
        query.workMode = workMode;
      }

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } }
        ];
      }

      if (upcoming) {
        query.driveDate = { $gte: new Date() };
        query.status = 'OPEN';
      }

      if (closingSoon) {
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        query.lastDateToApply = { 
          $gte: new Date(),
          $lte: threeDaysFromNow
        };
        query.status = 'OPEN';
      }

      // Build sort
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query with pagination
      const skip = (page - 1) * limit;
      
      const [jobDrives, total] = await Promise.all([
        JobDrive.find(query)
          .populate('company', 'name industry')
          .populate('createdBy', 'name email')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        JobDrive.countDocuments(query)
      ]);

      return {
        success: true,
        jobDrives,
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
        message: error.message || 'Failed to fetch job drives'
      };
    }
  }

  /**
   * Update job drive
   * @param {String} jobDriveId - Job Drive ID
   * @param {Object} updateData - Updated job drive data
   * @param {String} updatedBy - User ID updating the job drive
   * @returns {Object} Updated job drive
   */
  static async updateJobDrive(jobDriveId, updateData, updatedBy) {
    try {
      // Validate input
      const errors = validationResult(updateData);
      if (!errors.isEmpty()) {
        throw new Error(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`);
      }

      const jobDrive = await JobDrive.findById(jobDriveId);
      if (!jobDrive) {
        throw new Error('Job drive not found');
      }

      // Check if job can be updated (not closed)
      if (jobDrive.status === 'CLOSED') {
        throw new Error('Cannot update a closed job drive');
      }

      // Validate dates if they're being updated
      if (updateData.driveDate || updateData.lastDateToApply) {
        const now = new Date();
        const driveDate = new Date(updateData.driveDate || jobDrive.driveDate);
        const lastDateToApply = new Date(updateData.lastDateToApply || jobDrive.lastDateToApply);

        if (lastDateToApply <= now) {
          throw new Error('Last date to apply must be in the future');
        }

        if (driveDate <= lastDateToApply) {
          throw new Error('Drive date must be after last date to apply');
        }
      }

      // Update job drive
      Object.assign(jobDrive, updateData);
      await jobDrive.save();
      
      // Populate updated data
      await jobDrive.populate([
        { path: 'company', select: 'name industry' },
        { path: 'createdBy', select: 'name email' }
      ]);

      return {
        success: true,
        message: 'Job drive updated successfully',
        jobDrive
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to update job drive'
      };
    }
  }

  /**
   * Close job drive
   * @param {String} jobDriveId - Job Drive ID
   * @param {String} closedBy - User ID closing the job drive
   * @returns {Object} Closure result
   */
  static async closeJobDrive(jobDriveId, closedBy) {
    try {
      const jobDrive = await JobDrive.findById(jobDriveId);
      if (!jobDrive) {
        throw new Error('Job drive not found');
      }

      if (jobDrive.status === 'CLOSED') {
        throw new Error('Job drive is already closed');
      }

      jobDrive.status = 'CLOSED';
      await jobDrive.save();

      return {
        success: true,
        message: 'Job drive closed successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to close job drive'
      };
    }
  }

  /**
   * Get eligible students for a job drive
   * @param {String} jobDriveId - Job Drive ID
   * @param {Object} options - Query options
   * @returns {Object} List of eligible students
   */
  static async getEligibleStudents(jobDriveId, options = {}) {
    try {
      const jobDrive = await JobDrive.findById(jobDriveId);
      if (!jobDrive) {
        throw new Error('Job drive not found');
      }

      const result = await EligibilityEngine.getEligibleStudents(jobDriveId, options);

      return {
        success: true,
        ...result
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch eligible students'
      };
    }
  }

  /**
   * Get job drives for a company
   * @param {String} companyId - Company ID
   * @param {Object} options - Query options
   * @returns {Object} List of job drives
   */
  static async getCompanyJobDrives(companyId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status = '',
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      const query = { company: companyId };
      if (status) {
        query.status = status;
      }

      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const skip = (page - 1) * limit;
      
      const [jobDrives, total] = await Promise.all([
        JobDrive.find(query)
          .populate('eligibility')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        JobDrive.countDocuments(query)
      ]);

      // Get application stats for each job drive
      const jobDriveIds = jobDrives.map(jd => jd._id);
      const applicationStats = await Application.aggregate([
        { $match: { jobDrive: { $in: jobDriveIds } } },
        {
          $group: {
            _id: '$jobDrive',
            totalApplications: { $sum: 1 },
            applied: {
              $sum: { $cond: [{ $eq: ['$status', 'APPLIED'] }, 1, 0] }
            },
            shortlisted: {
              $sum: { $cond: [{ $eq: ['$status', 'SHORTLISTED'] }, 1, 0] }
            },
            selected: {
              $sum: { $cond: [{ $eq: ['$status', 'SELECTED'] }, 1, 0] }
            }
          }
        }
      ]);

      // Merge stats with job drives
      const statsMap = {};
      applicationStats.forEach(stat => {
        statsMap[stat._id.toString()] = stat;
      });

      const jobDrivesWithStats = jobDrives.map(jd => ({
        ...jd,
        stats: statsMap[jd._id.toString()] || {
          totalApplications: 0,
          applied: 0,
          shortlisted: 0,
          selected: 0
        }
      }));

      return {
        success: true,
        jobDrives: jobDrivesWithStats,
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
        message: error.message || 'Failed to fetch company job drives'
      };
    }
  }
}

export { JobDriveService };
export default JobDriveService;
