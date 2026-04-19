import express from 'express';
const router = express.Router();
import { EligibilityService } from './eligibility.service.js';
import {  body, param, query  } from 'express-validator';

// Validation middleware
const validateEligibility = [
  body('minPercentage').isFloat({ min: 0, max: 100 }).withMessage('Min percentage must be between 0 and 100'),
  body('allowedBranches').isArray().withMessage('Allowed branches must be an array'),
  body('allowedBranches.*').trim().isLength({ min: 1 }).withMessage('Branch name cannot be empty'),
  body('maxBacklogs').isInt({ min: 0 }).withMessage('Max backlogs must be a non-negative integer'),
  body('minTestScore').optional().isInt({ min: 0 }).withMessage('Min test score must be a non-negative integer'),
  body('educationLevel').optional().isIn(['BACHELOR', 'MASTER', 'DIPLOMA', 'PHD']).withMessage('Invalid education level'),
  body('passingYear.from').optional().isInt({ min: 2000 }).withMessage('Passing year from must be >= 2000'),
  body('passingYear.to').optional().isInt({ min: 2000 }).withMessage('Passing year to must be >= 2000'),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('skills.*').optional().trim().isLength({ min: 1 }).withMessage('Skill name cannot be empty'),
  body('additionalCriteria').optional().trim().isLength({ max: 500 }).withMessage('Additional criteria must be less than 500 characters')
];

const validateUpdateEligibility = [
  body('minPercentage').optional().isFloat({ min: 0, max: 100 }).withMessage('Min percentage must be between 0 and 100'),
  body('allowedBranches').optional().isArray().withMessage('Allowed branches must be an array'),
  body('allowedBranches.*').optional().trim().isLength({ min: 1 }).withMessage('Branch name cannot be empty'),
  body('maxBacklogs').optional().isInt({ min: 0 }).withMessage('Max backlogs must be a non-negative integer'),
  body('minTestScore').optional().isInt({ min: 0 }).withMessage('Min test score must be a non-negative integer'),
  body('educationLevel').optional().isIn(['BACHELOR', 'MASTER', 'DIPLOMA', 'PHD']).withMessage('Invalid education level'),
  body('passingYear.from').optional().isInt({ min: 2000 }).withMessage('Passing year from must be >= 2000'),
  body('passingYear.to').optional().isInt({ min: 2000 }).withMessage('Passing year to must be >= 2000'),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('skills.*').optional().trim().isLength({ min: 1 }).withMessage('Skill name cannot be empty'),
  body('additionalCriteria').optional().trim().isLength({ max: 500 }).withMessage('Additional criteria must be less than 500 characters')
];

const validateId = [
  param('id').isMongoId().withMessage('Invalid ID format')
];

const validateQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim().isLength({ max: 100 }).withMessage('Search term must be less than 100 characters'),
  query('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  query('sortBy').optional().isIn(['createdAt', 'minPercentage', 'maxBacklogs']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
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
 * POST /eligibility/:jobDriveId
 * Create eligibility criteria for a job drive
 */
router.post('/:jobDriveId', [param('jobDriveId').isMongoId().withMessage('Invalid job drive ID'), validateEligibility], async (req, res) => {
  try {
    const result = await EligibilityService.createEligibilityCriteria(req.params.jobDriveId, req.body, req.user.id);
    
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
 * GET /eligibility
 * Get all eligibility criteria with pagination
 */
router.get('/', validateQuery, async (req, res) => {
  try {
    const result = await EligibilityService.getAllEligibilityCriteria(req.query);
    
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
 * GET /eligibility/job/:jobDriveId
 * Get eligibility criteria by job drive ID
 */
router.get('/job/:jobDriveId', [param('jobDriveId').isMongoId().withMessage('Invalid job drive ID')], async (req, res) => {
  try {
    const result = await EligibilityService.getEligibilityByJobDrive(req.params.jobDriveId);
    
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
 * PUT /eligibility/:id
 * Update eligibility criteria
 */
router.put('/:id', [validateId, validateUpdateEligibility], async (req, res) => {
  try {
    const result = await EligibilityService.updateEligibilityCriteria(req.params.id, req.body, req.user.id);
    
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
 * DELETE /eligibility/:id
 * Deactivate eligibility criteria
 */
router.delete('/:id', validateId, async (req, res) => {
  try {
    const result = await EligibilityService.deactivateEligibilityCriteria(req.params.id, req.user.id);
    
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
 * POST /eligibility/check/:jobDriveId
 * Check student eligibility for a job drive
 */
router.post('/check/:jobDriveId', [param('jobDriveId').isMongoId().withMessage('Invalid job drive ID'), body('studentId').isMongoId().withMessage('Invalid student ID')], async (req, res) => {
  try {
    const result = await EligibilityService.checkStudentEligibility(req.body.studentId, req.params.jobDriveId);
    
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
 * GET /eligibility/:jobDriveId/eligible-students
 * Get eligible students for a job drive
 */
router.get('/:jobDriveId/eligible-students', [param('jobDriveId').isMongoId().withMessage('Invalid job drive ID'), validateEligibilityQuery], async (req, res) => {
  try {
    const result = await EligibilityService.getEligibleStudents(req.params.jobDriveId, req.query);
    
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
 * GET /eligibility/:jobDriveId/stats
 * Get eligibility statistics for a job drive
 */
router.get('/:jobDriveId/stats', [param('jobDriveId').isMongoId().withMessage('Invalid job drive ID')], async (req, res) => {
  try {
    const result = await EligibilityService.getEligibilityStats(req.params.jobDriveId);
    
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
 * POST /eligibility/:sourceId/clone/:targetJobDriveId
 * Clone eligibility criteria to another job drive
 */
router.post('/:sourceId/clone/:targetJobDriveId', [
  param('sourceId').isMongoId().withMessage('Invalid source eligibility ID'),
  param('targetJobDriveId').isMongoId().withMessage('Invalid target job drive ID')
], async (req, res) => {
  try {
    const result = await EligibilityService.cloneEligibilityCriteria(req.params.sourceId, req.params.targetJobDriveId, req.user.id);
    
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

export { router as routes };
export default router;
