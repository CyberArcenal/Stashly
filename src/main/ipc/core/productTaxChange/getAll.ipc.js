// src/main/ipc/productTaxChange/getAll.ipc.js
const productTaxChangeService = require("../../../../services/ProductTaxChange");

module.exports = async (params) => {
  try {
    const { productId, variantId, page, limit, sortBy, sortOrder, search } = params;

    const options = {
      productId,
      variantId,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      sortBy: sortBy || "changed_at",
      sortOrder: sortOrder || "DESC",
      search,
    };

    const result = await productTaxChangeService.findAll(options);

    return {
      status: true,
      message: "Product tax changes retrieved successfully",
      data: result.data,
      pagination: result.pagination,
    };
  } catch (error) {
    console.error("Error in getAllProductTaxChanges:", error);
    return {
      status: false,
      message: error.message || "Failed to retrieve product tax changes",
      data: null,
    };
  }
};