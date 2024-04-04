const express = require("express");
const path = require("path");
const {
  verifyEmail,
  requestPassworrdReset,
  resetPassword,
  changePassword,
} = require("../controllers/user");

const router = express.Router();
const __dirname = path.resolve(path.dirname(""));

router.post("/request-password-reset", requestPassworrdReset);
router.post("/reset-password", changePassword);

router.get("/verify/:userId/:token", verifyEmail);
router.get("/verified", (req, res) => {
  res.sendFile(path.join(__dirname, `./views/build`, "index.html"));
});
router.get("/reset-password/:userId/:token", resetPassword);
router.get("/password-reset", (req, res) => {
  res.sendFile(path.join(__dirname, `./views/build`, "index.html"));
});

module.exports = router;
