const productTaxChangeService = require("../../../../services/ProductTaxChange");

module.exports = async (params, queryRunner, user = "system") => {
  try {
    const { id } = params;
    if (!id) return { status: false, message: "id is required", data: null };
    await productTaxChangeService.delete(id, user);
    return { status: true, message: "Product tax change deleted", data: { id } };
  } catch (error) {
    console.error("Error in deleteProductTaxChange:", error);
    return { status: false, message: error.message, data: null };
  }
};