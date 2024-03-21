const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const connectDB = require("./database");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limmit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.all("*", (req, res) => {
  res.status(404).json({ error: "Route not found." });
});

app.listen(process.env.PORT, () => {
  connectDB();
  console.log(`Server started on port ${process.env.PORT}`);
});
