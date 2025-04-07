const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { auth, authLimiter } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const User = require('../models/User');

// Register new user
router.post('/register', validate.register, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        error: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create new user
    const user = new User({
      username,
      email,
      password,
      verificationToken
    });

    await user.save();

    // Send verification email (implement email service)
    // await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      message: 'Registration successful, please check your email to verify your account',
      userId: user._id
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
router.post('/login', [authLimiter, validate.login], async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.accountLocked && user.lockUntil > Date.now()) {
      return res.status(423).json({
        error: 'Account is locked, please try again later',
        lockUntil: user.lockUntil
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({ error: 'Please verify your email before logging in' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is inactive' });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      // Handle failed login attempt
      await user.handleFailedLogin();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Reset failed login attempts on successful login
    await user.resetFailedAttempts();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set secure cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify email
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    // Update user
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Email verification failed' });
  }
});

// Request password reset
router.post('/forgot-password', validate.email, async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save();

    // Send password reset email (implement email service)
    // await sendPasswordResetEmail(email, resetToken);

    res.json({ message: 'Password reset instructions sent to your email' });

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

// Reset password
router.post('/reset-password/:token', validate.password, async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      passwordResetToken: crypto
        .createHash('sha256')
        .update(token)
        .digest('hex'),
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Update profile
router.put('/profile', [auth, validate.updateProfile], async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if new email is already taken
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      user.email = email;
      user.isEmailVerified = false;
      // Generate new verification token and send email
      const verificationToken = user.createVerificationToken();
      await user.save();
      // await sendVerificationEmail(email, verificationToken);
    }

    // Check if new username is already taken
    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res.status(400).json({ error: 'Username already taken' });
      }
      user.username = username;
    }

    // Update password if provided
    if (password) {
      user.password = password;
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Logout
router.post('/logout', auth, (req, res) => {
  try {
    // Clear cookie
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update last active timestamp
    await user.updateLastActive();

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        lastActive: user.lastActive
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

module.exports = router; 