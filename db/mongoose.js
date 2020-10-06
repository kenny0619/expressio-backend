const mongoose = require("mongoose");

//DB connection
const URI = process.env.MONGODB_URI
  ? process.env.MONGODB_URI
  : "mongodb+srv://ibukunoluwa:J37XqVAVWWW6T9R@expresso.fb5bp.mongodb.net/dbtest?retryWrites=true&w=majority";

mongoose.connect(URI, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//DB responses
const connection = mongoose.connection;

connection.once("open", () => console.log("DB is connected"));
// module.exports = connection;
