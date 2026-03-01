// src/main/ipc/productTaxChange/getById.ipc.js
const productTaxChangeService = require("../../../../services/ProductTaxChange");

module.exports = async (params) => {
  try {
    const { id } = params;
    if (!id) return { status: false, message: "id is required", data: null };

    const change = await productTaxChangeService.findById(id);
    return { status: true, message: "Product tax change retrieved", data: change };
  } catch (error) {
    console.error("Error in getProductTaxChangeById:", error);
    return { status: false, message: error.message, data: null };
  }
};