const mongoose = require("mongoose");
const path = require("path");
const User = require("../models/user");
const Listing = require("../models/listing");
const Review = require("../models/review");
const { data } = require("./data");

// Configure dotenv
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const seedDB = async () => {
  const dbUrl = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/wonderlust";
  
  console.log("Connecting to Database...");
  await mongoose.connect(dbUrl);
  console.log("Database Connected!");

  console.log("Cleaning up existing collection records...");
  await Listing.deleteMany({});
  await Review.deleteMany({});
  await User.deleteMany({});
  console.log("Collections cleared!");

  console.log("Creating default owner/admin account...");
  const adminUser = new User({
    username: "admin",
    email: "admin@wonderlust.com",
    password: "adminpassword", // Will be automatically hashed by pre-save hook
  });
  const savedAdmin = await adminUser.save();
  console.log(`Default owner created: Username = ${savedAdmin.username}`);

  console.log("Assigning owner and preparation of seed data...");
  const listingsWithOwner = data.map((listing) => ({
    ...listing,
    owner: savedAdmin._id,
  }));

  console.log("Seeding listings...");
  await Listing.insertMany(listingsWithOwner);
  console.log("Listings successfully seeded!");

  console.log("Closing connection...");
  await mongoose.connection.close();
  console.log("Database Connection Closed!");
};

seedDB().catch((err) => {
  console.error("Error seeding database:", err);
  process.exit(1);
});
