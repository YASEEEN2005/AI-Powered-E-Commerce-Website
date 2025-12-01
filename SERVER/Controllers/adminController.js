const Admin = require("../Models/Admin");

const createAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists",
      });
    }

    const admin = await Admin.create({ email, password });

    return res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: {
        id: admin.id,      
        _id: admin._id,     
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    if (admin.password !== password) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: admin.id,
        _id: admin._id,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Error logging in admin:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");
    return res.status(200).json({ success: true, data: admins });
  } catch (error) {
    console.error("Error getting admins:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


const getAdminById = async (req, res) => {
  try {
    const adminId = Number(req.params.id);

    const admin = await Admin.findOne({ id: adminId }).select("-password");

    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    return res.status(200).json({ success: true, data: admin });
  } catch (error) {
    console.error("Error getting admin:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


const updateAdmin = async (req, res) => {
  try {
    const adminId = Number(req.params.id);
    const { email, password } = req.body;

    const updateData = {};
    if (email) updateData.email = email;
    if (password) updateData.password = password;

    const updatedAdmin = await Admin.findOneAndUpdate(
      { id: adminId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedAdmin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Admin updated successfully",
      data: {
        id: updatedAdmin.id,
        _id: updatedAdmin._id,
        email: updatedAdmin.email,
      },
    });
  } catch (error) {
    console.error("Error updating admin:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


const deleteAdmin = async (req, res) => {
  try {
    const adminId = Number(req.params.id);

    const deletedAdmin = await Admin.findOneAndDelete({ id: adminId });

    if (!deletedAdmin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Admin deleted successfully" });
  } catch (error) {
    console.error("Error deleting admin:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


module.exports = {
  createAdmin,
  loginAdmin,
  getAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
};
