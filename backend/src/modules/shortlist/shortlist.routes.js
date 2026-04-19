import express from 'express';
const router = express.Router();
import { ShortlistService } from './shortlist.service.js';
import { body, param, query } from 'express-validator';
import { Shortlist } from './shortlist.model.js';

// Validation middleware
const validateShortlist = [
  body('priority').optional().isIn(['HIGH', 'MEDIUM', 'LOW']).withMessage('Invalid priority'),
  body('interviewRound').optional().isIn(['SCREENING', 'TECHNICAL', 'HR', 'FINAL']).withMessage('Invalid interview round'),
  body('interviewDate').optional().isISO8601().withMessage('Interview date must be a valid date'),
  body('interviewLocation').optional().trim().isLength({ max: 200 }).withMessage('Interview location must be less than 200 characters'),
  body('interviewMode').optional().isIn(['ONSITE', 'REMOTE', 'PHONE', 'VIDEO']).withMessage('Invalid interview mode'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
];

const validateUpdateStatus = [
  body('status').isIn(['INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'SELECTED', 'REJECTED']).withMessage('Invalid status'),
  body('interviewDate').optional().isISO8601().withMessage('Interview date must be a valid date'),
  body('interviewLocation').optional().trim().isLength({ max: 200 }).withMessage('Interview location must be less than 200 characters'),
  body('interviewMode').optional().isIn(['ONSITE', 'REMOTE', 'PHONE', 'VIDEO']).withMessage('Invalid interview mode'),
  body('interviewRound').optional().isIn(['SCREENING', 'TECHNICAL', 'HR', 'FINAL']).withMessage('Invalid interview round'),
  body('priority').optional().isIn(['HIGH', 'MEDIUM', 'LOW']).withMessage('Invalid priority'),
  body('feedback').optional().trim().isLength({ max: 1000 }).withMessage('Feedback must be less than 1000 characters'),
  body('rating.technical').optional().isInt({ min: 1, max: 10 }).withMessage('Technical rating must be between 1 and 10'),
  body('rating.communication').optional().isInt({ min: 1, max: 10 }).withMessage('Communication rating must be between 1 and 10'),
  body('rating.overall').optional().isInt({ min: 1, max: 10 }).withMessage('Overall rating must be between 1 and 10'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
];

const validateInterviewSchedule = [
  body('interviewDate').isISO8601().withMessage('Interview date must be a valid date'),
  body('interviewLocation').optional().trim().isLength({ max: 200 }).withMessage('Interview location must be less than 200 characters'),
  body('interviewMode').optional().isIn(['ONSITE', 'REMOTE', 'PHONE', 'VIDEO']).withMessage('Invalid interview mode'),
  body('interviewRound').optional().isIn(['SCREENING', 'TECHNICAL', 'HR', 'FINAL']).withMessage('Invalid interview round'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
];

const validateBulkShortlist = [
  body('applicationIds').isArray({ min: 1 }).withMessage('Application IDs must be a non-empty array'),
  body('applicationIds.*').isMongoId().withMessage('Invalid application ID format'),
  body('priority').optional().isIn(['HIGH', 'MEDIUM', 'LOW']).withMessage('Invalid priority'),
  body('interviewRound').optional().isIn(['SCREENING', 'TECHNICAL', 'HR', 'FINAL']).withMessage('Invalid interview round'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
];

const validateId = [
  param('id').isMongoId().withMessage('Invalid ID format')
];

const validateQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'SELECTED', 'REJECTED']).withMessage('Invalid status'),
  query('priority').optional().isIn(['HIGH', 'MEDIUM', 'LOW']).withMessage('Invalid priority'),
  query('sortBy').optional().isIn(['shortlistedAt', 'interviewDate', 'priority', 'status']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
];

// Routes

/**
 * POST /shortlist/:applicationId
 * Shortlist a student for a job drive
 */
router.post('/:applicationId', [validateId, validateShortlist], async (req, res) => {
  try {
    const result = await ShortlistService.shortlistStudent(req.params.applicationId, req.user.id, req.body);
    
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
 * GET /shortlist/job/:jobDriveId
 * Get shortlists for a job drive
 */
router.get('/job/:jobDriveId', [param('jobDriveId').isMongoId().withMessage('Invalid job drive ID'), validateQuery], async (req, res) => {
  try {
    const result = await ShortlistService.getJobDriveShortlists(req.params.jobDriveId, req.query);
    
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
 * GET /shortlist/company/:companyId
 * Get shortlists for a company
 */
router.get('/company/:companyId', [param('companyId').isMongoId().withMessage('Invalid company ID'), validateQuery], async (req, res) => {
  try {
    const result = await ShortlistService.getCompanyShortlists(req.params.companyId, req.query);
    
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
 * GET /shortlist/student
 * Get student's shortlists
 */
router.get('/student', validateQuery, async (req, res) => {
  try {
    const result = await ShortlistService.getStudentShortlists(req.user.id, req.query);
    
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
 * PUT /shortlist/:id/status
 * Update shortlist status
 */
router.put('/:id/status', [validateId, validateUpdateStatus], async (req, res) => {
  try {
    const result = await ShortlistService.updateShortlistStatus(
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
 * POST /shortlist/:id/schedule-interview
 * Schedule interview for shortlisted student
 */
router.post('/:id/schedule-interview', [validateId, validateInterviewSchedule], async (req, res) => {
  try {
    const result = await ShortlistService.scheduleInterview(req.params.id, req.body, req.user.id);
    
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
 * POST /shortlist/bulk
 * Bulk shortlist students
 */
router.post('/bulk', validateBulkShortlist, async (req, res) => {
  try {
    const result = await ShortlistService.bulkShortlist(req.body.applicationIds, req.user.id, req.body);
    
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
 * GET /shortlist/:id
 * Get shortlist by ID
 */
router.get('/:id', validateId, async (req, res) => {
  try {
    const shortlist = await Shortlist.findById(req.params.id)
      .populate('student', 'name email')
      .populate({
        path: 'student',
        populate: {
          path: 'profile'
        }
      })
      .populate('application', 'eligibilityScore appliedAt')
      .populate('jobDrive', 'title location package')
      .populate('company', 'name industry')
      .populate('shortlistedBy', 'name email');

    if (!shortlist) {
      return res.status(404).json({
        success: false,
        message: 'Shortlist not found'
      });
    }

    // Check if user owns this shortlist or is recruiter/admin
    if (shortlist.student._id.toString() !== req.user.id && req.user.role === 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      shortlist
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
 * GET /shortlist/stats/job/:jobDriveId
 * Get shortlist statistics for a job drive
 */
router.get('/stats/job/:jobDriveId', [param('jobDriveId').isMongoId().withMessage('Invalid job drive ID')], async (req, res) => {
  try {
    const result = await ShortlistService.getShortlistStats(req.params.jobDriveId);
    
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
 * GET /shortlist/stats/company/:companyId
 * Get shortlist statistics for a company
 */
router.get('/stats/company/:companyId', [param('companyId').isMongoId().withMessage('Invalid company ID')], async (req, res) => {
  try {
    const result = await ShortlistService.getShortlistStats(null, req.params.companyId);
    
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
