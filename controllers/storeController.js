const Home = require("../models/home");
const User = require("../models/user");

exports.getIndex = async (req, res, next) => {
  try {
    const registeredHomes = await Home.find();
    res.render("store/index", {
      registeredHomes: registeredHomes,
      pageTitle: "Airbnb - Vacation Homes & Rentals",
      currentPage: "index",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  } catch (err) {
    console.log("Error in getIndex:", err);
    res.render("store/index", {
      registeredHomes: [],
      pageTitle: "Airbnb - Vacation Homes & Rentals",
      currentPage: "index",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  }
};

exports.getHomes = async (req, res, next) => {
  try {
    const registeredHomes = await Home.find();
    res.render("store/home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "All Homes",
      currentPage: "Home",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  } catch (err) {
    console.log("Error in getHomes:", err);
    res.render("store/home-list", {
      registeredHomes: [],
      pageTitle: "All Homes",
      currentPage: "Home",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  }
};

exports.getBookings = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  res.render("store/bookings", {
    pageTitle: "My Bookings",
    currentPage: "bookings",
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
  });
};

exports.getFavouriteList = async (req, res, next) => {
  try {
    if (!req.session.user) {
      return res.redirect("/login");
    }

    const userId = req.session.user._id;
    const user = await User.findById(userId).populate("favourites");

    const favouriteHomes = user && user.favourites ? user.favourites.filter(Boolean) : [];

    res.render("store/favourite-list", {
      favouriteHomes: favouriteHomes,
      pageTitle: "My Favourites",
      currentPage: "favourites",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  } catch (err) {
    console.log("Error in getFavouriteList:", err);
    res.redirect("/");
  }
};

exports.postAddToFavourite = async (req, res, next) => {
  try {
    if (!req.session.user) {
      return res.redirect("/login");
    }

    const homeId = req.body.id;
    const userId = req.session.user._id;
    const user = await User.findById(userId);

    if (user) {
      const alreadyFav = user.favourites.some(
        (fav) => fav.toString() === homeId.toString()
      );
      if (!alreadyFav) {
        user.favourites.push(homeId);
        await user.save();
      }
    }

    res.redirect("/favourites");
  } catch (err) {
    console.log("Error in postAddToFavourite:", err);
    res.redirect("/favourites");
  }
};

exports.postRemoveFromFavourite = async (req, res, next) => {
  try {
    if (!req.session.user) {
      return res.redirect("/login");
    }

    const homeId = req.params.homeId;
    const userId = req.session.user._id;
    const user = await User.findById(userId);

    if (user) {
      user.favourites = user.favourites.filter(
        (fav) => fav.toString() !== homeId.toString()
      );
      await user.save();
    }

    res.redirect("/favourites");
  } catch (err) {
    console.log("Error in postRemoveFromFavourite:", err);
    res.redirect("/favourites");
  }
};

exports.getHomeDetails = async (req, res, next) => {
  try {
    const homeId = req.params.homeId;
    const home = await Home.findById(homeId);

    if (!home) {
      console.log("Home not found:", homeId);
      return res.redirect("/homes");
    }

    res.render("store/home-details", {
      home: home,
      pageTitle: home.houseName,
      currentPage: "Home",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  } catch (err) {
    console.log("Error in getHomeDetails:", err);
    res.redirect("/homes");
  }
};
