// src/main/ipc/productTaxChange/create.ipc.js
const productTaxChangeService = require("../../../../services/ProductTaxChange");

module.exports = async (params, queryRunner, user = "system") => {
  try {
    const {
      productId,
      variantId,
      old_tax_ids,
      new_tax_ids,
      old_gross_price,
      new_gross_price,
      reason,
    } = params;

    if (!productId && !variantId) {
      return { status: false, message: "Either productId or variantId is required", data: null };
    }

    const data = {
      productId,
      variantId,
      old_tax_ids,
      new_tax_ids,
      old_gross_price,
      new_gross_price,
      changed_by: user,
      reason,
    };

    const saved = await productTaxChangeService.create(data, user);
    return { status: true, message: "Product tax change logged successfully", data: saved };
  } catch (error) {
    console.error("Error in createProductTaxChange:", error);
    return { status: false, message: error.message, data: null };
  }
};