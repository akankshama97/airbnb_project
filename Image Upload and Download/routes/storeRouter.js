// External Module
const express = require("express");
const storeRouter = express.Router();

// Local Module
const storeController = require("../controllers/storeController");

// Authentication middleware for guest protected routes
const requireAuth = (req, res, next) => {
  if (req.session && req.session.isLoggedIn && req.session.user) {
    return next();
  }
  res.redirect("/login");
};

// Public Routes
storeRouter.get("/", storeController.getIndex);
storeRouter.get("/homes", storeController.getHomes);
storeRouter.get("/homes/:homeId", storeController.getHomeDetails);

// Protected Routes
storeRouter.get("/bookings", requireAuth, storeController.getBookings);
storeRouter.get("/favourites", requireAuth, storeController.getFavouriteList);
storeRouter.post("/favourites", requireAuth, storeController.postAddToFavourite);
storeRouter.post("/favourites/delete/:homeId", requireAuth, storeController.postRemoveFromFavourite);

module.exports = storeRouter;
