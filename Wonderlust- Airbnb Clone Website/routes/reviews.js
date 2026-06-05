const express = require("express");
const router = express.Router({ mergeParams: true }); // Crucial for nested params like :id
const Listing = require("../models/listing");
const Review = require("../models/review");
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isReviewAuthor, validateReview } = require("../middleware");

// POST /listings/:id/reviews - Create Review
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

    const review = new Review(req.body.review);
    review.author = req.user._id;

    listing.reviews.push(review);

    await review.save();
    await listing.save();

    req.flash("success", "Review posted successfully!");
    res.redirect(`/listings/${listing._id}`);
  })
);

// DELETE /listings/:id/reviews/:reviewId - Delete Review
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    // Pull the review ID from the listing's reviews array
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    
    // Delete the review itself
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review deleted successfully!");
    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;
