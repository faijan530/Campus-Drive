import express from 'express';
const router = express.Router();
import { CompanyService } from './company.service.js';
import { body, param, query } from 'express-validator';

// Validation middleware
const validateCompany = [
  body('name').trim().isLength({ min: 1, max: 150 }).withMessage('Company name must be 1-150 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('industry').optional().trim().isLength({ max: 100 }).withMessage('Industry must be less than 100 characters'),
  body('website').optional().isURL().withMessage('Website must be a valid URL'),
  body('contactEmail').optional().isEmail().withMessage('Contact email must be valid'),
  body('contactPhone').optional().trim().isLength({ max: 20 }).withMessage('Phone number must be less than 20 characters')
];

const validateUpdateCompany = [
  body('name').optional().trim().isLength({ min: 1, max: 150 }).withMessage('Company name must be 1-150 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('industry').optional().trim().isLength({ max: 100 }).withMessage('Industry must be less than 100 characters'),
  body('website').optional().isURL().withMessage('Website must be a valid URL'),
  body('contactEmail').optional().isEmail().withMessage('Contact email must be valid'),
  body('contactPhone').optional().trim().isLength({ max: 20 }).withMessage('Phone number must be less than 20 characters')
];

const validateId = [
  param('id').isMongoId().withMessage('Invalid ID format')
];

const validateQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim().isLength({ max: 100 }).withMessage('Search term must be less than 100 characters'),
  query('industry').optional().trim().isLength({ max: 100 }).withMessage('Industry filter must be less than 100 characters'),
  query('sortBy').optional().isIn(['name', 'createdAt', 'industry']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
];

// Routes

/**
 * POST /company
 * Create a new company
 */
router.post('/', validateCompany, async (req, res) => {
  try {
    const result = await CompanyService.createCompany(req.body, req.user.id);
    
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
 * GET /company
 * Get all companies with pagination and filters
 */
router.get('/', validateQuery, async (req, res) => {
  try {
    const result = await CompanyService.getAllCompanies(req.query);
    
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
 * GET /company/:id
 * Get company by ID
 */
router.get('/:id', validateId, async (req, res) => {
  try {
    const result = await CompanyService.getCompanyById(req.params.id);
    
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
 * PUT /company/:id
 * Update company details
 */
router.put('/:id', [validateId, validateUpdateCompany], async (req, res) => {
  try {
    const result = await CompanyService.updateCompany(req.params.id, req.body, req.user.id);
    
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
 * DELETE /company/:id
 * Delete/deactivate a company
 */
router.delete('/:id', validateId, async (req, res) => {
  try {
    const result = await CompanyService.deleteCompany(req.params.id, req.user.id);
    
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
 * GET /company/:id/stats
 * Get company statistics
 */
router.get('/:id/stats', validateId, async (req, res) => {
  try {
    const result = await CompanyService.getCompanyStats(req.params.id);
    
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

export { router as companyRoutes };
export default router;
