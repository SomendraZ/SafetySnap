const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register
exports.register = async (req, res) => {
  console.log(
    `[Register] ${req.method} ${req.originalUrl} - Email: ${req.body.email}`
  );

  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({
      error: {
        code: "FIELD_REQUIRED",
        field: "email",
        message: "All fields are required",
      },
    });

  try {
    let user = await User.findOne({ email });
    if (user)
      return res.status(400).json({
        error: {
          code: "EMAIL_EXISTS",
          field: "email",
          message: "Email already registered",
        },
      });

    const passwordHash = await bcrypt.hash(password, 10);

    user = new User({ name, email, passwordHash });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({ token });
  } catch (err) {
    console.error(`[Register Error] Email: ${email}`, err);
    res
      .status(500)
      .json({ error: { code: "SERVER_ERROR", message: err.message } });
  }
};

// Login
exports.login = async (req, res) => {
  console.log(
    `[Login] ${req.method} ${req.originalUrl} - Email: ${req.body.email}`
  );

  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({
      error: {
        code: "FIELD_REQUIRED",
        field: "email",
        message: "Email and password required",
      },
    });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
        },
      });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(400).json({
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
        },
      });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token });
  } catch (err) {
    console.error(`[Login Error] Email: ${email}`, err);
    res
      .status(500)
      .json({ error: { code: "SERVER_ERROR", message: err.message } });
  }
};
