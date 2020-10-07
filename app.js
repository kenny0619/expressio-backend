require("dotenv").config();
const cors = require("cors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");

const app = express();

// const whitelist = [
//   "http://localhost:3000",
//   "https://expressionapp.netlify.app",
// ];

// const corsOptionsDelegate = (req, callback) => {
//   let corsOptions;

//   let isDomainAllowed = allowlist.indexOf(req.header("Origin")) !== -1;

//   if (isDomainAllowed) {
//    // Enable CORS for this request
//     corsOptions = { origin: true };
//   } else {
//     // Disable CORS for this request
//     corsOptions = { origin: false };
//   }
//   callback(null, corsOptions);
// };

app.use(cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "expressio",
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false,
  })
);

require("./db/mongoose");
require("./models/User");
require("./config/passport");

app.use(require("./routes"));

module.exports = app;
