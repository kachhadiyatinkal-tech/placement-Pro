const User = require('../../models/user.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { sendError, sendSuccess } = require('../../utils/apiResponse')

/** Campus users (single users collection): student, tpo, management, admin, superuser */
const CAMPUS_ROLES = new Set(['student', 'tpo', 'management', 'admin', 'superuser'])

function clientRole(dbRole) {
  if (dbRole === 'superuser') return 'admin'
  return dbRole
}

const Login = async (req, res) => {
  const { email, password } = req.body

  try {
    if (!email || !password) {
      return sendError(res, 400, 'Validation failed', {
        email: !email ? 'Email is required' : undefined,
        password: !password ? 'Password is required' : undefined,
      })
    }

    const user = await User.findOne({ email: String(email).trim() })
    if (!user) return sendError(res, 400, 'Validation failed', { email: "User doesn't exist." })

    if (user.isActive === false) {
      return sendError(res, 403, 'Unauthorized', { account: 'Account is deactivated. Please contact admin.' })
    }

    if (!CAMPUS_ROLES.has(user.role)) {
      return sendError(res, 400, 'Validation failed', { email: 'Use company login for recruiter accounts.' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return sendError(res, 400, 'Validation failed', { password: 'Invalid email or password.' })

    const payload = { userId: user.id }
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' })

    user.token = token
    await user.save()

    return sendSuccess(res, 200, {
      token,
      role: clientRole(user.role),
    })
  } catch (error) {
    console.error('user.login.controller => ', error)
    return sendError(res, 500, 'Internal server error')
  }
}

module.exports = Login
