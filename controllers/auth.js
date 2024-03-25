const User = require("../models/User");
const { hashString } = require("../utils");
const { sendVerificationEmail } = require("../utils/sendEmail");

exports.register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // Validation
  if (!firstName || !lastName || !email || !password)
    return res.status(401).json({ error: "Missing parameters." });

  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(409).json({ message: "This email is already used." });

    const hashedPassword = await hashString(password);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
    });

    await newUser.save();

    sendVerificationEmail(newUser, res);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};
