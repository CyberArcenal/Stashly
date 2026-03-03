// src/subscribers/SupplierSubscriber.js
// @ts-check
const Supplier = require("../entities/Supplier");
const { AppDataSource } = require("../main/db/datasource");
const { SupplierStateTransitionService } = require("../stateTransitionServices/Supplier");
const { logger } = require("../utils/logger");

console.log("[Subscriber] Loading SupplierSubscriber");

class SupplierSubscriber {
  constructor(){
    this.transitionService = new SupplierStateTransitionService(AppDataSource);
  }
  listenTo() {
    return Supplier;
  }

  /**
   * @param {any} entity
   */
  async beforeInsert(entity) {
    try {
      // @ts-ignore
      logger.info("[SupplierSubscriber] beforeInsert", {
        entity: JSON.parse(JSON.stringify(entity)),
      });
    } catch (err) {
      // @ts-ignore
      logger.error("[SupplierSubscriber] beforeInsert error", err);
    }
  }

  /**
   * @param {any} entity
   */
  async afterInsert(entity) {
    try {
      // @ts-ignore
      logger.info("[SupplierSubscriber] afterInsert", {
        entity: JSON.parse(JSON.stringify(entity)),
      });
    } catch (err) {
      // @ts-ignore
      logger.error("[SupplierSubscriber] afterInsert error", err);
    }
  }

  /**
   * @param {any} entity
   */
  async beforeUpdate(entity) {
    try {
      // @ts-ignore
      logger.info("[SupplierSubscriber] beforeUpdate", {
        entity: JSON.parse(JSON.stringify(entity)),
      });
    } catch (err) {
      // @ts-ignore
      logger.error("[SupplierSubscriber] beforeUpdate error", err);
    }
  }

 /**
   * @param {{ databaseEntity?: any; entity: any }} event
   */
  async afterUpdate(event) {
    if (!event.entity) return;

    const oldSupplier = event.databaseEntity;
    const newSupplier = event.entity;

    // Only trigger if status changed
    if (oldSupplier && oldSupplier.status === newSupplier.status) {
      return;
    }

    // @ts-ignore
    logger.info("[SupplierSubscriber] afterUpdate - status changed", {
      old: oldSupplier?.status,
      new: newSupplier.status,
    });

    switch (newSupplier.status) {
      case "approved":
        await this.transitionService.onApprove(newSupplier, "system");
        break;
      case "rejected":
        await this.transitionService.onReject(newSupplier, "system");
        break;
      default:
        // pending or other statuses – no action
        break;
    }
  }

  /**
   * @param {any} entity
   */
  async beforeRemove(entity) {
    try {
      // @ts-ignore
      logger.info("[SupplierSubscriber] beforeRemove", {
        entity: JSON.parse(JSON.stringify(entity)),
      });
    } catch (err) {
      // @ts-ignore
      logger.error("[SupplierSubscriber] beforeRemove error", err);
    }
  }

  /**
   * @param {any} event
   */
  async afterRemove(event) {
    try {
      // @ts-ignore
      logger.info("[SupplierSubscriber] afterRemove", {
        event: JSON.parse(JSON.stringify(event)),
      });
    } catch (err) {
      // @ts-ignore
      logger.error("[SupplierSubscriber] afterRemove error", err);
    }
  }
}

module.exports = SupplierSubscriber;
