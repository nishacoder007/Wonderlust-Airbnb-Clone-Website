// Load environment variables
require("dotenv").config();

const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const connectDB = require("./config/db");
const User = require("./models/user");
const ExpressError = require("./utils/ExpressError");

// Import Routers
const listingsRouter = require("./routes/listings");
const reviewsRouter = require("./routes/reviews");
const usersRouter = require("./routes/users");

const app = express();

// Connect to MongoDB Database
connectDB();

// Setup EJS Engine and Views Path
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Standard Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Session Configuration
const sessionConfig = {
  name: "session",
  secret: process.env.SESSION_SECRET || "wonderlustsupersecretkeyforpassportandsessions",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 Week
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};
app.use(session(sessionConfig));
app.use(flash());

// Passport Session Authentication Config
app.use(passport.initialize());
app.use(passport.session());

// Configure custom local passport strategy matching User credentials
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return done(null, false, { message: "Incorrect username." });
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return done(null, false, { message: "Incorrect password." });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Flash messages & Current User global locals injector
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// Root Route (redirects to listings explorer)
app.get("/", (req, res) => {
  res.redirect("/listings");
});

// Mount Routers
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", usersRouter);

// 404 Route Catching
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "The page you requested could not be found!"));
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error", { statusCode, message });
});

// Launch server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server launched and listening on http://localhost:${PORT}`);
});
