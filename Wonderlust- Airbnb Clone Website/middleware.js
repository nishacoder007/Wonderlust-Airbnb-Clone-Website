const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError");

// Check if user is logged in
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to do that!");
    return res.redirect("/login");
  }
  next();
};

// Save original redirection URL to locals (passport wipes session on login)
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

// Check if logged-in user is listing owner
module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  try {
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }
    if (!res.locals.currUser || !listing.owner.equals(res.locals.currUser._id)) {
      req.flash("error", "You do not have permission to modify this listing!");
      return res.redirect(`/listings/${id}`);
    }
    next();
  } catch (err) {
    next(err);
  }
};

// Check if logged-in user is review author
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  try {
    const review = await Review.findById(reviewId);
    if (!review) {
      req.flash("error", "Review not found!");
      return res.redirect(`/listings/${id}`);
    }
    if (!res.locals.currUser || !review.author.equals(res.locals.currUser._id)) {
      req.flash("error", "You do not have permission to delete this review!");
      return res.redirect(`/listings/${id}`);
    }
    next();
  } catch (err) {
    next(err);
  }
};

// Backend listing validator
module.exports.validateListing = (req, res, next) => {
  const { title, description, price, location, country, category } = req.body.listing || {};
  if (!title || !description || price === undefined || !location || !country) {
    throw new ExpressError(400, "All listing fields are required!");
  }
  if (isNaN(price) || price < 0) {
    throw new ExpressError(400, "Price must be a valid non-negative number!");
  }
  next();
};

// Backend review validator
module.exports.validateReview = (req, res, next) => {
  const { rating, comment } = req.body.review || {};
  if (!rating || !comment || comment.trim() === "") {
    throw new ExpressError(400, "Rating and comment are required!");
  }
  const ratingNum = parseInt(rating);
  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    throw new ExpressError(400, "Rating must be an integer between 1 and 5!");
  }
  next();
};
