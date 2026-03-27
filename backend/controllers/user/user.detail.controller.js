function val(v) {
  if (v === undefined || v === null) return null
  if (v instanceof Date) return v.toISOString()
  return v
}

const UserDetail = async (req, res) => {
  try {
    const u = req.user
    const sp = u.studentProfile
    const resume = sp?.resume
    const sgpa = sp?.SGPA
    const pq = sp?.pastQualification
    const ssc = pq?.ssc
    const hsc = pq?.hsc
    const diploma = pq?.diploma

    return res.json({
      id: String(u._id),
      first_name: val(u.first_name),
      middle_name: val(u.middle_name),
      last_name: val(u.last_name),
      email: val(u.email),
      number: u.number != null ? u.number : null,
      profile: val(u.profile),
      gender: val(u.gender),
      dateOfBirth: val(u.dateOfBirth),
      createdAt: val(u.createdAt),
      fullAddress: {
        address: val(u.fullAddress?.address),
        pincode: u.fullAddress?.pincode != null ? u.fullAddress.pincode : null,
      },
      role: val(u.role),
      isProfileCompleted: Boolean(u.isProfileCompleted),
      tpoProfile: {
        position: val(u.tpoProfile?.position),
      },
      managementProfile: {
        position: val(u.managementProfile?.position),
      },
      studentProfile: {
        isApproved: sp?.isApproved ?? null,
        rollNumber: sp?.rollNumber != null ? sp.rollNumber : null,
        UIN: val(sp?.UIN),
        department: val(sp?.department),
        year: sp?.year != null ? sp.year : null,
        addmissionYear: sp?.addmissionYear != null ? sp.addmissionYear : null,
        gap: sp?.gap ?? null,
        liveKT: sp?.liveKT != null ? sp.liveKT : null,
        resume: {
          filename: val(resume?.filename),
          filepath: val(resume?.filepath),
          contentType: val(resume?.contentType),
        },
        SGPA: {
          sem1: sgpa?.sem1 != null ? sgpa.sem1 : null,
          sem2: sgpa?.sem2 != null ? sgpa.sem2 : null,
          sem3: sgpa?.sem3 != null ? sgpa.sem3 : null,
          sem4: sgpa?.sem4 != null ? sgpa.sem4 : null,
          sem5: sgpa?.sem5 != null ? sgpa.sem5 : null,
          sem6: sgpa?.sem6 != null ? sgpa.sem6 : null,
          sem7: sgpa?.sem7 != null ? sgpa.sem7 : null,
          sem8: sgpa?.sem8 != null ? sgpa.sem8 : null,
        },
        pastQualification: {
          ssc: {
            board: val(ssc?.board),
            percentage: ssc?.percentage != null ? ssc.percentage : null,
            year: ssc?.year != null ? ssc.year : null,
          },
          hsc: {
            board: val(hsc?.board),
            percentage: hsc?.percentage != null ? hsc.percentage : null,
            year: hsc?.year != null ? hsc.year : null,
          },
          diploma: {
            department: val(diploma?.department),
            percentage: diploma?.percentage != null ? diploma.percentage : null,
            year: diploma?.year != null ? diploma.year : null,
          },
        },
      },
    })
  } catch (error) {
    console.error('user.detail.controller => ', error)
    return res.status(500).json({ msg: 'Failed to load profile' })
  }
}

module.exports = UserDetail
