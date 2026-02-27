const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    rent: {
      type: Number,
      required: [true, "Rent is required"],
      min: [0, "Rent cannot be negative"],
    },
    deposit: {
      type: Number,
      default: 0,
      min: [0, "Deposit cannot be negative"],
    },
    area: {
      type: String,
      required: [true, "Area is required"],
      trim: true,
    },
    bhkType: {
      type: String,
      trim: true,
      enum: ["1BHK", "2BHK", "3BHK", "4BHK", "Studio", "PG Room", "Other"],
      default: "Other",
    },
    landmark: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (v) {
          return v.length <= 5;
        },
        message: "Maximum 5 images allowed",
      },
    },
    contactNumber: {
      type: String,
      trim: true,
      match: [/^\d{10}$/, "Contact number must be exactly 10 digits"],
      default: "",
    },
    bestFor: {
      type: String,
      trim: true,
      enum: ["Families", "Students", "Working Professionals", "Bachelors", "Any", ""],
      default: "Any",
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Text index for search
propertySchema.index({ title: "text", area: "text", description: "text" });

module.exports = mongoose.model("Property", propertySchema);
