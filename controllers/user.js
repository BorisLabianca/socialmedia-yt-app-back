const EmailVerification = require("../models/EmailVerification");
const PasswordReset = require("../models/PasswordReset");
const User = require("../models/User");
const { comparePassword, hashString } = require("../utils");
const { resetPasswordLink } = require("../utils/sendEmail");

exports.verifyEmail = async (req, res) => {
  const { userId, token } = req.params;

  try {
    const result = await EmailVerification.findOne({ userId });

    if (result) {
      const { expiresAt, token: hashedToken } = result;
      // Token expiration verification
      if (expiresAt < Date.now()) {
        await EmailVerification.findOneAndDelete({ userId })
          .then(() => {
            User.findOneAndDelete({ _id: userId })
              .then(() => {
                const message = "Verification token has expired.";
                res.redirect(`/users/verified?status=error&message=${message}`);
              })
              .catch((error) => {
                res.redirect(`/users/verified?status=error&message=`);
              });
          })
          .catch((error) => {
            console.log(error);
            res.redirect(`/users/verified?message=`);
          });
      } else {
        // Token validity check
        comparePassword(token, hashedToken)
          .then((isMatch) => {
            if (isMatch) {
              User.findOneAndUpdate({ _id: userId }, { verified: true })
                .then(() => {
                  EmailVerification.findOneAndDelete({ userId }).then(() => {
                    const message = "Email verified successfully.";
                    res.redirect(
                      `/users/verified?status=success&message=${message}`
                    );
                  });
                })
                .catch((error) => {
                  console.log(error);
                  const message = "Verification failed or link is invalid.";
                  res.redirect(
                    `/users/verified?status=error&message=${message}`
                  );
                });
            } else {
              // Invalid token
              const message = "Verification failed or link is invalid.";
              res.redirect(`/users/verified?status=error&message=${message}`);
            }
          })
          .catch((error) => {
            console.log(error);
            res.redirect(`/users/verified?message=`);
          });
      }
    } else {
      const message = "Invalid verification link.Please try again.";
      res.redirect(`/users/verified?status=error&message=${message}`);
    }
  } catch (error) {
    console.log(error);
    res.redirect(`/users/verified?message=`);
  }
};

exports.requestPassworrdReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ status: "FAILED", message: "Email address not found." });
    }

    const existingRequest = await PasswordReset.findOne({ email });
    if (existingRequest) {
      if (existingRequest.expiresAt > Date.now()) {
        return res.status(201).json({
          status: "PENDING",
          message:
            "Reste password link has already been sent to your email address.",
        });
      }
      await PasswordReset.findOneAndDelete({ email });
    }
    await resetPasswordLink(user, res);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { userId, token } = req.params;

  try {
    const userExist = await User.findById(userId);
    if (!userExist) {
      const message = "Invalid password reset link. Please try again.";
      res.redirect(`/users/password-reset?status=error&message=${message}`);
    }

    const resetPassword = await PasswordReset.findOne({ userId });
    if (!resetPassword) {
      const message = "Invalid password reset link. Please try again.";
      res.redirect(`/users/password-reset?status=error&message=${message}`);
    }

    const { expiresAt, token: resetToken } = resetPassword;

    if (expiresAt < Date.now()) {
      const message = "Reset password link has expired. Please try again.";
      res.redirect(`/users/password-reset?status=error&message=${message}`);
    } else {
      const isMatch = await comparePassword(token, resetToken);

      if (!isMatch) {
        const message = "Invalid password reset link. Please try again.";
        res.redirect(`/users/password-reset?status=error&message=${message}`);
      } else {
        res.redirect(`/users/password-reset?type=reset&id=${userId}`);
      }
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (password.length < 8) {
      return res
        .status(404)
        .json({ message: "Password must be at least 8 characters." });
    }

    const hashedPassword = await hashString(password);

    const user = await User.findByIdAndUpdate(
      { _id: userId },
      { password: hashedPassword }
    );

    if (user) {
      await PasswordReset.findByIdAndDelete({ userId });
      const message = "Password successfully reset.";
      res.redirect(`/users/password-reset?status=success&message=${message}`);
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};
