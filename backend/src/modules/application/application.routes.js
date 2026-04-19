import express from 'express';
const router = express.Router();
import { ApplicationService } from './application.service.js';
import { body, param, query } from 'express-validator';
import { Application } from './application.model.js';

// Validation middleware
const validateApplication = [
  body('resumeUrl').optional().isURL().withMessage('Resume URL must be valid'),
  body('portfolioUrl').optional().isURL().withMessage('Portfolio URL must be valid'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
];

const validateUpdateStatus = [
  body('status').isIn(['SHORTLISTED', 'REJECTED', 'SELECTED']).withMessage('Invalid status'),
  body('recruiterNotes').optional().trim().isLength({ max: 1000 }).withMessage('Recruiter notes must be less than 1000 characters'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
];

const validateId = [
  param('id').isMongoId().withMessage('Invalid ID format')
];

const validateQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['APPLIED', 'SHORTLISTED', 'REJECTED', 'SELECTED', 'WITHDRAWN']).withMessage('Invalid status'),
  query('sortBy').optional().isIn(['appliedAt', 'eligibilityScore', 'status']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  query('minScore').optional().isInt({ min: 0, max: 100 }).withMessage('Min score must be between 0 and 100'),
  query('eligibleOnly').optional().isBoolean().withMessage('eligibleOnly must be boolean')
];

// Routes

/**
 * POST /application/apply/:jobDriveId
 * Apply for a job drive
 */
router.post('/apply/:jobDriveId', [
  param('jobDriveId').isMongoId().withMessage('Invalid job drive ID'),
  validateApplication
], async (req, res) => {
  try {
    const result = await ApplicationService.applyForJob(req.user.id, req.params.jobDriveId, req.body);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * GET /application/student
 * Get student's applications
 */
router.get('/student', validateQuery, async (req, res) => {
  try {
    const result = await ApplicationService.getStudentApplications(req.user.id, req.query);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * GET /application/job/:jobDriveId
 * Get applications for a job drive (for recruiters)
 */
router.get('/job/:jobDriveId', [param('jobDriveId').isMongoId().withMessage('Invalid job drive ID'), validateQuery], async (req, res) => {
  try {
    const result = await ApplicationService.getJobDriveApplications(req.params.jobDriveId, req.query);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * GET /application/company/:companyId
 * Get applications by company
 */
router.get('/company/:companyId', [param('companyId').isMongoId().withMessage('Invalid company ID'), validateQuery], async (req, res) => {
  try {
    const result = await ApplicationService.getCompanyApplications(req.params.companyId, req.query);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * PUT /application/:id/status
 * Update application status (for recruiters)
 */
router.put('/:id/status', [validateId, validateUpdateStatus], async (req, res) => {
  try {
    const result = await ApplicationService.updateApplicationStatus(
      req.params.id, 
      req.body.status, 
      req.user.id, 
      req.body
    );
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * POST /application/:id/withdraw
 * Withdraw application (for students)
 */
router.post('/:id/withdraw', validateId, async (req, res) => {
  try {
    const result = await ApplicationService.withdrawApplication(req.params.id, req.user.id);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * GET /application/:id
 * Get application by ID
 */
router.get('/:id', validateId, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('student', 'name email')
      .populate({
        path: 'student',
        populate: {
          path: 'profile'
        }
      })
      .populate({
        path: 'jobDrive',
        populate: {
          path: 'company',
          select: 'name industry'
        }
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user owns this application or is recruiter/admin
    if (application.student._id.toString() !== req.user.id && req.user.role === 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * GET /application/stats/job/:jobDriveId
 * Get application statistics for a job drive
 */
router.get('/stats/job/:jobDriveId', [param('jobDriveId').isMongoId().withMessage('Invalid job drive ID')], async (req, res) => {
  try {
    const result = await ApplicationService.getApplicationStats(req.params.jobDriveId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * GET /application/stats/student
 * Get application statistics for current student
 */
router.get('/stats/student', async (req, res) => {
  try {
    const result = await ApplicationService.getApplicationStats(null, req.user.id);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

export { router as routes };
export default router;
