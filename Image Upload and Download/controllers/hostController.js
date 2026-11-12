const path = require("path");
const fs = require("fs");
const Home = require("../models/home");
const User = require("../models/user");
const rootDir = require("../utils/pathUtil");

exports.getAddHome = (req, res, next) => {
  res.render("host/edit-home", {
    pageTitle: "Add Home to Airbnb",
    currentPage: "addHome",
    editing: false,
    errorMessage: null,
    home: {},
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
  });
};

exports.getEditHome = async (req, res, next) => {
  try {
    const homeId = req.params.homeId;
    const editing = req.query.editing === "true";

    const home = await Home.findById(homeId);
    if (!home) {
      console.log("Home not found for editing.");
      return res.redirect("/host/host-home-list");
    }

    res.render("host/edit-home", {
      home: home,
      pageTitle: "Edit your Home",
      currentPage: "host-homes",
      editing: editing,
      errorMessage: null,
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  } catch (err) {
    console.log("Error in getEditHome:", err);
    res.redirect("/host/host-home-list");
  }
};

exports.getHostHomes = async (req, res, next) => {
  try {
    const registeredHomes = await Home.find();
    res.render("host/host-home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Host Homes List",
      currentPage: "host-homes",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  } catch (err) {
    console.log("Error in getHostHomes:", err);
    res.render("host/host-home-list", {
      registeredHomes: [],
      pageTitle: "Host Homes List",
      currentPage: "host-homes",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  }
};

exports.postAddHome = async (req, res, next) => {
  try {
    const { houseName, price, location, rating, description } = req.body;

    if (!req.file) {
      return res.status(422).render("host/edit-home", {
        pageTitle: "Add Home to Airbnb",
        currentPage: "addHome",
        editing: false,
        errorMessage: "Please upload an image for the home (JPEG, JPG, PNG, WEBP)",
        home: { houseName, price, location, rating, description },
        isLoggedIn: req.isLoggedIn,
        user: req.session.user,
      });
    }

    // Always store path with forward slash and leading slash for clean URL resolution
    const photo = "/uploads/" + req.file.filename;

    const home = new Home({
      houseName,
      price: Number(price),
      location,
      rating: Number(rating) || 5,
      photo,
      description,
    });

    await home.save();
    console.log("Home saved successfully");
    res.redirect("/host/host-home-list");
  } catch (err) {
    console.log("Error in postAddHome:", err);
    res.status(500).redirect("/host/host-home-list");
  }
};

exports.postEditHome = async (req, res, next) => {
  try {
    const { id, houseName, price, location, rating, description } = req.body;
    const home = await Home.findById(id);

    if (!home) {
      return res.redirect("/host/host-home-list");
    }

    home.houseName = houseName;
    home.price = Number(price);
    home.location = location;
    home.rating = Number(rating) || home.rating;
    home.description = description;

    if (req.file) {
      // If there was an old uploaded file, safely remove it
      if (home.photo && home.photo.includes("/uploads/")) {
        const oldFilename = home.photo.replace(/^\/uploads\//, "").replace(/^uploads[\/\\]/, "");
        const oldPath = path.join(rootDir, "uploads", oldFilename);
        if (fs.existsSync(oldPath)) {
          fs.unlink(oldPath, (err) => {
            if (err) console.log("Error while deleting old photo:", err);
          });
        }
      }
      home.photo = "/uploads/" + req.file.filename;
    }

    await home.save();
    console.log("Home updated successfully:", home._id);
    res.redirect("/host/host-home-list");
  } catch (err) {
    console.log("Error in postEditHome:", err);
    res.redirect("/host/host-home-list");
  }
};

exports.postDeleteHome = async (req, res, next) => {
  try {
    const homeId = req.params.homeId;
    const home = await Home.findById(homeId);

    if (home) {
      // Safely delete photo file if it was uploaded
      if (home.photo && home.photo.includes("/uploads/")) {
        const filename = home.photo.replace(/^\/uploads\//, "").replace(/^uploads[\/\\]/, "");
        const filePath = path.join(rootDir, "uploads", filename);
        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, (err) => {
            if (err) console.log("Error while deleting photo file:", err);
          });
        }
      }

      // Also clean up from any user's favourites list
      await User.updateMany(
        { favourites: homeId },
        { $pull: { favourites: homeId } }
      );

      await Home.findByIdAndDelete(homeId);
      console.log("Home deleted successfully:", homeId);
    }

    res.redirect("/host/host-home-list");
  } catch (err) {
    console.log("Error in postDeleteHome:", err);
    res.redirect("/host/host-home-list");
  }
};
