const express = require("express");
const logger = require("morgan");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const LocalStrategy = require("passport-local").Strategy;
require("dotenv").config();

const apiV1Router = require("./routes/api.v1");
const User = require("./models/user");

const mongoose = require("mongoose");

mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGODB_URI;

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

const app = express();

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email: email });
        if (!user) {
          return done(null, false, {
            message: "Incorrect email or password",
          });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return done(null, false, {
            message: "Incorrect email or password",
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret_cat",
    saveUninitialized: true,
    resave: false,
  })
);
app.use(passport.initialize());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/v1", apiV1Router);

module.exports = app;