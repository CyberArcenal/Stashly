// services/ProductTaxChange.js
const auditLogger = require("../utils/auditLogger");

class ProductTaxChangeService {
  constructor() {
    this.repository = null;
  }

  async initialize() {
    const { AppDataSource } = require("../main/db/datasource");
    const ProductTaxChange = require("../entities/ProductTaxChange");
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    this.repository = AppDataSource.getRepository(ProductTaxChange);
    console.log("ProductTaxChangeService initialized");
  }

  async getRepository() {
    if (!this.repository) {
      await this.initialize();
    }
    return this.repository;
  }

  /**
   * Create a tax change record for a product or variant.
   * @param {Object} data
   * @param {number} [data.productId]
   * @param {number} [data.variantId]
   * @param {number[]} [data.old_tax_ids]
   * @param {number[]} [data.new_tax_ids]
   * @param {number} [data.old_gross_price]
   * @param {number} [data.new_gross_price]
   * @param {string} data.changed_by
   * @param {string} [data.reason]
   */
  async create(data, user = "system") {
    const { saveDb } = require("../utils/dbUtils/dbActions");
    const repo = await this.getRepository();

    const hasProduct = data.productId !== undefined && data.productId !== null;
    const hasVariant = data.variantId !== undefined && data.variantId !== null;
    if ((hasProduct && hasVariant) || (!hasProduct && !hasVariant)) {
      throw new Error("Exactly one of productId or variantId must be provided");
    }

    try {
      const changeData = {
        productId: data.productId || null,
        variantId: data.variantId || null,
        old_tax_ids: data.old_tax_ids || null,
        new_tax_ids: data.new_tax_ids || null,
        old_gross_price: data.old_gross_price || null,
        new_gross_price: data.new_gross_price || null,
        changed_by: data.changed_by || user,
        reason: data.reason || null,
        changed_at: new Date(),
      };
      const change = repo.create(changeData);
      const saved = await saveDb(repo, change);
      await auditLogger.logCreate("ProductTaxChange", saved.id, saved, user);
      return saved;
    } catch (error) {
      console.error("Failed to create tax change:", error.message);
      throw error;
    }
  }

  /**
   * Find all tax changes with optional filters and pagination.
   * @param {Object} options
   */
  async findAll(options = {}) {
    const repo = await this.getRepository();
    try {
      const qb = repo
        .createQueryBuilder("ptc")
        .leftJoinAndSelect("ptc.product", "product")
        .leftJoinAndSelect("ptc.variant", "variant")
        .orderBy("ptc.changed_at", options.sortOrder === "ASC" ? "ASC" : "DESC");

      if (options.productId) {
        qb.andWhere("ptc.productId = :productId", { productId: options.productId });
      }
      if (options.variantId) {
        qb.andWhere("ptc.variantId = :variantId", { variantId: options.variantId });
      }
      if (options.search) {
        qb.andWhere(
          "(product.name LIKE :search OR variant.name LIKE :search OR ptc.reason LIKE :search)",
          { search: `%${options.search}%` }
        );
      }

      const total = await qb.getCount();

      if (options.limit) qb.take(options.limit);
      if (options.page && options.limit) {
        const skip = (options.page - 1) * options.limit;
        qb.skip(skip);
      }

      const data = await qb.getMany();

      return {
        data,
        pagination: {
          page: options.page || 1,
          limit: options.limit || data.length,
          total,
          totalPages: options.limit ? Math.ceil(total / options.limit) : 1,
        },
      };
    } catch (error) {
      console.error("Failed to fetch product tax changes:", error);
      throw error;
    }
  }

  /**
   * Find tax changes for a specific product.
   * @param {number} productId
   * @param {Object} options
   */
  async findByProduct(productId, options = {}) {
    return this.findAll({ ...options, productId });
  }

  /**
   * Find tax changes for a specific variant.
   * @param {number} variantId
   * @param {Object} options
   */
  async findByVariant(variantId, options = {}) {
    return this.findAll({ ...options, variantId });
  }

  async findById(id) {
    const repo = await this.getRepository();
    try {
      const change = await repo.findOne({
        where: { id },
        relations: ["product", "variant"],
      });
      if (!change) throw new Error(`ProductTaxChange with ID ${id} not found`);
      await auditLogger.logView("ProductTaxChange", id, "system");
      return change;
    } catch (error) {
      console.error("Failed to find tax change:", error.message);
      throw error;
    }
  }

  async delete(id, user = "system") {
    const { removeDb } = require("../utils/dbUtils/dbActions");
    const repo = await this.getRepository();
    try {
      const change = await repo.findOne({ where: { id } });
      if (!change) throw new Error(`ProductTaxChange with ID ${id} not found`);
      await removeDb(repo, change);
      await auditLogger.logDelete("ProductTaxChange", id, change, user);
      return { success: true };
    } catch (error) {
      console.error("Failed to delete tax change:", error.message);
      throw error;
    }
  }
}

const productTaxChangeService = new ProductTaxChangeService();
module.exports = productTaxChangeService;