// src/subscribers/TaxSubscriber.js
// @ts-check
const Tax = require("../entities/Tax");
const { AppDataSource } = require("../main/db/datasource");
const { logger } = require("../utils/logger");
const Product = require("../entities/Product");
const ProductVariant = require("../entities/ProductVariant");
const { TaxStateTransitionService } = require("../stateTransitionServices/Tax");

class TaxSubscriber {
  listenTo() {
    return Tax;
  }

  // @ts-ignore
  async afterUpdate(event) {
    try {
      const { databaseEntity: oldEntity, entity: newEntity } = event;

      const transitionService = new TaxStateTransitionService(AppDataSource);

      // Check what changed and call appropriate event methods
      if (oldEntity.rate !== newEntity.rate) {
        await transitionService.onTaxRateChanged(
          newEntity,
          oldEntity.rate,
          newEntity.rate,
          "system"
        );
      }

      if (oldEntity.type !== newEntity.type) {
        await transitionService.onTaxTypeChanged(
          newEntity,
          oldEntity.type,
          newEntity.type,
          "system"
        );
      }

      if (oldEntity.is_enabled !== newEntity.is_enabled) {
        await transitionService.onTaxStatusChanged(
          newEntity,
          oldEntity.is_enabled,
          newEntity.is_enabled,
          "system"
        );
      }

      if (oldEntity.is_deleted === false && newEntity.is_deleted === true) {
        await transitionService.onTaxDeleted(newEntity, "system");
      }

    } catch (err) {
      // @ts-ignore
      logger.error('[TaxSubscriber] afterUpdate error', err);
    }
  }

  // @ts-ignore
  async beforeRemove(event) {
    try {
      const entity = event.entity;
      const productRepo = AppDataSource.getRepository(Product);
      const variantRepo = AppDataSource.getRepository(ProductVariant);

      // @ts-ignore
      const products = await productRepo.count({ where: { taxes: { id: entity.id } } });
      // @ts-ignore
      const variants = await variantRepo.count({ where: { taxes: { id: entity.id } } });

      if (products > 0 || variants > 0) {
        throw new Error(
          `Cannot delete tax ${entity.id} because it is used by ${products} products and ${variants} variants. Soft delete instead.`
        );
      }
    } catch (err) {
      // @ts-ignore
      logger.error('[TaxSubscriber] beforeRemove error', err);
      throw err;
    }
  }
}

module.exports = TaxSubscriber;