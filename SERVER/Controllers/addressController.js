const Address = require("../Models/Address");

const addAddress = async (req, res) => {
  try {
    const { user_id, fullName, phone, pinCode, state, city, houseNo, roadName } =
      req.body;

    if (
      !user_id ||
      !fullName ||
      !phone ||
      !pinCode ||
      !state ||
      !city ||
      !houseNo ||
      !roadName
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const address = await Address.create({
      user_id,
      fullName,
      phone,
      pinCode,
      state,
      city,
      houseNo,
      roadName,
    });

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      data: address,
    });
  } catch (error) {
    console.error("Error adding address:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getAddressesByUser = async (req, res) => {
  try {
    const user_id = Number(req.params.user_id);

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }

    const addresses = await Address.find({ user_id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    console.error("Error getting addresses:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getAddressById = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findById(id);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: address,
    });
  } catch (error) {
    console.error("Error getting address:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, phone, pinCode, state, city, houseNo, roadName } =
      req.body;

    const address = await Address.findById(id);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    if (fullName !== undefined) address.fullName = fullName;
    if (phone !== undefined) address.phone = phone;
    if (pinCode !== undefined) address.pinCode = pinCode;
    if (state !== undefined) address.state = state;
    if (city !== undefined) address.city = city;
    if (houseNo !== undefined) address.houseNo = houseNo;
    if (roadName !== undefined) address.roadName = roadName;

    const updated = await address.save();

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating address:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findById(id);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    await address.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting address:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  addAddress,
  getAddressesByUser,
  getAddressById,
  updateAddress,
  deleteAddress,
};
