// services/ProductService.js
//@ts-check
const auditLogger = require("../utils/auditLogger");

class ProductService {
  constructor() {
    this.productRepository = null;
    this.categoryRepository = null;
    this.stockItemRepository = null;
    this.stockMovementRepository = null;
  }

  async initialize() {
    const { AppDataSource } = require("../main/db/datasource");
    const Product = require("../entities/Product");
    const Category = require("../entities/Category");
    const StockItem = require("../entities/StockItem");
    const StockMovement = require("../entities/StockMovement");

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    this.productRepository = AppDataSource.getRepository(Product);
    this.categoryRepository = AppDataSource.getRepository(Category);
    this.stockItemRepository = AppDataSource.getRepository(StockItem);
    this.stockMovementRepository = AppDataSource.getRepository(StockMovement);
    console.log("ProductService initialized");
  }

  async getRepositories() {
    if (!this.productRepository) {
      await this.initialize();
    }
    return {
      product: this.productRepository,
      category: this.categoryRepository,
      stockItem: this.stockItemRepository,
      stockMovement: this.stockMovementRepository,
    };
  }

  /**
   * Create a new product
   * @param {Object} data
   * @param {string} user
   */
  async create(data, user = "system") {
    const {
      saveDb,
      // @ts-ignore
      updateDb,
      // @ts-ignore
      removeDb,
    } = require("../utils/dbUtils/dbActions");
    const { product: repo, category: categoryRepo } =
      await this.getRepositories();

    try {
      // Validate required fields
      // @ts-ignore
      if (!data.name) throw new Error("Product name is required");
      // @ts-ignore
      if (!data.sku) throw new Error("SKU is required");

      // Check SKU uniqueness
      // @ts-ignore
      const existing = await repo.findOne({ where: { sku: data.sku } });
      if (existing)
        // @ts-ignore
        throw new Error(`Product with SKU "${data.sku}" already exists`);

      // Generate slug if not provided
      // @ts-ignore
      if (!data.slug) {
        // @ts-ignore
        data.slug = data.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      }

      // Handle category relation
      let category = null;
      // @ts-ignore
      if (data.categoryId) {
        // @ts-ignore
        category = await categoryRepo.findOne({
          // @ts-ignore
          where: { id: data.categoryId },
        });
        if (!category)
          // @ts-ignore
          throw new Error(`Category with ID ${data.categoryId} not found`);
        // @ts-ignore
        delete data.categoryId;
      }

      const productData = { ...data, category };
      // @ts-ignore
      const product = repo.create(productData);
      // @ts-ignore
      const saved = await saveDb(repo, product);
      // @ts-ignore
      await auditLogger.logCreate("Product", saved.id, saved, user);
      return saved;
    } catch (error) {
      // @ts-ignore
      console.error("Failed to create product:", error.message);
      throw error;
    }
  }

  /**
   * Update a product
   * @param {number} id
   * @param {Object} data
   * @param {string} user
   */
  async update(id, data, user = "system") {
    const {
      // @ts-ignore
      saveDb,
      updateDb,
      // @ts-ignore
      removeDb,
    } = require("../utils/dbUtils/dbActions");
    const { product: repo, category: categoryRepo } =
      await this.getRepositories();

    try {
      // @ts-ignore
      const existing = await repo.findOne({ where: { id } });
      if (!existing) throw new Error(`Product with ID ${id} not found`);
      const oldData = { ...existing };

      // Check SKU uniqueness if changed
      // @ts-ignore
      if (data.sku && data.sku !== existing.sku) {
        // @ts-ignore
        const skuExists = await repo.findOne({ where: { sku: data.sku } });
        if (skuExists)
          // @ts-ignore
          throw new Error(`Product with SKU "${data.sku}" already exists`);
      }

      // Handle category update
      // @ts-ignore
      if (data.categoryId !== undefined) {
        // @ts-ignore
        if (data.categoryId === null) {
          // @ts-ignore
          existing.category = null;
        } else {
          // @ts-ignore
          const category = await categoryRepo.findOne({
            // @ts-ignore
            where: { id: data.categoryId },
          });
          if (!category)
            // @ts-ignore
            throw new Error(`Category with ID ${data.categoryId} not found`);
          // @ts-ignore
          existing.category = category;
        }
        // @ts-ignore
        delete data.categoryId;
      }

      Object.assign(existing, data);
      existing.updated_at = new Date();

      // @ts-ignore
      const saved = await updateDb(repo, existing);
      await auditLogger.logUpdate("Product", id, oldData, saved, user);
      return saved;
    } catch (error) {
      // @ts-ignore
      console.error("Failed to update product:", error.message);
      throw error;
    }
  }

  /**
   * Soft delete a product (set is_deleted = true)
   * @param {number} id
   * @param {string} user
   */
  async delete(id, user = "system") {
    const {
      // @ts-ignore
      saveDb,
      updateDb,
      // @ts-ignore
      removeDb,
    } = require("../utils/dbUtils/dbActions");
    const { product: repo } = await this.getRepositories();

    try {
      // @ts-ignore
      const product = await repo.findOne({ where: { id } });
      if (!product) throw new Error(`Product with ID ${id} not found`);
      if (product.is_deleted)
        throw new Error(`Product #${id} is already deleted`);

      const oldData = { ...product };
      product.is_deleted = true;
      product.updated_at = new Date();

      // @ts-ignore
      const saved = await updateDb(repo, product);
      await auditLogger.logDelete("Product", id, oldData, user);
      return saved;
    } catch (error) {
      // @ts-ignore
      console.error("Failed to delete product:", error.message);
      throw error;
    }
  }

  /**
   * Find product by ID
   * @param {number} id
   */
  async findById(id) {
    const { product: repo } = await this.getRepositories();

    try {
      // @ts-ignore
      const product = await repo.findOne({
        where: { id, is_deleted: false },
        relations: ["category", "variants", "images"],
      });
      if (!product) throw new Error(`Product with ID ${id} not found`);
      await auditLogger.logView("Product", id, "system");
      return product;
    } catch (error) {
      // @ts-ignore
      console.error("Failed to find product:", error.message);
      throw error;
    }
  }

  /**
   * Find all products with filters
   * @param {Object} options
   */
  async findAll(options = {}) {
    const { product: repo } = await this.getRepositories();

    try {
      // @ts-ignore
      const qb = repo
        .createQueryBuilder("product")
        .leftJoinAndSelect("product.category", "category")
          .leftJoinAndSelect("product.variants", "variants")
        .leftJoinAndSelect("product.stockItems", "stockItems")
        .where("product.is_deleted = :isDeleted", { isDeleted: false });

      // @ts-ignore
      if (options.is_active !== undefined) {
        qb.andWhere("product.is_active = :isActive", {
          // @ts-ignore
          isActive: options.is_active,
        });
      }
      // @ts-ignore
      if (options.categoryId) {
        qb.andWhere("category.id = :categoryId", {
          // @ts-ignore
          categoryId: options.categoryId,
        });
      }
      // @ts-ignore
      if (options.search) {
        qb.andWhere(
          "(product.name LIKE :search OR product.sku LIKE :search OR product.barcode LIKE :search)",
          // @ts-ignore
          { search: `%${options.search}%` },
        );
      }
      // @ts-ignore
      if (options.minPrice !== undefined) {
        qb.andWhere("product.net_price >= :minPrice", {
          // @ts-ignore
          minPrice: options.minPrice,
        });
      }
      // @ts-ignore
      if (options.maxPrice !== undefined) {
        qb.andWhere("product.net_price <= :maxPrice", {
          // @ts-ignore
          maxPrice: options.maxPrice,
        });
      }

      // Sorting
      // @ts-ignore
      const sortBy = options.sortBy || "created_at";
      // @ts-ignore
      const sortOrder = options.sortOrder === "ASC" ? "ASC" : "DESC";
      qb.orderBy(`product.${sortBy}`, sortOrder);

      // Pagination
      // @ts-ignore
      if (options.page && options.limit) {
        // @ts-ignore
        const skip = (options.page - 1) * options.limit;
        // @ts-ignore
        qb.skip(skip).take(options.limit);
      }

      const products = await qb.getMany();
      // @ts-ignore
      await auditLogger.logView("Product", null, "system");
      return products;
    } catch (error) {
      console.error("Failed to fetch products:", error);
      throw error;
    }
  }

  /**
   * Update stock for a product (creates StockItem if not exists)
   * @param {number} productId
   * @param {number} warehouseId
   * @param {number} quantityChange
   * @param {string} movementType
   * @param {string} referenceCode
   * @param {string} [reason]
   * @param {string} user
   */
  async updateStock(
    productId,
    warehouseId,
    quantityChange,
    movementType,
    referenceCode,
    // @ts-ignore
    reason = null,
    user = "system",
  ) {
    const {
      saveDb,
      updateDb,
      // @ts-ignore
      removeDb,
    } = require("../utils/dbUtils/dbActions");
    const {
      product: productRepo,
      stockItem: stockItemRepo,
      stockMovement: movementRepo,
    } = await this.getRepositories();

    try {
      // @ts-ignore
      const product = await productRepo.findOne({
        where: { id: productId, is_deleted: false },
      });
      if (!product) throw new Error(`Product with ID ${productId} not found`);

      // Find or create StockItem
      // @ts-ignore
      let stockItem = await stockItemRepo.findOne({
        where: {
          // @ts-ignore
          product: { id: productId },
          warehouse: { id: warehouseId },
          variant: null, // assuming no variant for simplicity
          is_deleted: false,
        },
        relations: ["warehouse"],
      });

      if (!stockItem) {
        // Create new stock item
        // @ts-ignore
        stockItem = stockItemRepo.create({
          // @ts-ignore
          product,
          warehouse: { id: warehouseId },
          quantity: 0,
          reorder_level: 0,
          low_stock_threshold: null,
        });
        // @ts-ignore
        stockItem = await saveDb(stockItemRepo, stockItem);
      }

      const oldQty = stockItem.quantity;
      // @ts-ignore
      const newQty = oldQty + quantityChange;
      if (newQty < 0)
        throw new Error(
          `Insufficient stock. Current: ${oldQty}, change: ${quantityChange}`,
        );

      stockItem.quantity = newQty;
      stockItem.updated_at = new Date();
      // @ts-ignore
      const updatedStock = await updateDb(stockItemRepo, stockItem);

      // Create stock movement
      // @ts-ignore
      const movement = movementRepo.create({
        // @ts-ignore
        stockItem: updatedStock,
        warehouse: { id: warehouseId },
        change: quantityChange,
        movement_type: movementType,
        reference_code: referenceCode,
        reason,
        current_quantity: newQty,
        metadata: null,
      });
      // @ts-ignore
      const savedMovement = await saveDb(movementRepo, movement);

      await auditLogger.logUpdate(
        "StockItem",
        // @ts-ignore
        updatedStock.id,
        { quantity: oldQty },
        { quantity: newQty },
        user,
      );
      await auditLogger.logCreate(
        "StockMovement",
        // @ts-ignore
        savedMovement.id,
        savedMovement,
        user,
      );

      return { stockItem: updatedStock, movement: savedMovement };
    } catch (error) {
      // @ts-ignore
      console.error("Failed to update stock:", error.message);
      throw error;
    }
  }

  /**
   * Get products with low stock (based on StockItem threshold)
   * @param {number} [threshold]
   */
  async getLowStock(threshold) {
    const { stockItem: repo } = await this.getRepositories();

    try {
      // @ts-ignore
      const qb = repo
        .createQueryBuilder("stockItem")
        .leftJoinAndSelect("stockItem.product", "product")
        .leftJoinAndSelect("stockItem.warehouse", "warehouse")
        .where("product.is_deleted = false")
        .andWhere("stockItem.is_deleted = false");

      if (threshold !== undefined) {
        qb.andWhere("stockItem.quantity <= :threshold", { threshold });
      } else {
        qb.andWhere(
          "stockItem.quantity <= stockItem.low_stock_threshold OR (stockItem.low_stock_threshold IS NULL AND stockItem.quantity <= stockItem.reorder_level)",
        );
      }

      return await qb.getMany();
    } catch (error) {
      console.error("Failed to get low stock products:", error);
      throw error;
    }
  }

  /**
   * Get product statistics
   */
  async getStatistics() {
    const { product: productRepo, stockItem: stockRepo } =
      await this.getRepositories();

    try {
      // @ts-ignore
      const totalActive = await productRepo.count({
        where: { is_deleted: false, is_active: true },
      });
      // @ts-ignore
      const totalInactive = await productRepo.count({
        where: { is_deleted: false, is_active: false },
      });

      // Total stock value (sum of quantity * cost_per_item across all stock items)
      // @ts-ignore
      const stockValueResult = await stockRepo
        .createQueryBuilder("stockItem")
        .leftJoin("stockItem.product", "product")
        .select("SUM(stockItem.quantity * product.cost_per_item)", "totalValue")
        .where("product.is_deleted = false AND stockItem.is_deleted = false")
        .getRawOne();
      const totalStockValue = parseFloat(stockValueResult.totalValue) || 0;

      // Average price of active products
      // @ts-ignore
      const avgPriceResult = await productRepo
        .createQueryBuilder("product")
        .select("AVG(product.net_price)", "averagePrice")
        .where("product.is_deleted = false AND product.is_active = true")
        .getRawOne();
      const averagePrice = parseFloat(avgPriceResult.averagePrice) || 0;

      // Products with zero stock (through stock items)
      // @ts-ignore
      const zeroStock = await stockRepo
        .createQueryBuilder("stockItem")
        .leftJoin("stockItem.product", "product")
        .where(
          "product.is_deleted = false AND stockItem.is_deleted = false AND stockItem.quantity = 0",
        )
        .getCount();

      return {
        totalActive,
        totalInactive,
        totalStockValue,
        averagePrice,
        zeroStock,
      };
    } catch (error) {
      console.error("Failed to get product statistics:", error);
      throw error;
    }
  }

  /**
   * Export products to CSV/JSON
   * @param {string} format
   * @param {Object} filters
   * @param {string} user
   */
  async exportProducts(format = "json", filters = {}, user = "system") {
    try {
      const products = await this.findAll(filters);
      let exportData;
      if (format === "csv") {
        const headers = [
          "ID",
          "SKU",
          "Name",
          "Description",
          "Net Price",
          "Cost Per Item",
          "Active",
          "Created At",
        ];
        const rows = products.map((p) => [
          p.id,
          p.sku,
          p.name,
          p.description || "",
          p.net_price,
          p.cost_per_item,
          p.is_active ? "Yes" : "No",
          // @ts-ignore
          new Date(p.created_at).toLocaleDateString(),
        ]);
        exportData = {
          format: "csv",
          data: [headers, ...rows].map((row) => row.join(",")).join("\n"),
          filename: `products_export_${new Date().toISOString().split("T")[0]}.csv`,
        };
      } else {
        exportData = {
          format: "json",
          data: products,
          filename: `products_export_${new Date().toISOString().split("T")[0]}.json`,
        };
      }
      await auditLogger.logExport("Product", format, filters, user);
      return exportData;
    } catch (error) {
      console.error("Failed to export products:", error);
      throw error;
    }
  }
}

const productService = new ProductService();
module.exports = productService;
