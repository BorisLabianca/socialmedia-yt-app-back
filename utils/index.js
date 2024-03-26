const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.hashString = async (string) => {
  const salt = await bcrypt.genSalt(14);

  const hashedString = await bcrypt.hash(string, salt);
  return hashedString;
};

exports.comparePassword = async (savedPassword, incomingPassword) => {
  const isMatch = await bcrypt.compare(savedPassword, incomingPassword);
  return isMatch;
};

exports.createJWT = (id) => {
  return jwt.sign({ iserId: id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1d",
  });
};
