const User = require("../models/User");
const { hashString, comparePassword, createJWT } = require("../utils");
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

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password)
      return res.status(401).json({ error: "Missing parameters." });

    const user = await User.findOne({ email }).select("+password").populate({
      path: "friends",
      select: "firstNale lastName location profileUrl -password",
    });

    if (!user)
      return res.status(401).json({ error: "Invalid email or password." });

    if (!user?.verified)
      return res.status(401).json({
        error:
          "Email not verified. Please, check your eamil account and verify your email address.",
      });

    const isMatch = await comparePassword(password, user?.password);

    if (!isMatch)
      return res.status(401).json({ error: "Invalid email or password." });

    const token = createJWT(user?._id);

    res.status(201).json({
      success: true,
      message: "Login successfull.",
      user,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};
