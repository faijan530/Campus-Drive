import { User } from '../../models/User.js';
import { Eligibility } from '../eligibility/eligibility.model.js';
import { Application } from '../application/application.model.js';
import { Result } from '../result/result.model.js';

class EligibilityEngine {
  /**
   * Check if a student is eligible for a job drive
   * @param {String} studentId - Student user ID
   * @param {String} jobDriveId - Job Drive ID
   * @returns {Object} Eligibility result with score and details
   */
  static async checkEligibility(studentId, jobDriveId) {
    try {
      // Get student profile and test results
      const student = await User.findById(studentId).populate('profile');
      if (!student) {
        throw new Error('Student not found');
      }

      // Get eligibility criteria
      const eligibility = await Eligibility.findOne({ 
        jobDrive: jobDriveId, 
        isActive: true 
      }).populate('jobDrive');
      
      if (!eligibility) {
        throw new Error('Eligibility criteria not found');
      }

      // Check if already applied
      const existingApplication = await Application.findOne({
        student: studentId,
        jobDrive: jobDriveId
      });

      if (existingApplication) {
        return {
          isEligible: false,
          reason: 'Already applied for this job drive',
          score: 0,
          details: {
            alreadyApplied: true
          }
        };
      }

      // Calculate eligibility score and check criteria
      const result = await this.calculateEligibilityScore(student, eligibility);
      
      return result;
    } catch (error) {
      throw new Error(`Eligibility check failed: ${error.message}`);
    }
  }

  /**
   * Calculate eligibility score based on student profile and criteria
   * @param {Object} student - Student user object with populated profile
   * @param {Object} eligibility - Eligibility criteria object
   * @returns {Object} Eligibility result with score and breakdown
   */
  static async calculateEligibilityScore(student, eligibility) {
    const profile = student.profile;
    const scoreBreakdown = {
      percentage: 0,
      backlogs: 0,
      testScore: 0,
      branch: 0,
      passingYear: 0,
      skills: 0,
      educationLevel: 0
    };

    let totalScore = 0;
    let maxScore = 0;
    let isEligible = true;
    const ineligibilityReasons = [];

    // 1. Percentage Check (Weight: 30%)
    maxScore += 30;
    if (profile?.academic?.cgpa) {
      const percentage = this.cgpaToPercentage(profile.academic.cgpa);
      if (percentage >= eligibility.minPercentage) {
        scoreBreakdown.percentage = Math.min(30, (percentage / eligibility.minPercentage) * 25);
      } else {
        isEligible = false;
        ineligibilityReasons.push(`CGPA/Percentage below minimum requirement (${eligibility.minPercentage}%)`);
      }
    } else {
      isEligible = false;
      ineligibilityReasons.push('Academic information not available');
    }

    // 2. Backlogs Check (Weight: 20%)
    maxScore += 20;
    const studentBacklogs = profile?.academic?.backlogs || 0;
    if (studentBacklogs <= eligibility.maxBacklogs) {
      scoreBreakdown.backlogs = eligibility.maxBacklogs === 0 ? 20 : 
        Math.max(0, 20 - (studentBacklogs / eligibility.maxBacklogs) * 20);
    } else {
      isEligible = false;
      ineligibilityReasons.push(`Backlogs exceed maximum allowed (${eligibility.maxBacklogs})`);
    }

    // 3. Test Score Check (Weight: 25%)
    maxScore += 25;
    if (eligibility.minTestScore) {
      // Get student's latest test score
      const testResult = await this.getStudentTestScore(student._id);
      if (testResult && testResult.score >= eligibility.minTestScore) {
        scoreBreakdown.testScore = Math.min(25, (testResult.score / eligibility.minTestScore) * 20);
      } else {
        isEligible = false;
        ineligibilityReasons.push(`Test score below minimum requirement (${eligibility.minTestScore})`);
      }
    } else {
      scoreBreakdown.testScore = 25; // Full marks if no test requirement
    }

    // 4. Branch Check (Weight: 15%)
    maxScore += 15;
    if (eligibility.allowedBranches.length > 0) {
      const studentBranch = profile?.academic?.department;
      if (studentBranch && eligibility.allowedBranches.includes(studentBranch)) {
        scoreBreakdown.branch = 15;
      } else {
        isEligible = false;
        ineligibilityReasons.push(`Branch not in allowed list: ${eligibility.allowedBranches.join(', ')}`);
      }
    } else {
      scoreBreakdown.branch = 15; // Full marks if no branch restriction
    }

    // 5. Passing Year Check (Weight: 10%)
    maxScore += 10;
    if (eligibility.passingYear.from && eligibility.passingYear.to) {
      const studentPassingYear = profile?.academic?.batchYear;
      if (studentPassingYear && 
          studentPassingYear >= eligibility.passingYear.from && 
          studentPassingYear <= eligibility.passingYear.to) {
        scoreBreakdown.passingYear = 10;
      } else {
        isEligible = false;
        ineligibilityReasons.push(`Passing year not in range: ${eligibility.passingYear.from}-${eligibility.passingYear.to}`);
      }
    } else {
      scoreBreakdown.passingYear = 10; // Full marks if no passing year restriction
    }

    // 6. Skills Match (Weight: Optional, up to 10% bonus)
    if (eligibility.skills.length > 0) {
      maxScore += 10;
      const studentSkills = await this.getStudentSkills(student._id);
      const matchingSkills = studentSkills.filter(skill => 
        eligibility.skills.includes(skill)
      );
      scoreBreakdown.skills = (matchingSkills.length / eligibility.skills.length) * 10;
    }

    totalScore = Object.values(scoreBreakdown).reduce((sum, score) => sum + score, 0);
    const finalScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    return {
      isEligible,
      score: finalScore,
      maxScore: 100,
      breakdown: scoreBreakdown,
      ineligibilityReasons,
      details: {
        studentPercentage: profile?.academic?.cgpa ? this.cgpaToPercentage(profile.academic.cgpa) : null,
        studentBacklogs,
        studentBranch: profile?.academic?.department,
        studentPassingYear: profile?.academic?.batchYear,
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
  }

  /**
   * Get all eligible students for a job drive
   * @param {String} jobDriveId - Job Drive ID
   * @param {Object} options - Query options (pagination, filters)
   * @returns {Object} List of eligible students with scores
   */
  static async getEligibleStudents(jobDriveId, options = {}) {
    try {
      const {
        page = 1,
        limit = 50,
        sortBy = 'score',
        sortOrder = 'desc',
        minScore = 0
      } = options;

      // Get all students
      const students = await User.find({ 
        role: 'student',
        isActive: true 
      }).populate('profile');

      const eligibility = await Eligibility.findOne({ 
        jobDrive: jobDriveId, 
        isActive: true 
      });

      if (!eligibility) {
        throw new Error('Eligibility criteria not found for this job drive');
      }

      // Check eligibility for each student
      const eligibleStudents = [];
      for (const student of students) {
        const result = await this.calculateEligibilityScore(student, eligibility);
        
        if (result.isEligible && result.score >= minScore) {
          eligibleStudents.push({
            student: {
              id: student._id,
              name: student.name,
              email: student.email,
              profile: student.profile
            },
            eligibility: result
          });
        }
      }

      // Sort results
      eligibleStudents.sort((a, b) => {
        if (sortOrder === 'desc') {
          return b.eligibility.score - a.eligibility.score;
        }
        return a.eligibility.score - b.eligibility.score;
      });

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedResults = eligibleStudents.slice(startIndex, endIndex);

      return {
        students: paginatedResults,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: eligibleStudents.length,
          pages: Math.ceil(eligibleStudents.length / limit)
        },
        criteria: eligibility
      };
    } catch (error) {
      throw new Error(`Failed to get eligible students: ${error.message}`);
    }
  }

  /**
   * Convert CGPA to percentage (assuming 10-point scale)
   * @param {Number} cgpa - CGPA value
   * @returns {Number} Percentage equivalent
   */
  static cgpaToPercentage(cgpa) {
    return Math.round(cgpa * 10); // Simple conversion: CGPA * 10 = Percentage
  }

  /**
   * Get student's latest test score
   * @param {String} studentId - Student ID
   * @returns {Object|null} Test result object
   */
  static async getStudentTestScore(studentId) {
    try {
      // This would integrate with your existing test/result system
      const latestResult = await Result.findOne({ student: studentId })
        .sort({ createdAt: -1 })
        .lean();
      
      return latestResult ? {
        score: latestResult.score || 0,
        totalQuestions: latestResult.totalQuestions || 100,
        percentage: latestResult.scorePercent || 0
      } : null;
    } catch (error) {
      console.error('Error fetching test score:', error);
      return null;
    }
  }

  /**
   * Get student's skills
   * @param {String} studentId - Student ID
   * @returns {Array} Array of skill names
   */
  static async getStudentSkills(studentId) {
    try {
      // This would integrate with your existing skills system
      const skills = await require('../../models/skill.model').find({ 
        student: studentId 
      }).lean();
      
      return skills.map(skill => skill.name);
    } catch (error) {
      console.error('Error fetching student skills:', error);
      return [];
    }
  }
}

export { EligibilityEngine };
export default EligibilityEngine;
