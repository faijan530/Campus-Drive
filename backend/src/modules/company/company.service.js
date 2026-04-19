import { Company } from './company.model.js';
import { validationResult } from 'express-validator';
import { JobDrive } from '../job/job.model.js';
import { Application } from '../application/application.model.js';

class CompanyService {
  /**
   * Create a new company
   * @param {Object} companyData - Company details
   * @param {String} createdBy - User ID who is creating the company
   * @returns {Object} Created company
   */
  static async createCompany(companyData, createdBy) {
    try {
      // Validate input
      const errors = validationResult(companyData);
      if (!errors.isEmpty()) {
        throw new Error(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`);
      }

      // Check if company with same name already exists
      const existingCompany = await Company.findOne({ 
        name: companyData.name.trim() 
      });
      
      if (existingCompany) {
        throw new Error('Company with this name already exists');
      }

      // Create company
      const company = new Company({
        ...companyData,
        createdBy
      });

      await company.save();
      
      // Populate creator details
      await company.populate('createdBy', 'name email');

      return {
        success: true,
        message: 'Company created successfully',
        company
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to create company'
      };
    }
  }

  /**
   * Get company by ID
   * @param {String} companyId - Company ID
   * @returns {Object} Company details
   */
  static async getCompanyById(companyId) {
    try {
      const company = await Company.findById(companyId)
        .populate('createdBy', 'name email')
        .lean();

      if (!company) {
        throw new Error('Company not found');
      }

      return {
        success: true,
        company
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch company'
      };
    }
  }

  /**
   * Get all companies with pagination and filters
   * @param {Object} options - Query options
   * @returns {Object} List of companies with pagination
   */
  static async getAllCompanies(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        industry = '',
        isActive = true,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      // Build query
      const query = { isActive };
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      if (industry) {
        query.industry = industry;
      }

      // Build sort
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query with pagination
      const skip = (page - 1) * limit;
      
      const [companies, total] = await Promise.all([
        Company.find(query)
          .populate('createdBy', 'name email')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Company.countDocuments(query)
      ]);

      return {
        success: true,
        companies,
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
        message: error.message || 'Failed to fetch companies'
      };
    }
  }

  /**
   * Update company details
   * @param {String} companyId - Company ID
   * @param {Object} updateData - Updated company data
   * @param {String} updatedBy - User ID updating the company
   * @returns {Object} Updated company
   */
  static async updateCompany(companyId, updateData, updatedBy) {
    try {
      // Validate input
      const errors = validationResult(updateData);
      if (!errors.isEmpty()) {
        throw new Error(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`);
      }

      // Check if company exists
      const company = await Company.findById(companyId);
      if (!company) {
        throw new Error('Company not found');
      }

      // Check for duplicate name if name is being updated
      if (updateData.name && updateData.name.trim() !== company.name) {
        const existingCompany = await Company.findOne({ 
          name: updateData.name.trim(),
          _id: { $ne: companyId }
        });
        
        if (existingCompany) {
          throw new Error('Company with this name already exists');
        }
      }

      // Update company
      Object.assign(company, updateData);
      await company.save();
      
      // Populate updated data
      await company.populate('createdBy', 'name email');

      return {
        success: true,
        message: 'Company updated successfully',
        company
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to update company'
      };
    }
  }

  /**
   * Delete/deactivate a company
   * @param {String} companyId - Company ID
   * @param {String} deletedBy - User ID deleting the company
   * @returns {Object} Deletion result
   */
  static async deleteCompany(companyId, deletedBy) {
    try {
      const company = await Company.findById(companyId);
      if (!company) {
        throw new Error('Company not found');
      }

      // Check if company has active job drives
      const activeJobDrives = await JobDrive.countDocuments({
        company: companyId,
        status: { $in: ['OPEN', 'DRAFT'] }
      });

      if (activeJobDrives > 0) {
        throw new Error('Cannot delete company with active job drives');
      }

      // Soft delete - deactivate instead of removing
      company.isActive = false;
      await company.save();

      return {
        success: true,
        message: 'Company deactivated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to delete company'
      };
    }
  }

  /**
   * Get company statistics
   * @param {String} companyId - Company ID
   * @returns {Object} Company statistics
   */
  static async getCompanyStats(companyId) {
    try {
      const company = await Company.findById(companyId);
      if (!company) {
        throw new Error('Company not found');
      }

      // Get job drive stats
      const jobStats = await JobDrive.aggregate([
        { $match: { company: company._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      // Get application stats
      const applicationStats = await Application.aggregate([
        {
          $lookup: {
            from: 'jobdrives',
            localField: 'jobDrive',
            foreignField: '_id',
            as: 'jobDrive'
          }
        },
        { $unwind: '$jobDrive' },
        { $match: { 'jobDrive.company': company._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      // Format stats
      const jobDriveStats = {};
      jobStats.forEach(stat => {
        jobDriveStats[stat._id] = stat.count;
      });

      const applicationStatsFormatted = {};
      applicationStats.forEach(stat => {
        applicationStatsFormatted[stat._id] = stat.count;
      });

      return {
        success: true,
        stats: {
          company: {
            name: company.name,
            createdAt: company.createdAt,
            isActive: company.isActive
          },
          jobDrives: {
            total: Object.values(jobDriveStats).reduce((sum, count) => sum + count, 0),
            open: jobDriveStats.OPEN || 0,
            closed: jobDriveStats.CLOSED || 0,
            draft: jobDriveStats.DRAFT || 0
          },
          applications: {
            total: Object.values(applicationStatsFormatted).reduce((sum, count) => sum + count, 0),
            applied: applicationStatsFormatted.APPLIED || 0,
            shortlisted: applicationStatsFormatted.SHORTLISTED || 0,
            selected: applicationStatsFormatted.SELECTED || 0,
            rejected: applicationStatsFormatted.REJECTED || 0
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch company statistics'
      };
    }
  }
}

export { CompanyService };
export default CompanyService;
