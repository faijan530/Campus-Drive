import express from 'express';
const router = express.Router();
import { JobDriveService } from './job.service.js';
import {  body, param, query  } from 'express-validator';

// Validation middleware
const validateJobDrive = [
  body('company').isMongoId().withMessage('Invalid company ID'),
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
  body('description').trim().isLength({ min: 1, max: 2000 }).withMessage('Description must be 1-2000 characters'),
  body('package').isFloat({ min: 0 }).withMessage('Package must be a positive number'),
  body('location').trim().isLength({ min: 1, max: 200 }).withMessage('Location must be 1-200 characters'),
  body('driveDate').isISO8601().withMessage('Drive date must be a valid date'),
  body('lastDateToApply').isISO8601().withMessage('Last date to apply must be a valid date'),
  body('jobType').optional().isIn(['FULL_TIME', 'INTERNSHIP', 'PART_TIME']).withMessage('Invalid job type'),
  body('workMode').optional().isIn(['ONSITE', 'REMOTE', 'HYBRID']).withMessage('Invalid work mode')
];

const validateUpdateJobDrive = [
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
  body('description').optional().trim().isLength({ min: 1, max: 2000 }).withMessage('Description must be 1-2000 characters'),
  body('package').optional().isFloat({ min: 0 }).withMessage('Package must be a positive number'),
  body('location').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Location must be 1-200 characters'),
  body('driveDate').optional().isISO8601().withMessage('Drive date must be a valid date'),
  body('lastDateToApply').optional().isISO8601().withMessage('Last date to apply must be a valid date'),
  body('jobType').optional().isIn(['FULL_TIME', 'INTERNSHIP', 'PART_TIME']).withMessage('Invalid job type'),
  body('workMode').optional().isIn(['ONSITE', 'REMOTE', 'HYBRID']).withMessage('Invalid work mode'),
  body('status').optional().isIn(['OPEN', 'CLOSED', 'DRAFT']).withMessage('Invalid status')
];

const validateId = [
  param('id').isMongoId().withMessage('Invalid ID format')
];

const validateQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim().isLength({ max: 100 }).withMessage('Search term must be less than 100 characters'),
  query('company').optional().isMongoId().withMessage('Invalid company ID'),
  query('status').optional().isIn(['OPEN', 'CLOSED', 'DRAFT']).withMessage('Invalid status'),
  query('jobType').optional().isIn(['FULL_TIME', 'INTERNSHIP', 'PART_TIME']).withMessage('Invalid job type'),
  query('workMode').optional().isIn(['ONSITE', 'REMOTE', 'HYBRID']).withMessage('Invalid work mode'),
  query('sortBy').optional().isIn(['createdAt', 'driveDate', 'lastDateToApply', 'title']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  query('upcoming').optional().isBoolean().withMessage('Upcoming must be boolean'),
  query('closingSoon').optional().isBoolean().withMessage('Closing soon must be boolean')
];

const validateEligibilityQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('minScore').optional().isInt({ min: 0, max: 100 }).withMessage('Min score must be between 0 and 100'),
  query('sortBy').optional().isIn(['score', 'name', 'percentage']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
];

// Routes

/**
 * POST /job
 * Create a new job drive
 */
router.post('/', validateJobDrive, async (req, res) => {
  try {
    const result = await JobDriveService.createJobDrive(req.body, req.user.id);
    
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
 * GET /job
 * Get all job drives with pagination and filters
 */
router.get('/', validateQuery, async (req, res) => {
  try {
    const result = await JobDriveService.getAllJobDrives(req.query);
    
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
 * GET /job/:id
 * Get job drive by ID
 */
router.get('/:id', validateId, async (req, res) => {
  try {
    const result = await JobDriveService.getJobDriveById(req.params.id);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
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
 * PUT /job/:id
 * Update job drive
 */
router.put('/:id', [validateId, validateUpdateJobDrive], async (req, res) => {
  try {
    const result = await JobDriveService.updateJobDrive(req.params.id, req.body, req.user.id);
    
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
 * POST /job/:id/close
 * Close job drive
 */
router.post('/:id/close', validateId, async (req, res) => {
  try {
    const result = await JobDriveService.closeJobDrive(req.params.id, req.user.id);
    
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
 * GET /job/:id/eligible-students
 * Get eligible students for a job drive
 */
router.get('/:id/eligible-students', [validateId, validateEligibilityQuery], async (req, res) => {
  try {
    const result = await JobDriveService.getEligibleStudents(req.params.id, req.query);
    
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
 * GET /company/:companyId/jobs
 * Get job drives for a company
 */
router.get('/company/:companyId', [param('companyId').isMongoId().withMessage('Invalid company ID'), validateQuery], async (req, res) => {
  try {
    const result = await JobDriveService.getCompanyJobDrives(req.params.companyId, req.query);
    
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
