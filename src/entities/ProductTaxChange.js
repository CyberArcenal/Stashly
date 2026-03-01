// entities/ProductTaxChange.js (or TaxChange.js)
const { EntitySchema } = require("typeorm");

const ProductTaxChange = new EntitySchema({
  name: "ProductTaxChange",
  tableName: "product_tax_changes",
  columns: {
    id: { type: Number, primary: true, generated: true },
    productId: { type: Number, nullable: true },
    variantId: { type: Number, nullable: true },
    old_tax_ids: { type: "simple-json", nullable: true }, // array of tax IDs
    new_tax_ids: { type: "simple-json", nullable: true }, // array of tax IDs
    old_gross_price: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: true,
    },
    new_gross_price: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: true,
    },
    changed_by: { type: String, nullable: false },
    changed_at: {
      type: Date,
      default: () => "CURRENT_TIMESTAMP",
      nullable: false,
    },
    reason: { type: String, nullable: true },
  },
  relations: {
    product: {
      target: "Product",
      type: "many-to-one",
      joinColumn: { name: "productId" },
      onDelete: "CASCADE",
    },
    variant: {
      target: "ProductVariant",
      type: "many-to-one",
      joinColumn: { name: "variantId" },
      onDelete: "CASCADE",
    },
  },
});

module.exports = ProductTaxChange;
