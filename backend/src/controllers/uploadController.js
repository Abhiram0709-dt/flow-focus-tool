import cloudinary from "../config/cloudinary.js";

export const uploadMedia = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const uploadResult = await cloudinary.uploader.upload(file.path, {
      resource_type: "video",
      folder: "communication-coach",
    });

    return res.status(201).json({ mediaUrl: uploadResult.secure_url });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Upload error", error);
    return res
      .status(500)
      .json({ message: "Failed to upload media", error: String(error) });
  }
};

