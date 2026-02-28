// src/utils/stockItemInitializer.js
const { AppDataSource } = require("../main/db/datasource");
const Product = require("../entities/Product");
const Warehouse = require("../entities/Warehouse");
const StockItem = require("../entities/StockItem");

const CHUNK_SIZE = 1000; // Number of inserts per batch

/**
 * Ensures that every active product (and its active variants) has a stock item
 * in every active warehouse. Missing stock items are created with default values.
 */
async function initializeMissingStockItems() {
  console.log("[StockItemInitializer] Starting missing stock items check...");

  if (!AppDataSource.isInitialized) {
    console.warn("[StockItemInitializer] Database not initialized, skipping.");
    return;
  }

  const startTime = Date.now();

  try {
    // Get repositories
    const warehouseRepo = AppDataSource.getRepository(Warehouse);
    const productRepo = AppDataSource.getRepository(Product);
    const stockItemRepo = AppDataSource.getRepository(StockItem);

    // 1. Fetch all active warehouses
    const warehouses = await warehouseRepo.find({
      where: { is_deleted: false },
      select: ["id"],
    });
    if (warehouses.length === 0) {
      console.log("[StockItemInitializer] No active warehouses found. Exiting.");
      return;
    }

    // 2. Fetch all active products with their active variants
    const products = await productRepo
      .createQueryBuilder("product")
      .leftJoinAndSelect(
        "product.variants",
        "variant",
        "variant.is_deleted = false AND variant.is_active = true"
      )
      .where("product.is_deleted = false AND product.is_active = true")
      .select(["product.id", "variant.id"])
      .getMany();

    if (products.length === 0) {
      console.log("[StockItemInitializer] No active products found. Exiting.");
      return;
    }

    // 3. Build a Set of existing stock item keys (productId:variantId:warehouseId)
    //    We include ALL stock items regardless of product/variant status to avoid duplicates.
    const existingStockItems = await stockItemRepo.find({
      select: ["productId", "variantId", "warehouseId"],
    });

    const existingSet = new Set();
    existingStockItems.forEach((item) => {
      const key = `${item.productId}:${item.variantId || "null"}:${item.warehouseId}`;
      existingSet.add(key);
    });

    // 4. Collect missing stock items
    const toInsert = [];

    for (const product of products) {
      if (product.variants && product.variants.length > 0) {
        // Product has variants → create stock items for each variant
        for (const variant of product.variants) {
          for (const warehouse of warehouses) {
            const key = `${product.id}:${variant.id}:${warehouse.id}`;
            if (!existingSet.has(key)) {
              toInsert.push({
                productId: product.id,
                variantId: variant.id,
                warehouseId: warehouse.id,
                quantity: 0,
                reorder_level: 0,
                low_stock_threshold: null,
                created_at: new Date(),
                updated_at: new Date(),
                is_deleted: false,
              });
            }
          }
        }
      } else {
        // Product without variants → create stock item for the product itself
        for (const warehouse of warehouses) {
          const key = `${product.id}:null:${warehouse.id}`;
          if (!existingSet.has(key)) {
            toInsert.push({
              productId: product.id,
              variantId: null,
              warehouseId: warehouse.id,
              quantity: 0,
              reorder_level: 0,
              low_stock_threshold: null,
              created_at: new Date(),
              updated_at: new Date(),
              is_deleted: false,
            });
          }
        }
      }
    }

    // 5. Bulk insert in chunks
    if (toInsert.length > 0) {
      console.log(`[StockItemInitializer] Inserting ${toInsert.length} missing stock items...`);
      for (let i = 0; i < toInsert.length; i += CHUNK_SIZE) {
        const chunk = toInsert.slice(i, i + CHUNK_SIZE);
        await stockItemRepo.insert(chunk);
      }
      console.log(`[StockItemInitializer] Successfully inserted ${toInsert.length} stock items.`);
    } else {
      console.log("[StockItemInitializer] No missing stock items found.");
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[StockItemInitializer] Completed in ${duration}s.`);
  } catch (error) {
    console.error("[StockItemInitializer] Error:", error);
    // Log but do not rethrow – this is a background task
  }
}

module.exports = { initializeMissingStockItems };