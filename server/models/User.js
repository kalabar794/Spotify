const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const validator = require('validator');

const moodHistorySchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  mood: {
    keywords: [{
      type: String,
      required: true
    }],
    sentiment: {
      score: {
        type: Number,
        required: true,
        min: -1,
        max: 1
      },
      comparative: Number
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    validate: {
      validator: function(v) {
        return /^[a-zA-Z0-9_-]+$/.test(v);
      },
      message: 'Username can only contain letters, numbers, underscores, and dashes'
    }
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false, // Don't include password in queries by default
    validate: {
      validator: function(v) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(v);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  passwordChangedAt: Date,
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  accountLocked: {
    type: Boolean,
    default: false
  },
  lockUntil: Date,
  lastLogin: Date,
  lastPasswordChange: Date,
  lastActive: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date,
  moodHistory: [moodHistorySchema],
  preferences: {
    musicPreferences: {
      genres: [String],
      excludedGenres: [String],
      minTempo: Number,
      maxTempo: Number,
      minEnergy: Number,
      maxEnergy: Number,
      minValence: Number,
      maxValence: Number
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ verificationToken: 1 });
userSchema.index({ passwordResetToken: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);

    // Update passwordChangedAt field
    this.passwordChangedAt = Date.now() - 1000;
    next();
  } catch (error) {
    next(error);
  }
});

// Update timestamps
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Handle failed login attempts
userSchema.methods.handleFailedLogin = async function() {
  this.failedLoginAttempts += 1;
  
  // Lock account after 5 failed attempts
  if (this.failedLoginAttempts >= 5) {
    this.accountLocked = true;
    this.lockUntil = Date.now() + 15 * 60 * 1000; // Lock for 15 minutes
  }
  
  await this.save();
};

// Reset failed login attempts
userSchema.methods.resetFailedAttempts = async function() {
  this.failedLoginAttempts = 0;
  this.accountLocked = false;
  this.lockUntil = undefined;
  this.lastLogin = Date.now();
  await this.save();
};

// Generate password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Check if password changed after token was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Generate email verification token
userSchema.methods.createVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.verificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
    
  this.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return verificationToken;
};

// Update last active timestamp
userSchema.methods.updateLastActive = async function() {
  this.lastActive = Date.now();
  await this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User; 