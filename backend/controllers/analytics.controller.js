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
    
    // Calculate percentage based on distinct users
    const placementPercentage = totalStudents > 0 ? ((totalPlacedStudents / totalStudents) * 100).toFixed(1) : 0;

    return sendSuccess(res, 200, {
      message: 'Overview data fetched successfully',
      totalStudents,
      totalPlacedStudents,
      totalCompanies,
      totalJobs,
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

    const trends = await Application.aggregate([
      { 
        $match: { 
          status: 'selected',
          updatedAt: { $gte: sixMonthsAgo }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$updatedAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format for charting
    const formattedTrends = trends.map(t => ({
      month: t._id,
      placements: t.count
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
      { $match: { status: 'selected' } },
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' },
      {
        $lookup: {
          from: 'companys', // note: schema uses 'companys' as collection name
          localField: 'job.company',
          foreignField: '_id',
          as: 'company'
        }
      },
      { $unwind: '$company' },
      {
        $group: {
          _id: '$company.companyName',
          hiringCount: { $sum: 1 }
        }
      },
      { $sort: { hiringCount: -1 } },
      { $limit: 10 }
    ]);

    const formattedStats = companyStats.map(stat => ({
      name: stat._id,
      count: stat.hiringCount
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
          placedCount: { $addToSet: '$studentId' } // distinct placed students per branch
        }
      },
      {
        $project: {
          _id: 1,
          count: { $size: '$placedCount' }
        }
      }
    ]);

    // Just format it nicely for the pie chart
    const formattedStats = branchPlacements.map(stat => ({
      name: stat._id || 'Unknown',
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
