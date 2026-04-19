const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const Company = require('../../models/company.model')

// POST /api/v1/company/login
// Body: { email, password }
module.exports = async function companyLogin(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required.' })
    }

    const company = await Company.findOne({
      $or: [{ email }, { companyWebsite: email }]
    })

    if (!company || !company.password) {
      return res.status(401).json({ message: 'Invalid credentials.' })
    }
    if (company.registrationStatus === 'pending') {
      return res.status(403).json({ message: 'Your account is pending approval. Please wait for the admin to verify your registration.' })
    }
    if (company.registrationStatus === 'rejected') {
      return res.status(403).json({ message: 'Your account registration has been rejected. Please contact admin for details.' })
    }
    if (company.isActive === false) {
      return res.status(403).json({ message: 'Company account is deactivated. Please contact admin.' })
    }

    const ok = await bcrypt.compare(password, company.password)
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials.' })
    }

    const payload = {
      userId: company._id,
      role: 'company',
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d',
    })

    // Persist token on the company document if you want auth.middleware to work unchanged
    company.token = token
    await company.save()

    return res.json({
      token,
      company: {
        id: company._id,
        name: company.companyName,
        website: company.companyWebsite,
        logo: company.logo,
      },
    })
  } catch (error) {
    console.error('company.login.controller.js => ', error)
    return res.status(500).json({ message: 'Server error.' })
  }
}

