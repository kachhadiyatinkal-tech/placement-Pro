const CompanySchema = require("../../models/company.model");
const JobSchema = require("../../models/job.model");
const bcrypt = require("bcrypt");
const { isApplicationDeadlinePassed } = require("../../utils/jobDeadline");


const AddCompany = async (req, res) => {
  try {
    const companyName = req.body.companyName;
    const companyDescription = req.body.companyDescription;
    const companyWebsite = req.body.companyWebsite;
    const companyLocation = req.body.companyLocation;
    const companyDifficulty = req.body.companyDifficulty;
    const email = req.body.email;
    const password = req.body.password;

    if (await CompanySchema.findOne({ companyName: companyName })) {
      return res.status(400).json({ msg: "Company Name Already Exist!" })
    }
    if (email && await CompanySchema.findOne({ email })) {
      return res.status(400).json({ msg: "Company Email Already Exist!" })
    }

    const payload = {
      companyName,
      companyDescription,
      companyWebsite,
      companyLocation,
      companyDifficulty
    };
    if (email) payload.email = email;
    if (password) payload.password = await bcrypt.hash(password, 10);

    const newcmp = new CompanySchema(payload);
    await newcmp.save();

    return res.status(201).json({ msg: "Company Created Successfully!", });
  } catch (error) {
    console.log("company.all-company.controller.js = AddCompany => ", error);
    return res.status(500).json({ msg: 'Server Error' });
  }
}


const CompanyDetail = async (req, res) => {
  try {
    if (req.query.companyId) {
      const company = await CompanySchema.findById(req.query.companyId);
      return res.json({ company });
    }
  } catch (error) {
    console.log("company.all-company.controller.js = CompanyDetail => ", error);
    return res.status(500).json({ msg: 'Server Error' });
  }
}

const AllCompanyDetail = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const [companys, totalItems] = await Promise.all([
      CompanySchema.find().skip(skip).limit(limit),
      CompanySchema.countDocuments(),
    ]);

    return res.json({
      companys,
      data: companys,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      totalItems,
    });
  } catch (error) {
    console.log("company.all-company.controller.js = AllCompanyDetail => ", error);
    return res.status(500).json({ msg: 'Server Error' });
  }
}

const DeleteCompany = async (req, res) => {
  try {
    // await CompanySchema.findByIdAndDelete(req.body.companyId);
    const company = await CompanySchema.findById(req.body.companyId);
    // company and related jobs removed
    await company.deleteOne();
    return res.json({ msg: "Company Deleted Successfully!" });
  } catch (error) {
    console.log("company.all-company.controller.js = DeleteCompany => ", error);
    return res.status(500).json({ msg: 'Server Error' });
  }
}

const CompanyMyProfile = async (req, res) => {
  try {
    const companyId = req.user?._id
    const company = await CompanySchema.findById(companyId)
    if (!company) return res.status(404).json({ msg: 'Company not found' })
    return res.json({ company })
  } catch (error) {
    console.log('company.all-company.controller.js = CompanyMyProfile => ', error);
    return res.status(500).json({ msg: 'Server Error' });
  }
}

const UpdateCompanyProfile = async (req, res) => {
  try {
    const companyId = req.user?._id
    const company = await CompanySchema.findById(companyId)
    if (!company) return res.status(404).json({ msg: 'Company not found' })

    const fields = ['companyName', 'companyDescription', 'companyWebsite', 'companyLocation', 'companyDifficulty', 'email']
    fields.forEach((key) => {
      if (typeof req.body[key] === 'string') company[key] = req.body[key]
    })
    await company.save()
    return res.json({ msg: 'Company profile updated', company })
  } catch (error) {
    console.log('company.all-company.controller.js = UpdateCompanyProfile => ', error);
    return res.status(500).json({ msg: 'Server Error' });
  }
}

const UploadCompanyLogo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'No file uploaded.' })
    const companyId = req.user?._id
    const company = await CompanySchema.findById(companyId)
    if (!company) return res.status(404).json({ msg: 'Company not found' })
    company.logo = `/${req.file.fieldname}/${req.file.filename}`
    await company.save()
    return res.json({ msg: 'Company logo updated', logo: company.logo })
  } catch (error) {
    console.log('company.all-company.controller.js = UploadCompanyLogo => ', error);
    return res.status(500).json({ msg: 'Server Error' });
  }
}


const GetMyJobs = async (req, res) => {
  try {
    const companyId = req.user?._id
    if (!companyId) return res.status(401).json({ msg: 'Unauthorized' })
    const jobs = await JobSchema.find({ company: companyId })
      .populate('company', 'companyName companyLocation companyWebsite')
      .lean()
    const data = jobs.map((j) => ({
      ...j,
      applicationClosed: isApplicationDeadlinePassed(j.applicationDeadline),
    }))
    return res.json({ data })
  } catch (error) {
    console.log('company.all-company.controller.js = GetMyJobs => ', error)
    return res.status(500).json({ msg: 'Server Error' })
  }
}

module.exports = {
  AddCompany,
  CompanyDetail,
  AllCompanyDetail,
  DeleteCompany,
  CompanyMyProfile,
  UpdateCompanyProfile,
  UploadCompanyLogo,
  GetMyJobs,
};