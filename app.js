require("dotenv").config();
const cors = require("cors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");

const app = express();

app.use((req, res, next) => {
  const whitelist = [process.env.LOCALHOST_URI, process.env.NETLIFY_URI];

  let isDomainAllowed = whitelist.indexOf(req.headers.origin) !== -1;

  if (isDomainAllowed) {
    res.headers("ACCESS-CONTROL-ALLOW-ORIGIN", req.headers.origin);
  }

  next();
});
// app.use(cors());

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
