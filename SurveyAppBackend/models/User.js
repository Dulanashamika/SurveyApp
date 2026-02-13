const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  pin: {
    type: String,
    default: null
  },
  name: {
    type: String,
    default: ''
  },
  firstName: {
    type: String,
    default: ''
  },
  lastName: {
    type: String,
    default: ''
  },
  nameWithInitials: {
    type: String,
    default: ''
  },
  mobileNumber: {
    type: String,
    default: ''
  },
  designation: {
    type: String,
    default: ''
  },
  institute: {
    type: String,
    default: ''
  },
  instituteAddress: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    default: ''
  },
  surveyTypes: [{
    type: String
  }],
  researchAreas: [{
    type: String
  }],
  periodicalCategories: [{
    type: String
  }],
  area: {
    type: String,
    default: ''
  },
  profileImage: {
    type: String,
    default: ''
  },
  isGoogleLogin: {
    type: Boolean,
    default: false
  },
  emailConfirmed: {
    type: Boolean,
    default: false
  },
  confirmationCode: {
    type: String,
    default: null
  },
  codeExpiresAt: {
    type: Date,
    default: null
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  fingerPrintEnabled: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deleteRequestDate: {
    type: Date,
    default: null
  },
  teamMembers: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);
