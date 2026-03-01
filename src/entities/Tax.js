// entities/Tax.js
const { EntitySchema } = require("typeorm");

const Tax = new EntitySchema({
  name: "Tax",
  tableName: "taxes",
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    name: {
      type: String,
      nullable: false,
      comment: "Display name of the tax, e.g. 'VAT 12%'",
    },
    code: {
      type: String,
      nullable: false,
      unique: true,
      comment: "Unique code for the tax, e.g. 'vat', 'sales_tax', 'import_duty'",
    },
    rate: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: false,
      comment: "Tax rate – for percentage this is percent, for fixed it's amount",
    },
    type: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
      nullable: false,
      comment: "Whether the tax is a percentage of the price or a fixed amount",
    },
    is_enabled: {
      type: Boolean,
      default: true,
      nullable: false,
    },
    is_default: {
      type: Boolean,
      default: false,
      nullable: false,
      comment: "If true, this tax will be automatically assigned to new products",
    },
    description: {
      type: String,
      nullable: true,
    },
    created_at: {
      type: Date,
      default: () => "CURRENT_TIMESTAMP",
      nullable: false,
    },
    updated_at: {
      type: Date,
      default: () => "CURRENT_TIMESTAMP",
      nullable: false,
    },
    is_deleted: {
      type: Boolean,
      default: false,
      nullable: false,
    },
  },
  indices: [
    {
      name: "IDX_TAX_CODE",
      columns: ["code"],
      unique: true,
    },
  ],
});

module.exports = Tax;