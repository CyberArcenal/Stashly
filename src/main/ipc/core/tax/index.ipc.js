// src/main/ipc/tax/index.ipc.js
//@ts-check
const { ipcMain } = require("electron");
const { AppDataSource } = require("../../../db/datasource");
const { withErrorHandling } = require("../../../../middlewares/errorHandler");
const { logger } = require("../../../../utils/logger");
const { AuditLog } = require("../../../../entities/AuditLog");

class TaxHandler {
  constructor() {
    this.initializeHandlers();
  }

  initializeHandlers() {
    // 📋 READ OPERATIONS
    this.getAllTaxes = this.importHandler("./get/all.ipc");
    this.getTaxById = this.importHandler("./get/by_id.ipc");

    // ✏️ WRITE OPERATIONS
    this.createTax = this.importHandler("./create.ipc");
    this.updateTax = this.importHandler("./update.ipc");
    this.deleteTax = this.importHandler("./delete.ipc");
  }

  // @ts-ignore
  importHandler(path) {
    try {
      const fullPath = require.resolve(`./${path}`, { paths: [__dirname] });
      return require(fullPath);
    } catch (error) {
      console.warn(
        `[TaxHandler] Failed to load handler: ${path}`,
        // @ts-ignore
        error.message,
      );
      return async () => ({
        status: false,
        message: `Handler not implemented: ${path}`,
        data: null,
      });
    }
  }

  // @ts-ignore
  async handleRequest(event, payload) {
    try {
      const method = payload.method;
      const params = payload.params || {};

      const enrichedParams = { ...params };

      if (logger) {
        // @ts-ignore
        logger.info(`TaxHandler: ${method}`, { params });
      }

      switch (method) {
        // READ
        case "getAllTaxes":
          return await this.getAllTaxes(enrichedParams);
        case "getTaxById":
          return await this.getTaxById(enrichedParams);

        // WRITE (with transaction)
        case "createTax":
          return await this.handleWithTransaction(
            this.createTax,
            enrichedParams,
          );
        case "updateTax":
          return await this.handleWithTransaction(
            this.updateTax,
            enrichedParams,
          );
        case "deleteTax":
          return await this.handleWithTransaction(
            this.deleteTax,
            enrichedParams,
          );

        default:
          return {
            status: false,
            message: `Unknown method: ${method}`,
            data: null,
          };
      }
    } catch (error) {
      console.error("TaxHandler error:", error);
      // @ts-ignore
      if (logger) logger.error("TaxHandler error:", error);
      return {
        status: false,
        // @ts-ignore
        message: error.message || "Internal server error",
        data: null,
      };
    }
  }

  // @ts-ignore
  async handleWithTransaction(handler, params) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await handler(params, queryRunner);
      if (result.status) {
        await queryRunner.commitTransaction();
      } else {
        await queryRunner.rollbackTransaction();
      }
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // @ts-ignore
  async logActivity(user_id, action, description, qr = null) {
    const { saveDb } = require("../../../../utils/dbUtils/dbActions");
    try {
      let activityRepo;
      if (qr) {
        // @ts-ignore
        activityRepo = qr.manager.getRepository(AuditLog);
      } else {
        activityRepo = AppDataSource.getRepository(AuditLog);
      }
      const activity = activityRepo.create({
        user: user_id,
        action,
        description,
        entity: "Tax",
        timestamp: new Date(),
      });
      await saveDb(activityRepo, activity);
    } catch (error) {
      console.warn("Failed to log tax activity:", error);
      // @ts-ignore
      if (logger) logger.warn("Failed to log tax activity:", error);
    }
  }
}

const taxHandler = new TaxHandler();

ipcMain.handle(
  "tax",
  withErrorHandling(
    taxHandler.handleRequest.bind(taxHandler),
    "IPC:tax",
  ),
);

module.exports = { TaxHandler, taxHandler };