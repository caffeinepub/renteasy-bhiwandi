const express = require("express");
const router = express.Router();
const { body, query, validationResult } = require("express-validator");
const Property = require("../models/Property");
const { protect, restrictTo } = require("../middleware/auth");
const upload = require("../middleware/upload");

// @route   GET /api/properties
// @desc    Get all available properties with optional filters
// @access  Public
router.get("/", async (req, res) => {
  try {
    const filter = { available: true };

    // Filter by area (case-insensitive partial match)
    if (req.query.area && req.query.area.trim() !== "") {
      filter.area = { $regex: req.query.area.trim(), $options: "i" };
    }

    // Filter by minimum rent
    if (req.query.minRent && !isNaN(Number(req.query.minRent))) {
      filter.rent = { ...filter.rent, $gte: Number(req.query.minRent) };
    }

    // Filter by maximum rent
    if (req.query.maxRent && !isNaN(Number(req.query.maxRent))) {
      filter.rent = { ...filter.rent, $lte: Number(req.query.maxRent) };
    }

    // Filter by BHK type
    if (req.query.bhkType && req.query.bhkType.trim() !== "") {
      filter.bhkType = req.query.bhkType.trim();
    }

    // Filter by bestFor
    if (req.query.bestFor && req.query.bestFor.trim() !== "") {
      filter.bestFor = req.query.bestFor.trim();
    }

    const properties = await Property.find(filter)
      .populate("ownerId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (err) {
    console.error("Get properties error:", err);
    res.status(500).json({ success: false, message: "Server error fetching properties." });
  }
});

// @route   GET /api/properties/count
// @desc    Get total count of available properties
// @access  Public
router.get("/count", async (req, res) => {
  try {
    const count = await Property.countDocuments({ available: true });
    res.status(200).json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// @route   GET /api/properties/my
// @desc    Get all properties of the logged-in owner
// @access  Private (owner only)
router.get("/my", protect, restrictTo("owner"), async (req, res) => {
  try {
    const properties = await Property.find({ ownerId: req.user._id }).sort({ createdAt: -1 });
    const totalCount = properties.length;
    const availableCount = properties.filter((p) => p.available).length;

    res.status(200).json({
      success: true,
      count: totalCount,
      availableCount,
      ownerName: req.user.name,
      data: properties,
    });
  } catch (err) {
    console.error("Get my properties error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// @route   GET /api/properties/:id
// @desc    Get a single property by ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      "ownerId",
      "name email"
    );

    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found." });
    }

    res.status(200).json({ success: true, data: property });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ success: false, message: "Property not found." });
    }
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// @route   POST /api/properties
// @desc    Create a new property listing
// @access  Private (owner only)
router.post(
  "/",
  protect,
  restrictTo("owner"),
  upload.array("images", 5),
  [
    body("title")
      .trim()
      .notEmpty().withMessage("Title is required")
      .isLength({ min: 5, max: 100 }).withMessage("Title must be 5-100 characters"),
    body("rent")
      .notEmpty().withMessage("Rent is required")
      .isNumeric().withMessage("Rent must be a number")
      .custom((v) => Number(v) >= 0).withMessage("Rent cannot be negative"),
    body("area")
      .trim()
      .notEmpty().withMessage("Area is required"),
    body("deposit")
      .optional()
      .isNumeric().withMessage("Deposit must be a number")
      .custom((v) => Number(v) >= 0).withMessage("Deposit cannot be negative"),
    body("contactNumber")
      .optional()
      .matches(/^\d{10}$/).withMessage("Contact number must be exactly 10 digits"),
    body("bhkType")
      .optional()
      .isIn(["1BHK", "2BHK", "3BHK", "4BHK", "Studio", "PG Room", "Other"])
      .withMessage("Invalid BHK type"),
    body("bestFor")
      .optional()
      .isIn(["Families", "Students", "Working Professionals", "Bachelors", "Any", ""])
      .withMessage("Invalid bestFor value"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Remove any uploaded files on validation error
      if (req.files && req.files.length > 0) {
        const fs = require("fs");
        req.files.forEach((file) => {
          try { fs.unlinkSync(file.path); } catch (_) {}
        });
      }
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }

    try {
      const images = req.files ? req.files.map((f) => f.filename) : [];

      const property = await Property.create({
        ownerId: req.user._id,
        title: req.body.title,
        rent: Number(req.body.rent),
        deposit: req.body.deposit ? Number(req.body.deposit) : 0,
        area: req.body.area,
        bhkType: req.body.bhkType || "Other",
        landmark: req.body.landmark || "",
        description: req.body.description || "",
        images,
        contactNumber: req.body.contactNumber || "",
        bestFor: req.body.bestFor || "Any",
      });

      res.status(201).json({ success: true, data: property });
    } catch (err) {
      console.error("Create property error:", err);
      res.status(500).json({ success: false, message: "Server error creating property." });
    }
  }
);

// @route   DELETE /api/properties/:id
// @desc    Delete a property (owner only, must own it)
// @access  Private (owner only)
router.delete("/:id", protect, restrictTo("owner"), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found." });
    }

    // Ensure the logged-in owner owns this property
    if (property.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this property.",
      });
    }

    // Delete associated images from disk
    const fs = require("fs");
    const path = require("path");
    property.images.forEach((filename) => {
      const filePath = path.join(__dirname, "../public/uploads", filename);
      try { fs.unlinkSync(filePath); } catch (_) {}
    });

    await property.deleteOne();

    res.status(200).json({ success: true, message: "Property deleted successfully." });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ success: false, message: "Property not found." });
    }
    console.error("Delete property error:", err);
    res.status(500).json({ success: false, message: "Server error deleting property." });
  }
});

module.exports = router;
