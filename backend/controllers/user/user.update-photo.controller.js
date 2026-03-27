const User = require('../../models/user.model')

const UpdatePhoto = async (req, res) => {
  const file = req.file

  if (!file) return res.status(400).json({ msg: 'No file uploaded.' })

  try {
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ msg: 'User not found.' })

    user.profile = '/' + file.fieldname + '/' + file.filename
    await user.save()

    return res.status(201).json({ msg: 'Profile picture updated successfully.', file: user.profile })
  } catch (error) {
    console.error('user.update-photo.controller => ', error)
    return res.status(500).json({ msg: 'Server error' })
  }
}

module.exports = UpdatePhoto
