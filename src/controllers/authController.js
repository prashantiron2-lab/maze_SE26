const User = require('../models/User');
const { generateToken, generateVerificationToken, verifyToken } = require('../utils/tokenUtils');
const { sendVerificationEmail } = require('../utils/emailService');
const { validateSignup, validateVerifyEmail } = require('../validators/authValidator');

const signup = async (req, res, next) => {
  try {
    const { email, username, password, confirmPassword } = req.body;

    // Validate input
    const { error, value } = validateSignup({
      email,
      username,
      password,
      confirmPassword,
    });

    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map((d) => ({
          field: d.path[0],
          message: d.message,
        })),
      });
    }

    // Check if email already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const tokenExpires = new Date();
    tokenExpires.setHours(tokenExpires.getHours() + 24);

    // Create user
    const newUser = await User.create(
      email,
      username,
      password,
      verificationToken,
      tokenExpires
    );

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    return res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        is_verified: newUser.is_verified,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email or username already exists' });
    }
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    // Validate input
    const { error } = validateVerifyEmail({ token });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Find user with token
    const user = await User.findByVerificationToken(token);
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    // Verify email
    const verifiedUser = await User.verifyEmail(user.id);

    // Generate JWT token
    const jwtToken = generateToken(user.id, user.email);

    return res.status(200).json({
      message: 'Email verified successfully',
      token: jwtToken,
      user: {
        id: verifiedUser.id,
        email: verifiedUser.email,
        username: verifiedUser.username,
        is_verified: verifiedUser.is_verified,
      },
    });
  } catch (error) {
    console.error('Email verification error:', error);
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  verifyEmail,
  getProfile,
};
