const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const paymentRouter = require("./routes/payer");

require("dotenv").config();

const app = express();

// const dbUri = "mongodb://localhost/excelmind";
const cloudDBURI = process.env.DB_URI;
mongoose.connect(cloudDBURI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
})
  // eslint-disable-next-line no-console
  .then(console.log("database connected"));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/v1", indexRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/payments", paymentRouter);

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
