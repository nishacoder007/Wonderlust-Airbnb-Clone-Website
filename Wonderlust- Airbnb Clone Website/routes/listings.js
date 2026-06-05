const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { isLoggedIn, isOwner, validateListing } = require("../middleware");

// GET /listings - Index (Includes Search & Category Filtering)
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const { category, search } = req.query;
    let filter = {};

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } },
      ];
    }

    const allListings = await Listing.find(filter);
    res.render("listings/index", { allListings, category, search });
  })
);

// GET /listings/new - New Listing Form
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/new");
});

// POST /listings - Create Listing
router.post(
  "/",
  isLoggedIn,
  validateListing,
  wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    // Handle empty image url
    if (!req.body.listing.image || req.body.listing.image.url === "") {
      delete newListing.image;
    }

    await newListing.save();
    req.flash("success", "New listing successfully created!");
    res.redirect("/listings");
  })
);

// GET /listings/:id - Show Listing Detail
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: {
          path: "author",
        },
      })
      .populate("owner");

    if (!listing) {
      req.flash("error", "The listing you are looking for does not exist!");
      return res.redirect("/listings");
    }

    res.render("listings/show", { listing });
  })
);

// GET /listings/:id/edit - Edit Listing Form
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "The listing you are looking for does not exist!");
      return res.redirect("/listings");
    }
    res.render("listings/edit", { listing });
  })
);

// PUT /listings/:id - Update Listing
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { runValidators: true });
    
    // Fallback image url if field was cleared
    if (req.body.listing.image && req.body.listing.image.url === "") {
      listing.image.url = "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=60";
      await listing.save();
    }

    req.flash("success", "Listing successfully updated!");
    res.redirect(`/listings/${id}`);
  })
);

// DELETE /listings/:id - Delete Listing
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing successfully deleted!");
    res.redirect("/listings");
  })
);

module.exports = router;
