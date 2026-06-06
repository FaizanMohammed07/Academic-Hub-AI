const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['student', 'faculty', 'hod', 'admin'],
    required: true,
    index: true,
  },
  loginId: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  avatarUrl: String,
  isActive: { type: Boolean, default: true, index: true },
  failedLoginAttempts: { type: Number, default: 0 },
  lockedUntil: Date,
  lastLogin: Date,
  passwordChangedAt: Date,
  notificationPrefs: {
    inApp:  { type: Boolean, default: true },
    email:  { type: Boolean, default: true },
    push:   { type: Boolean, default: false },
  },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  this.passwordChangedAt = new Date();
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.methods.isLocked = function () {
  return this.lockedUntil && this.lockedUntil > new Date();
};

userSchema.methods.incrementFailedAttempts = async function () {
  this.failedLoginAttempts += 1;
  if (this.failedLoginAttempts >= 5) {
    this.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min
  }
  await this.save({ validateBeforeSave: false });
};

userSchema.methods.resetFailedAttempts = async function () {
  this.failedLoginAttempts = 0;
  this.lockedUntil = undefined;
  this.lastLogin = new Date();
  await this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model('User', userSchema);
