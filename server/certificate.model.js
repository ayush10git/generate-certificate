const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    course: {
      type: String,
      required: true,
    },
    driveUrl: {
        type: String,
        required: true
    },
    date: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const UserCertificateDetails = mongoose.model("UserCertificate", certificateSchema);

module.exports = UserCertificateDetails;