const express = require("express");
const path = require("path");
const { verifyEmail } = require("../controllers/user");

const router = express.Router();
const __dirname = path.resolve(path.dirname(""));

router.get("/verify/:userId/:token", verifyEmail);
router.get("/verified", (req, res) => {
  res.sendFile(path.join(__dirname, `./views/build`, "index.html"));
});

module.exports = router;
