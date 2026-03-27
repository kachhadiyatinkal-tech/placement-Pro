const User = require("../../models/user.model");
const bcrypt = require("bcrypt");


const tpoUsers = async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Number(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const [tpoUsers, totalItems] = await Promise.all([
    User.find({ role: "tpo" }).skip(skip).limit(limit),
    User.countDocuments({ role: "tpo" }),
  ]);

  res.json({
    tpoUsers,
    data: tpoUsers,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: page,
    totalItems,
  })
}

const tpoAddUsers = async (req, res) => {
  const email = req.body.email;

  try {
    if (await User.findOne({ email }))
      return res.json({ msg: "User Already Exists!" });

    const hashPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = new User({
      first_name: req.body.first_name,
      middle_name: req.body.middle_name,
      last_name: req.body.last_name,
      gender: req.body.gender,
      email: req.body.email,
      number: req.body.number,
      password: hashPassword,
      role: "tpo",
      tpoProfile: {
        position: req.body.position
      }
    });
    await newUser.save();
    return res.json({ msg: "User Created!" });
  } catch (error) {
    console.log("user-tpo.controller => ", error);
    return res.json({ msg: "Internal Server Error!" });
  }
}

const tpoDeleteUsers = async (req, res) => {
  // const user = await Users.find({email: req.body.email});
  const ress = await User.deleteOne({ email: req.body.email });
  if (ress.acknowledged) {
    return res.json({ msg: "User Deleted Successfully!" });
  } else {
    return res.json({ msg: "Error While Deleting User!" });
  }
}


module.exports = {
  tpoUsers,
  tpoAddUsers,
  tpoDeleteUsers
};