const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
// const fileUpload = require("express-fileupload");
require("dotenv").config();
const CloudinaryStorage = require("./config/cloudinarySetup");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const paymentRouter = require("./routes/payer");
const uploadRouter = require("./routes/resourceUpload");

const app = express();
// fixes cor error
// eslint-disable-next-line consistent-return
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});


const dbUri = process.env.DB_URI;
// const cloudDBURI = process.env.DB_URI;
mongoose.connect(dbUri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
// eslint-disable-next-line no-console
}).then(console.log("database connected"));

// Cloudinary Set up
CloudinaryStorage();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
// app.use(fileUpload({
//   useTempFiles: true
// }));

app.use("/api/v1", indexRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/resources", uploadRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
