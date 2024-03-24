const mongoose = require("mongoose");

const EmailVerificationSchema = new mongoose.Schema({
  userId: String,
  token: String,
  createdat: Date,
  expiresdat: Date,
});

const EmailVerification = mongoose.model(
  "EmailVerification",
  EmailVerificationSchema
);

module.exports = EmailVerification;
