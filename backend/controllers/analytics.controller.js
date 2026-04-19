const Application = require('../models/Application');
const User = require('../models/user.model');
const Job = require('../models/job.model');
const Company = require('../models/company.model');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const mongoose = require('mongoose');

// GET /api/analytics/overview
const getOverview = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    
    // Count distinct students who are selected
    const placedStudents = await Application.distinct('studentId', { status: 'selected' });
    const totalPlacedStudents = placedStudents.length;
    
    const totalCompanies = await Company.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();
    
    // Calculate percentage based on distinct users
    const placementPercentage = totalStudents > 0 ? ((totalPlacedStudents / totalStudents) * 100).toFixed(1) : 0;

    return sendSuccess(res, 200, {
      message: 'Overview data fetched successfully',
      totalStudents,
      totalPlacedStudents,
      totalCompanies,
      totalJobs,
      totalApplications,
      placementPercentage: Number(placementPercentage)
    });
  } catch (error) {
    console.error("analytics.controller.getOverview error: ", error);
    return sendError(res, 500, 'Server error', error);
  }
};

// GET /api/analytics/placement-trends
const getPlacementTrends = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const trendsRaw = await Application.aggregate([
      { 
        $match: { 
          updatedAt: { $gte: sixMonthsAgo }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$updatedAt" } },
          totalApplications: { $sum: 1 },
          placements: { 
            $sum: { $cond: [{ $eq: ["$status", "selected"] }, 1, 0] } 
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format for charting
    const formattedTrends = trendsRaw.map(t => ({
      month: t._id,
      applications: t.totalApplications,
      placements: t.placements
    }));

    return sendSuccess(res, 200, {
      message: 'Trends data fetched successfully',
      trends: formattedTrends
    });
  } catch (error) {
    console.error("analytics.controller.getPlacementTrends error: ", error);
    return sendError(res, 500, 'Server error', error);
  }
};

// GET /api/analytics/company-stats
const getCompanyStats = async (req, res) => {
  try {
    const companyStats = await Application.aggregate([
      // Only count students who were actually selected/hired
      { $match: { status: 'selected' } },
      {
        $lookup: {
          from: 'companys', 
          localField: 'companyId',
          foreignField: '_id',
          as: 'company'
        }
      },
      { $unwind: '$company' },
      {
        $group: {
          _id: '$company.companyName',
          hiredCount: { $sum: 1 }
        }
      },
      { $sort: { hiredCount: -1 } },
      { $limit: 10 }
    ]);

    const formattedStats = companyStats.map(stat => ({
      name: stat._id,
      count: stat.hiredCount
    }));

    return sendSuccess(res, 200, {
      message: 'Company stats fetched successfully',
      stats: formattedStats
    });
  } catch (error) {
    console.error("analytics.controller.getCompanyStats error: ", error);
    return sendError(res, 500, 'Server error', error);
  }
};

// GET /api/analytics/branch-stats
const getBranchStats = async (req, res) => {
  try {
    // We need to count total students per branch, and placed students per branch
    const branchPlacements = await Application.aggregate([
      // Only count students who were actually selected/hired
      { $match: { status: 'selected' } },
      {
        $lookup: {
          from: 'users',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $group: {
          _id: '$student.studentProfile.department',
          placedStudents: { $addToSet: '$studentId' } // distinct students placed per branch
        }
      },
      {
        $project: {
          _id: 1,
          count: { $size: '$placedStudents' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Format for pie chart
    const formattedStats = branchPlacements.map(stat => ({
      name: stat._id || 'General',
      value: stat.count
    }));

    return sendSuccess(res, 200, {
      message: 'Branch stats fetched successfully',
      stats: formattedStats
    });
  } catch (error) {
    console.error("analytics.controller.getBranchStats error: ", error);
    return sendError(res, 500, 'Server error', error);
  }
};

module.exports = {
  getOverview,
  getPlacementTrends,
  getCompanyStats,
  getBranchStats
};
