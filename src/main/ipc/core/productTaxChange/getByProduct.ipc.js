// src/main/ipc/productTaxChange/getByProduct.ipc.js
const productTaxChangeService = require("../../../../services/ProductTaxChange");

module.exports = async (params) => {
  try {
    const { productId, limit, offset, sortOrder } = params;
    if (!productId) return { status: false, message: "productId is required", data: null };

    const options = { productId, limit, offset, sortOrder };
    const result = await productTaxChangeService.findAll(options);
    return {
      status: true,
      message: "Product tax changes retrieved",
      data: result.data,
      pagination: result.pagination,
    };
  } catch (error) {
    console.error("Error in getProductTaxChangesByProduct:", error);
    return { status: false, message: error.message, data: null };
  }
};