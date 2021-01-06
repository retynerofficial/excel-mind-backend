const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
// const fileUpload = require("express-fileupload");
require("dotenv").config({ path: `${__dirname}/.env` });
const CloudinaryStorage = require("./config/cloudinarySetup");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const paymentRouter = require("./routes/payer");
const uploadRouter = require("./routes/resourceUpload");
const virtualRouter = require("./routes/virtualClass");
const validateSubscription = require("./middlewares/validateSubscription");

const app = express();

// const whitelist = ["https://emps.netlify.app", "http://127.0.0.1:5502", "http://127.0.0.1:3000"];
// const corsOptions = {
//   origin(origin, callback) {
//     if (whitelist.indexOf(origin) !== -1 || !origin) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   }
// };
app.use(cors());
app.options("*", cors());
// fixes cor error
// eslint-disable-next-line consistent-return

// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "https://emps.netlify.app");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//   );

//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
//   if (req.method === "OPTIONS") {
//     res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET, OPTIONS");
//     return res.status(200).json({});
//   }
//   next();
// });
// Add headers
app.use((req, res, next) => {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");

  // Request headers you wish to allow
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});
const dbUri = process.env.DB_URI;
// const dbUri = "mongodb://localhost:27017/excelmind";
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

app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
});
// app.options("*", cors(corsOptions));
app.use("/api/v1", indexRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/resources", uploadRouter);
app.use("/api/v1/virtuals", virtualRouter);

// app.use((req, res, next) => {
//   res.setHeader("Content-Type", "application/json");
//   next();
// });
// app.options("*", cors);

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
// const io = require("socket.io")(app);

module.exports = app;
