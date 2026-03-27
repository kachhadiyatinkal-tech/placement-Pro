const User = require('../../models/user.model');
const Company = require('../../models/company.model');

const setUserActiveStatus = async (req, res) => {
  try {
    const { userId, email, isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ msg: 'isActive boolean is required.' });
    }
    if (!userId && !email) {
      return res.status(400).json({ msg: 'userId or email is required.' });
    }

    const query = userId ? { _id: userId } : { email };
    const user = await User.findOneAndUpdate(query, { isActive }, { new: true });
    if (!user) return res.status(404).json({ msg: 'User not found.' });

    return res.json({
      msg: `User ${isActive ? 'activated' : 'deactivated'} successfully.`,
      user,
    });
  } catch (error) {
    console.log('user-status.controller.js setUserActiveStatus => ', error);
    return res.status(500).json({ msg: 'Internal Server Error!' });
  }
};

const setCompanyActiveStatus = async (req, res) => {
  try {
    const { companyId, isActive } = req.body;
    if (!companyId) return res.status(400).json({ msg: 'companyId is required.' });
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ msg: 'isActive boolean is required.' });
    }

    const company = await Company.findByIdAndUpdate(companyId, { isActive }, { new: true });
    if (!company) return res.status(404).json({ msg: 'Company not found.' });

    return res.json({
      msg: `Company ${isActive ? 'activated' : 'deactivated'} successfully.`,
      company,
    });
  } catch (error) {
    console.log('user-status.controller.js setCompanyActiveStatus => ', error);
    return res.status(500).json({ msg: 'Internal Server Error!' });
  }
};

const updateUserDetails = async (req, res) => {
  try {
    const { userId, email, first_name, middle_name, last_name, number, gender, position } = req.body;
    if (!userId && !email) return res.status(400).json({ msg: 'userId or email is required.' });
    const query = userId ? { _id: userId } : { email };
    const user = await User.findOne(query);
    if (!user) return res.status(404).json({ msg: 'User not found.' });

    if (typeof first_name === 'string') user.first_name = first_name;
    if (typeof middle_name === 'string') user.middle_name = middle_name;
    if (typeof last_name === 'string') user.last_name = last_name;
    if (typeof email === 'string' && email.trim()) user.email = email.trim();
    if (number !== undefined) user.number = number;
    if (typeof gender === 'string') user.gender = gender;
    if (typeof position === 'string') {
      if (user.role === 'tpo') {
        user.tpoProfile = user.tpoProfile || {};
        user.tpoProfile.position = position;
      }
      if (user.role === 'management') {
        user.managementProfile = user.managementProfile || {};
        user.managementProfile.position = position;
      }
    }
    await user.save();
    return res.json({ msg: 'User updated successfully.', user });
  } catch (error) {
    console.log('user-status.controller.js updateUserDetails => ', error);
    return res.status(500).json({ msg: 'Internal Server Error!' });
  }
};

const updateCompanyDetails = async (req, res) => {
  try {
    const { companyId, companyName, companyDescription, companyWebsite, companyLocation, companyDifficulty, email } = req.body;
    if (!companyId) return res.status(400).json({ msg: 'companyId is required.' });
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ msg: 'Company not found.' });

    if (typeof companyName === 'string') company.companyName = companyName;
    if (typeof companyDescription === 'string') company.companyDescription = companyDescription;
    if (typeof companyWebsite === 'string') company.companyWebsite = companyWebsite;
    if (typeof companyLocation === 'string') company.companyLocation = companyLocation;
    if (typeof companyDifficulty === 'string') company.companyDifficulty = companyDifficulty;
    if (typeof email === 'string') company.email = email;

    await company.save();
    return res.json({ msg: 'Company updated successfully.', company });
  } catch (error) {
    console.log('user-status.controller.js updateCompanyDetails => ', error);
    return res.status(500).json({ msg: 'Internal Server Error!' });
  }
};

module.exports = {
  setUserActiveStatus,
  setCompanyActiveStatus,
  updateUserDetails,
  updateCompanyDetails,
};
