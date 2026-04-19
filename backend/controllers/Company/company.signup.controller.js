const Company = require('../../models/company.model')
const bcrypt = require('bcrypt')

/**
 * Public company self-registration (same shape as admin-created companies).
 */
module.exports = async function companySignup(req, res) {
  try {
    const {
      companyName,
      companyDescription,
      companyWebsite,
      companyLocation,
      companyDifficulty,
      email,
      password,
    } = req.body

    if (!companyName || !email || !password) {
      return res.status(400).json({ msg: 'Company name, email, and password are required.' })
    }

    if (await Company.findOne({ companyName: String(companyName).trim() })) {
      return res.status(400).json({ msg: 'A company with this name already exists.' })
    }
    if (await Company.findOne({ email: String(email).trim().toLowerCase() })) {
      return res.status(400).json({ msg: 'This email is already registered.' })
    }

    const hash = await bcrypt.hash(password, 10)

    const company = new Company({
      companyName: String(companyName).trim(),
      companyDescription: companyDescription || '',
      companyWebsite: companyWebsite || '',
      companyLocation: companyLocation || '',
      companyDifficulty: companyDifficulty || 'Moderate',
      email: String(email).trim().toLowerCase(),
      password: hash,
      isActive: false,
      registrationStatus: 'pending',
    })

    await company.save()
    return res.status(201).json({ msg: 'Company registered successfully. You can sign in now.' })
  } catch (error) {
    console.error('company.signup.controller => ', error)
    return res.status(500).json({ msg: 'Server error.' })
  }
}
