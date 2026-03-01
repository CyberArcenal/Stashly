// src/main/ipc/tax/get/by_id.ipc.js
const taxService = require("../../../../../services/Tax");

module.exports = async (params) => {
  try {
    const { id } = params;

    if (!id || isNaN(id) || id <= 0) {
      return {
        status: false,
        message: "Invalid tax ID",
        data: null,
      };
    }

    const tax = await taxService.findById(Number(id));

    return {
      status: true,
      message: "Tax retrieved successfully",
      data: tax,
    };
  } catch (error) {
    console.error("Error in getTaxById:", error);
    return {
      status: false,
      message: error.message || "Failed to retrieve tax",
      data: null,
    };
  }
};