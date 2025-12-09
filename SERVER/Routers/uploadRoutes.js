const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { auth, sellerAuth } = require("../Middleware/authMiddleware");

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/upload",
  auth,
  sellerAuth,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file provided" });
      }

      const base64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${base64}`;

      cloudinary.uploader
        .upload(
          dataURI,
          {
            folder: "swiftcart/products",
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary error:", error);
              return res
                .status(500)
                .json({ message: "Cloudinary upload failed", error });
            }

            return res.json({
              url: result.secure_url,
              public_id: result.public_id,
            });
          }
        );
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ message: "Upload failed", error: err.message });
    }
  }
);

module.exports = router;
