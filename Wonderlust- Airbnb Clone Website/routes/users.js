const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync");
const { saveRedirectUrl } = require("../middleware");

// GET /signup - Signup Form
router.get("/signup", (req, res) => {
  res.render("users/signup");
});

// POST /signup - Register User
router.post(
  "/signup",
  wrapAsync(async (req, res, next) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        req.flash("error", "All fields are required!");
        return res.redirect("/signup");
      }

      // Check if username or email is already taken
      const existingUser = await User.findOne({
        $or: [{ username }, { email: email.toLowerCase() }],
      });

      if (existingUser) {
        req.flash("error", "Username or Email is already registered!");
        return res.redirect("/signup");
      }

      const newUser = new User({ username, email, password });
      const registeredUser = await newUser.save();

      // Automatically log the user in on successful registration
      req.login(registeredUser, (err) => {
        if (err) return next(err);
        req.flash("success", "Welcome to Wonderlust! Account created successfully.");
        res.redirect("/listings");
      });
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/signup");
    }
  })
);

// GET /login - Login Form
router.get("/login", (req, res) => {
  res.render("users/login");
});

// POST /login - Authenticate User
router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", `Welcome back to Wonderlust, ${req.user.username}!`);
    const redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
  }
);

// GET /logout - Log Out User
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logged out!");
    res.redirect("/listings");
  });
});

module.exports = router;
