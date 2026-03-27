const User = require('../../models/user.model')
const { sendError, sendSuccess } = require('../../utils/apiResponse')

/** Authenticated user updates their own document only. */
const UpdateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) return sendError(res, 400, 'Validation failed', { user: "User doesn't exist." })

    const body = req.body || {}
    const nextEmail = body.email != null ? String(body.email).trim() : null
    if (nextEmail && nextEmail !== user.email) {
      const taken = await User.findOne({ email: nextEmail })
      if (taken) {
        return sendError(res, 400, 'Validation failed', { email: 'Email is already in use. Please choose another.' })
      }
      user.email = nextEmail
    }

    const spIn = body.studentProfile
    if (spIn?.UIN) {
      const uin = String(spIn.UIN).trim()
      const clash = await User.findOne({
        'studentProfile.UIN': uin,
        _id: { $ne: user._id },
      })
      if (clash) {
        return sendError(res, 400, 'Validation failed', { UIN: 'This UIN is already registered.' })
      }
    }

    if (body.first_name != null) user.first_name = body.first_name
    if (body.middle_name != null) user.middle_name = body.middle_name
    if (body.last_name != null) user.last_name = body.last_name
    if (body.number !== undefined) user.number = body.number === '' ? undefined : Number(body.number)
    if (body.gender) user.gender = body.gender
    if (body.dateOfBirth) user.dateOfBirth = new Date(body.dateOfBirth)

    if (body.fullAddress) {
      if (body.fullAddress.address != null) user.fullAddress.address = body.fullAddress.address
      if (body.fullAddress.pincode !== undefined && body.fullAddress.pincode !== '') {
        user.fullAddress.pincode = Number(body.fullAddress.pincode)
      }
    }

    if (user.role === 'tpo' && body.tpoProfile?.position != null) {
      user.tpoProfile = user.tpoProfile || {}
      user.tpoProfile.position = body.tpoProfile.position
    }
    if (user.role === 'management' && body.managementProfile?.position != null) {
      user.managementProfile = user.managementProfile || {}
      user.managementProfile.position = body.managementProfile.position
    }
    if ((user.role === 'admin' || user.role === 'superuser') && body.managementProfile?.position != null) {
      user.managementProfile = user.managementProfile || {}
      user.managementProfile.position = body.managementProfile.position
    }

    if (user.role === 'student' && spIn) {
      user.studentProfile = user.studentProfile || {}
      user.studentProfile.SGPA = user.studentProfile.SGPA || {}
      user.studentProfile.pastQualification = user.studentProfile.pastQualification || {}
      user.studentProfile.pastQualification.ssc = user.studentProfile.pastQualification.ssc || {}
      user.studentProfile.pastQualification.hsc = user.studentProfile.pastQualification.hsc || {}
      user.studentProfile.pastQualification.diploma = user.studentProfile.pastQualification.diploma || {}

      if (spIn.rollNumber !== undefined && spIn.rollNumber !== '') {
        user.studentProfile.rollNumber = Number(spIn.rollNumber)
      }
      if (spIn.UIN) user.studentProfile.UIN = String(spIn.UIN).trim()
      if (spIn.department) user.studentProfile.department = spIn.department
      if (spIn.year) user.studentProfile.year = Number(spIn.year)
      if (spIn.addmissionYear) user.studentProfile.addmissionYear = Number(spIn.addmissionYear)
      if (spIn.gap !== undefined) user.studentProfile.gap = Boolean(spIn.gap)
      if (spIn.liveKT !== undefined && spIn.liveKT !== '') {
        user.studentProfile.liveKT = Number(spIn.liveKT)
      }

      if (spIn.SGPA && typeof spIn.SGPA === 'object') {
        user.studentProfile.SGPA = user.studentProfile.SGPA || {}
        for (let i = 1; i <= 8; i += 1) {
          const key = `sem${i}`
          const v = spIn.SGPA[key]
          if (v !== undefined && v !== '' && v !== 'undefined') {
            user.studentProfile.SGPA[key] = Number(v)
          }
        }
      }

      if (spIn.pastQualification) {
        const pq = spIn.pastQualification
        if (pq.ssc) {
          if (pq.ssc.board != null) user.studentProfile.pastQualification.ssc.board = pq.ssc.board
          if (pq.ssc.year != null) user.studentProfile.pastQualification.ssc.year = Number(pq.ssc.year)
          if (pq.ssc.percentage != null) {
            user.studentProfile.pastQualification.ssc.percentage = Number(pq.ssc.percentage)
          }
        }
        if (pq.hsc) {
          if (pq.hsc.board != null) user.studentProfile.pastQualification.hsc.board = pq.hsc.board
          if (pq.hsc.year != null) user.studentProfile.pastQualification.hsc.year = Number(pq.hsc.year)
          if (pq.hsc.percentage != null) {
            user.studentProfile.pastQualification.hsc.percentage = Number(pq.hsc.percentage)
          }
        }
        if (pq.diploma) {
          if (pq.diploma.department != null) {
            user.studentProfile.pastQualification.diploma.department = pq.diploma.department
          }
          if (pq.diploma.year != null) {
            user.studentProfile.pastQualification.diploma.year = Number(pq.diploma.year)
          }
          if (pq.diploma.percentage != null) {
            user.studentProfile.pastQualification.diploma.percentage = Number(pq.diploma.percentage)
          }
        }
      }
    }

    user.isProfileCompleted = true
    await user.save()
    return sendSuccess(res, 200, { message: 'Updated successfully' })
  } catch (error) {
    console.error('user.update-profile.controller ==> ', error)
    return sendError(res, 500, 'Internal server error')
  }
}

module.exports = UpdateProfile
