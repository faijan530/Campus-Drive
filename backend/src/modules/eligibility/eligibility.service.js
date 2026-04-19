import { Eligibility } from './eligibility.model.js';
import { JobDrive } from '../job/job.model.js';
import { EligibilityEngine } from './eligibility.engine.js';
import { validationResult } from 'express-validator';

class EligibilityService {
  /**
   * Create eligibility criteria for a job drive
   * @param {String} jobDriveId - Job Drive ID
   * @param {Object} eligibilityData - Eligibility criteria
   * @param {String} createdBy - User ID creating the criteria
   * @returns {Object} Created eligibility criteria
   */
  static async createEligibilityCriteria(jobDriveId, eligibilityData, createdBy) {
    try {
      // Validate input
      const errors = validationResult(eligibilityData);
      if (!errors.isEmpty()) {
        throw new Error(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`);
      }

      // Check if job drive exists
      const jobDrive = await JobDrive.findById(jobDriveId);
      if (!jobDrive) {
        throw new Error('Job drive not found');
      }

      // Check if eligibility criteria already exists
      const existingEligibility = await Eligibility.findOne({ jobDrive: jobDriveId });
      if (existingEligibility) {
        throw new Error('Eligibility criteria already exists for this job drive');
      }

      // Validate passing year range
      if (eligibilityData.passingYear) {
        if (eligibilityData.passingYear.from && eligibilityData.passingYear.to) {
          if (eligibilityData.passingYear.from > eligibilityData.passingYear.to) {
            throw new Error('Passing year "from" cannot be greater than "to"');
          }
        }
      }

      // Create eligibility criteria
      const eligibility = new Eligibility({
        jobDrive: jobDriveId,
        ...eligibilityData,
        createdBy
      });

      await eligibility.save();

      // Update job drive with eligibility reference
      jobDrive.eligibility = eligibility._id;
      await jobDrive.save();

      // Populate related data
      await eligibility.populate([
        { path: 'jobDrive', select: 'title' },
        { path: 'createdBy', select: 'name email' }
      ]);

      return {
        success: true,
        message: 'Eligibility criteria created successfully',
        eligibility
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to create eligibility criteria'
      };
    }
  }

  /**
   * Get eligibility criteria by job drive ID
   * @param {String} jobDriveId - Job Drive ID
   * @returns {Object} Eligibility criteria
   */
  static async getEligibilityByJobDrive(jobDriveId) {
    try {
      const eligibility = await Eligibility.findOne({ 
        jobDrive: jobDriveId,
        isActive: true 
      })
        .populate('jobDrive', 'title company')
        .populate('createdBy', 'name email')
        .populate({
          path: 'jobDrive',
          populate: {
            path: 'company',
            select: 'name'
          }
        })
        .lean();

      if (!eligibility) {
        throw new Error('Eligibility criteria not found');
      }

      return {
        success: true,
        eligibility
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch eligibility criteria'
      };
    }
  }

  /**
   * Update eligibility criteria
   * @param {String} eligibilityId - Eligibility ID
   * @param {Object} updateData - Updated eligibility data
   * @param {String} updatedBy - User ID updating the criteria
   * @returns {Object} Updated eligibility criteria
   */
  static async updateEligibilityCriteria(eligibilityId, updateData, updatedBy) {
    try {
      // Validate input
      const errors = validationResult(updateData);
      if (!errors.isEmpty()) {
        throw new Error(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`);
      }

      const eligibility = await Eligibility.findById(eligibilityId);
      if (!eligibility) {
        throw new Error('Eligibility criteria not found');
      }

      // Check if job drive is still open
      const jobDrive = await JobDrive.findById(eligibility.jobDrive);
      if (jobDrive && jobDrive.status === 'CLOSED') {
        throw new Error('Cannot update eligibility criteria for closed job drives');
      }

      // Validate passing year range if provided
      if (updateData.passingYear) {
        if (updateData.passingYear.from && updateData.passingYear.to) {
          if (updateData.passingYear.from > updateData.passingYear.to) {
            throw new Error('Passing year "from" cannot be greater than "to"');
          }
        }
      }

      // Update eligibility criteria
      Object.assign(eligibility, updateData);
      await eligibility.save();

      // Populate updated data
      await eligibility.populate([
        { path: 'jobDrive', select: 'title' },
        { path: 'createdBy', select: 'name email' }
      ]);

      return {
        success: true,
        message: 'Eligibility criteria updated successfully',
        eligibility
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to update eligibility criteria'
      };
    }
  }

  /**
   * Deactivate eligibility criteria
   * @param {String} eligibilityId - Eligibility ID
   * @param {String} deactivatedBy - User ID deactivating the criteria
   * @returns {Object} Deactivation result
   */
  static async deactivateEligibilityCriteria(eligibilityId, deactivatedBy) {
    try {
      const eligibility = await Eligibility.findById(eligibilityId);
      if (!eligibility) {
        throw new Error('Eligibility criteria not found');
      }

      if (!eligibility.isActive) {
        throw new Error('Eligibility criteria is already inactive');
      }

      eligibility.isActive = false;
      await eligibility.save();

      return {
        success: true,
        message: 'Eligibility criteria deactivated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to deactivate eligibility criteria'
      };
    }
  }

  /**
   * Check student eligibility for a job drive
   * @param {String} studentId - Student user ID
   * @param {String} jobDriveId - Job Drive ID
   * @returns {Object} Eligibility check result
   */
  static async checkStudentEligibility(studentId, jobDriveId) {
    try {
      const result = await EligibilityEngine.checkEligibility(studentId, jobDriveId);

      return {
        success: true,
        ...result
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to check eligibility'
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
   * Get eligibility statistics for a job drive
   * @param {String} jobDriveId - Job Drive ID
   * @returns {Object} Eligibility statistics
   */
  static async getEligibilityStats(jobDriveId) {
    try {
      // Get eligibility criteria
      const eligibility = await Eligibility.findOne({ 
        jobDrive: jobDriveId,
        isActive: true 
      });

      if (!eligibility) {
        throw new Error('Eligibility criteria not found');
      }

      // Get eligible students with detailed breakdown
      const eligibleStudents = await EligibilityEngine.getEligibleStudents(jobDriveId, {
        limit: 1000 // Get more for statistics
      });

      // Analyze score distribution
      const scoreRanges = {
        '90-100': 0,
        '80-89': 0,
        '70-79': 0,
        '60-69': 0,
        '50-59': 0,
        'below-50': 0
      };

      eligibleStudents.students.forEach(student => {
        const score = student.eligibility.score;
        if (score >= 90) scoreRanges['90-100']++;
        else if (score >= 80) scoreRanges['80-89']++;
        else if (score >= 70) scoreRanges['70-79']++;
        else if (score >= 60) scoreRanges['60-69']++;
        else if (score >= 50) scoreRanges['50-59']++;
        else scoreRanges['below-50']++;
      });

      // Calculate average score
      const totalScore = eligibleStudents.students.reduce((sum, student) => 
        sum + student.eligibility.score, 0);
      const avgScore = eligibleStudents.students.length > 0 ? 
        Math.round(totalScore / eligibleStudents.students.length) : 0;

      return {
        success: true,
        stats: {
          totalEligible: eligibleStudents.students.length,
          averageScore: avgScore,
          scoreDistribution: scoreRanges,
          criteria: {
            minPercentage: eligibility.minPercentage,
            maxBacklogs: eligibility.maxBacklogs,
            minTestScore: eligibility.minTestScore,
            allowedBranches: eligibility.allowedBranches,
            passingYear: eligibility.passingYear,
            requiredSkills: eligibility.skills
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch eligibility statistics'
      };
    }
  }

  /**
   * Get all eligibility criteria with pagination
   * @param {Object} options - Query options
   * @returns {Object} List of eligibility criteria
   */
  static async getAllEligibilityCriteria(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        isActive = true,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      // Build query
      const query = { isActive };
      
      if (search) {
        query.$or = [
          { allowedBranches: { $in: [new RegExp(search, 'i')] } },
          { skills: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      // Build sort
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query with pagination
      const skip = (page - 1) * limit;
      
      const [eligibilityCriteria, total] = await Promise.all([
        Eligibility.find(query)
          .populate('jobDrive', 'title company')
          .populate({
            path: 'jobDrive',
            populate: {
              path: 'company',
              select: 'name'
            }
          })
          .populate('createdBy', 'name email')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Eligibility.countDocuments(query)
      ]);

      return {
        success: true,
        eligibilityCriteria,
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
        message: error.message || 'Failed to fetch eligibility criteria'
      };
    }
  }

  /**
   * Clone eligibility criteria to another job drive
   * @param {String} sourceEligibilityId - Source eligibility ID
   * @param {String} targetJobDriveId - Target job drive ID
   * @param {String} clonedBy - User ID cloning the criteria
   * @returns {Object} Cloned eligibility criteria
   */
  static async cloneEligibilityCriteria(sourceEligibilityId, targetJobDriveId, clonedBy) {
    try {
      const sourceEligibility = await Eligibility.findById(sourceEligibilityId);
      if (!sourceEligibility) {
        throw new Error('Source eligibility criteria not found');
      }

      // Check if target job drive exists
      const targetJobDrive = await JobDrive.findById(targetJobDriveId);
      if (!targetJobDrive) {
        throw new Error('Target job drive not found');
      }

      // Check if target already has eligibility criteria
      const existingEligibility = await Eligibility.findOne({ jobDrive: targetJobDriveId });
      if (existingEligibility) {
        throw new Error('Target job drive already has eligibility criteria');
      }

      // Create cloned eligibility criteria
      const clonedEligibility = new Eligibility({
        jobDrive: targetJobDriveId,
        minPercentage: sourceEligibility.minPercentage,
        allowedBranches: [...sourceEligibility.allowedBranches],
        maxBacklogs: sourceEligibility.maxBacklogs,
        minTestScore: sourceEligibility.minTestScore,
        educationLevel: sourceEligibility.educationLevel,
        passingYear: sourceEligibility.passingYear ? { ...sourceEligibility.passingYear } : undefined,
        skills: [...sourceEligibility.skills],
        additionalCriteria: sourceEligibility.additionalCriteria,
        createdBy: clonedBy
      });

      await clonedEligibility.save();

      // Update target job drive
      targetJobDrive.eligibility = clonedEligibility._id;
      await targetJobDrive.save();

      // Populate related data
      await clonedEligibility.populate([
        { path: 'jobDrive', select: 'title' },
        { path: 'createdBy', select: 'name email' }
      ]);

      return {
        success: true,
        message: 'Eligibility criteria cloned successfully',
        eligibility: clonedEligibility
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to clone eligibility criteria'
      };
    }
  }
}

export { EligibilityService };
export default EligibilityService;
