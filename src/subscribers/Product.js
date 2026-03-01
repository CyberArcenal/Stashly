// src/subscribers/ProductSubscriber.js
// @ts-check
const Product = require("../entities/Product");
const Warehouse = require("../entities/Warehouse");
const StockItem = require("../entities/StockItem");
const { AppDataSource } = require("../main/db/datasource");
const { logger } = require("../utils/logger");
const { TaxStateTransitionService } = require("../stateTransitionServices/Tax");

console.log("[Subscriber] Loading ProductSubscriber");

class ProductSubscriber {
  listenTo() {
    return Product;
  }

  /**
   * @param {any} entity
   */
  async beforeInsert(entity) {
    try {
      // @ts-ignore
      logger.info("[ProductSubscriber] beforeInsert", {
        entity: JSON.parse(JSON.stringify(entity)),
      });
    } catch (err) {
      // @ts-ignore
      logger.error("[ProductSubscriber] beforeInsert error", err);
    }
  }

  /**
   * @param {{ id: any; }} entity
   */
  async afterInsert(entity) {
    const { saveDb } = require("../utils/dbUtils/dbActions");
    try {
      // @ts-ignore
      logger.info("[ProductSubscriber] afterInsert", {
        entity: JSON.parse(JSON.stringify(entity)),
      });

      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }

      const warehouseRepo = AppDataSource.getRepository(Warehouse);
      const stockItemRepo = AppDataSource.getRepository(StockItem);

      const warehouses = await warehouseRepo.find({
        where: { is_deleted: false, is_active: true },
      });

      for (const warehouse of warehouses) {
        const existing = await stockItemRepo.findOne({
          where: {
            // @ts-ignore
            product: { id: entity.id },
            variant: null,
            warehouse: { id: warehouse.id },
          },
        });

        if (!existing) {
          const stockItem = stockItemRepo.create({
            // @ts-ignore
            product: entity,
            warehouse,
            quantity: 0,
            reorder_level: 0,
            low_stock_threshold: null,
          });
          // @ts-ignore
          await saveDb(stockItemRepo, stockItem);
          logger.info(
            `[ProductSubscriber] Created StockItem for product ${entity.id} in warehouse ${warehouse.id}`,
          );
        }
      }
    } catch (err) {
      // @ts-ignore
      logger.error("[ProductSubscriber] afterInsert error", err);
    }
  }

  /**
   * @param {any} entity
   */
  async beforeUpdate(entity) {
    try {
      // @ts-ignore
      logger.info("[ProductSubscriber] beforeUpdate", {
        entity: JSON.parse(JSON.stringify(entity)),
      });
    } catch (err) {
      // @ts-ignore
      logger.error("[ProductSubscriber] beforeUpdate error", err);
    }
  }

  // @ts-ignore
 async afterUpdate(event) {
    try {
      const { databaseEntity: oldEntity, entity: newEntity } = event;

      // Need to load full relations
      const productRepo = AppDataSource.getRepository(Product);
      const oldProduct = await productRepo.findOne({
        where: { id: oldEntity.id },
        relations: ["taxes"]
      });

      const newProduct = await productRepo.findOne({
        where: { id: newEntity.id },
        relations: ["taxes"]
      });

      if (!oldProduct || !newProduct) return;

      // @ts-ignore
      const oldTaxIds = (oldProduct.taxes || []).map(t => t.id).sort();
      // @ts-ignore
      const newTaxIds = (newProduct.taxes || []).map(t => t.id).sort();

      if (JSON.stringify(oldTaxIds) !== JSON.stringify(newTaxIds)) {
        logger.info(`[ProductSubscriber] Taxes changed for product ${newEntity.id}`);

        const transitionService = new TaxStateTransitionService(AppDataSource);
        await transitionService.onTaxesChanged(
          newProduct,
          // @ts-ignore
          oldProduct.taxes || [],
          // @ts-ignore
          newProduct.taxes || [],
          "system",
          { reason: "Product taxes updated via product edit" }
        );
      }
    } catch (err) {
      // @ts-ignore
      logger.error('[ProductSubscriber] afterUpdate error', err);
    }
  }

  /**
   * @param {any} entity
   */
  async beforeRemove(entity) {
    try {
      // @ts-ignore
      logger.info("[ProductSubscriber] beforeRemove", {
        entity: JSON.parse(JSON.stringify(entity)),
      });
    } catch (err) {
      // @ts-ignore
      logger.error("[ProductSubscriber] beforeRemove error", err);
    }
  }

  /**
   * @param {any} event
   */
  async afterRemove(event) {
    try {
      // @ts-ignore
      logger.info("[ProductSubscriber] afterRemove", {
        event: JSON.parse(JSON.stringify(event)),
      });
    } catch (err) {
      // @ts-ignore
      logger.error("[ProductSubscriber] afterRemove error", err);
    }
  }
}

module.exports = ProductSubscriber;
