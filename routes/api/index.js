const express = require("express");
const router = express.Router();

router.use("/", require("./users"));
router.use("/profiles", require("./profiles"));
router.use("/rooms", require("./rooms"));

//middleware function for our API router to handle validation errors from Mongoose
router.use((err, req, res, next) => {
  if (err.name === "ValidationError") {
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce((errors, key) => {
        errors[key] = err.errors[key].message;

        return errors;
      }, {}),
    });
  }

  return next(err);
});

module.exports = router;
