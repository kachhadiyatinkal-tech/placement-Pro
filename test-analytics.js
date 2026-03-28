const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/placement-Pro').then(async () => {
  const Application = require('./backend/models/Application');
  const User = require('./backend/models/user.model');
  const Job = require('./backend/models/job.model');
  const Company = require('./backend/models/company.model');

  console.log('--- DB STATS ---');
  
  const placed = await Application.countDocuments({ status: 'selected' });
  const applied = await Application.countDocuments({ status: 'applied' });
  console.log(`Placed: ${placed}, Applied: ${applied}`);

  const trends = await Application.aggregate([
    { 
      $match: { 
        status: 'selected'
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
  console.log('Trends:', trends);

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
        from: 'companys',
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
    }
  ]);
  console.log('Company Stats:', companyStats);

  process.exit();
}).catch(console.error);
