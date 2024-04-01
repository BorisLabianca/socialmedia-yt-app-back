const EmailVerification = require("../models/EmailVerification");
const User = require("../models/User");
const { comparePassword } = require("../utils");

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
