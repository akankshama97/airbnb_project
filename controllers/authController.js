const { check, validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.getLogin = (req, res, next) => {
  if (req.session && req.session.isLoggedIn) {
    return res.redirect("/");
  }
  res.render("auth/login", {
    pageTitle: "Login to Airbnb",
    currentPage: "login",
    isLoggedIn: false,
    errors: [],
    oldInput: { email: "" },
    user: {},
  });
};

exports.getSignup = (req, res, next) => {
  if (req.session && req.session.isLoggedIn) {
    return res.redirect("/");
  }
  res.render("auth/signup", {
    pageTitle: "Create Account",
    currentPage: "signup",
    isLoggedIn: false,
    errors: [],
    oldInput: { firstName: "", lastName: "", email: "", userType: "guest" },
    user: {},
  });
};

exports.postSignup = [
  check("firstName")
    .trim()
    .isLength({ min: 2 })
    .withMessage("First Name should be at least 2 characters long")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("First Name should contain only alphabets"),

  check("lastName")
    .trim()
    .matches(/^[A-Za-z\s]*$/)
    .withMessage("Last Name should contain only alphabets"),

  check("email")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail()
    .custom(async (value) => {
      const existingUser = await User.findOne({ email: value });
      if (existingUser) {
        throw new Error("This email is already registered. Please login or use a different email.");
      }
      return true;
    }),

  check("password")
    .isLength({ min: 6 })
    .withMessage("Password should be at least 6 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password should contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password should contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password should contain at least one number")
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
    .withMessage("Password should contain at least one special character")
    .trim(),

  check("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  check("userType")
    .notEmpty()
    .withMessage("Please select a user type")
    .isIn(["guest", "host"])
    .withMessage("Invalid user type"),

  check("terms")
    .custom((value, { req }) => {
      if (value !== "on") {
        throw new Error("Please accept the terms and conditions");
      }
      return true;
    }),

  async (req, res, next) => {
    const { firstName, lastName, email, password, userType } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).render("auth/signup", {
        pageTitle: "Create Account",
        currentPage: "signup",
        isLoggedIn: false,
        errors: errors.array().map((err) => err.msg),
        oldInput: { firstName, lastName, email, userType },
        user: {},
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        userType: userType || "guest",
      });

      await user.save();
      console.log("User registered successfully:", email);
      res.redirect("/login");
    } catch (err) {
      console.log("Signup error:", err);
      let errorMsg = "Registration failed. Please try again.";
      if (err.code === 11000) {
        errorMsg = "Email is already registered. Please login instead.";
      }
      return res.status(422).render("auth/signup", {
        pageTitle: "Create Account",
        currentPage: "signup",
        isLoggedIn: false,
        errors: [errorMsg],
        oldInput: { firstName, lastName, email, userType },
        user: {},
      });
    }
  },
];

exports.postLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || "").trim().toLowerCase();

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(422).render("auth/login", {
        pageTitle: "Login to Airbnb",
        currentPage: "login",
        errors: ["Invalid email or user does not exist"],
        oldInput: { email },
        user: {},
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(422).render("auth/login", {
        pageTitle: "Login to Airbnb",
        currentPage: "login",
        errors: ["Invalid password. Please check and try again."],
        oldInput: { email },
        user: {},
      });
    }

    // Save user info in session
    req.session.isLoggedIn = true;
    req.session.user = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userType: user.userType,
    };

    req.session.save((err) => {
      if (err) {
        console.log("Session Save Error:", err);
        return res.redirect("/login");
      }
      console.log("User logged in successfully:", user.email);
      return res.redirect("/");
    });
  } catch (err) {
    console.log("Login error:", err);
    res.redirect("/login");
  }
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.log("Logout error:", err);
    }
    res.redirect("/login");
  });
};
