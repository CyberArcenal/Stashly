// src/subscribers/ProductVariantSubscriber.js
// @ts-check
const ProductVariant = require("../entities/ProductVariant");
const Warehouse = require("../entities/Warehouse");
const StockItem = require("../entities/StockItem");
const { AppDataSource } = require("../main/db/datasource");
const { logger } = require("../utils/logger");
const { TaxStateTransitionService } = require("../stateTransitionServices/Tax");

console.log("[Subscriber] Loading ProductVariantSubscriber");

class ProductVariantSubscriber {
  listenTo() {
    return ProductVariant;
  }

  /**
   * @param {any} entity
   */
  async beforeInsert(entity) {
    try {
      // @ts-ignore
      logger.info("[ProductVariantSubscriber] beforeInsert", {
        entity: JSON.parse(JSON.stringify(entity)),
      });
    } catch (err) {
      // @ts-ignore
      logger.error("[ProductVariantSubscriber] beforeInsert error", err);
    }
  }

  /**
   * @param {{ product: { id: any; }; id: null | undefined; }} entity
   */
  async afterInsert(entity) {
    try {
      // @ts-ignore
      logger.info("[ProductVariantSubscriber] afterInsert", {
        entity: JSON.parse(JSON.stringify(entity)),
      });

      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }

      let productId = entity.product?.id;
      if (!productId) {
        const variantRepo = AppDataSource.getRepository(ProductVariant);
        const fullVariant = await variantRepo.findOne({
          // @ts-ignore
          where: { id: entity.id },
          relations: ["product"],
        });
        // @ts-ignore
        if (fullVariant?.product) {
          // @ts-ignore
          productId = fullVariant.product.id;
        } else {
          logger.error(
            "[ProductVariantSubscriber] Could not determine productId for variant",
            entity.id,
          );
          return;
        }
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
            product: { id: productId },
            variant: { id: entity.id },
            warehouse: { id: warehouse.id },
          },
        });

        if (!existing) {
          const stockItem = stockItemRepo.create({
            // @ts-ignore
            product: { id: productId },
            variant: entity,
            warehouse,
            quantity: 0,
            reorder_level: 0,
            low_stock_threshold: null,
          });
          await stockItemRepo.save(stockItem);
          logger.info(
            `[ProductVariantSubscriber] Created StockItem for variant ${entity.id} in warehouse ${warehouse.id}`,
          );
        }
      }
    } catch (err) {
      // @ts-ignore
      logger.error("[ProductVariantSubscriber] afterInsert error", err);
    }
  }

  /**
   * @param {any} entity
   */
  async beforeUpdate(entity) {
    try {
      // @ts-ignore
      logger.info("[ProductVariantSubscriber] beforeUpdate", {
        entity: JSON.parse(JSON.stringify(entity)),
      });
    } catch (err) {
      // @ts-ignore
      logger.error("[ProductVariantSubscriber] beforeUpdate error", err);
    }
  }

  // @ts-ignore
  async afterUpdate(event) {
    try {
      const { databaseEntity: oldEntity, entity: newEntity } = event;

      // Need to load full relations
      const productVariantRepo = AppDataSource.getRepository(ProductVariant);
      const oldProduct = await productVariantRepo.findOne({
        where: { id: oldEntity.id },
        relations: ["taxes"],
      });

      const newProduct = await productVariantRepo.findOne({
        where: { id: newEntity.id },
        relations: ["taxes"],
      });

      if (!oldProduct || !newProduct) return;

      // @ts-ignore
      const oldTaxIds = (oldProduct.taxes || []).map((t) => t.id).sort();
      // @ts-ignore
      const newTaxIds = (newProduct.taxes || []).map((t) => t.id).sort();

      if (JSON.stringify(oldTaxIds) !== JSON.stringify(newTaxIds)) {
        logger.info(
          `[ProductSubscriber] Taxes changed for product ${newEntity.id}`,
        );

        const transitionService = new TaxStateTransitionService(AppDataSource);
        await transitionService.onTaxesChanged(
          newProduct,
          // @ts-ignore
          oldProduct.taxes || [],
          // @ts-ignore
          newProduct.taxes || [],
          "system",
          { reason: "Product taxes updated via product edit" },
        );
      }
    } catch (err) {
      // @ts-ignore
      logger.error("[ProductSubscriber] afterUpdate error", err);
    }
  }

  /**
   * @param {any} entity
   */
  async beforeRemove(entity) {
    try {
      // @ts-ignore
      logger.info("[ProductVariantSubscriber] beforeRemove", {
        entity: JSON.parse(JSON.stringify(entity)),
      });
    } catch (err) {
      // @ts-ignore
      logger.error("[ProductVariantSubscriber] beforeRemove error", err);
    }
  }

  /**
   * @param {any} event
   */
  async afterRemove(event) {
    try {
      // @ts-ignore
      logger.info("[ProductVariantSubscriber] afterRemove", {
        event: JSON.parse(JSON.stringify(event)),
      });
    } catch (err) {
      // @ts-ignore
      logger.error("[ProductVariantSubscriber] afterRemove error", err);
    }
  }
}

module.exports = ProductVariantSubscriber;
