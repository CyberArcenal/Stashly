// src/main/ipc/productTaxChange/index.ipc.js
const { ipcMain } = require("electron");
const { withErrorHandling } = require("../../../../middlewares/errorHandler");
const { logger } = require("../../../../utils/logger");
const { AppDataSource } = require("../../../db/datasource");

class ProductTaxChangeHandler {
  constructor() {
    this.initializeHandlers();
  }

  initializeHandlers() {
    this.create = this.importHandler("./create.ipc");
    this.getAll = this.importHandler("./getAll.ipc");        // ← bago
    this.getByProduct = this.importHandler("./getByProduct.ipc");
    this.getById = this.importHandler("./getById.ipc");
    this.delete = this.importHandler("./delete.ipc");
  }

  importHandler(path) {
    try {
      return require(path);
    } catch (error) {
      console.warn(`[ProductTaxChangeHandler] Failed to load handler: ${path}`, error.message);
      return async () => ({ status: false, message: `Handler not implemented: ${path}`, data: null });
    }
  }

  async handleRequest(event, payload) {
    try {
      const method = payload.method;
      const params = payload.params || {};
      if (logger) logger.info(`ProductTaxChangeHandler: ${method}`, { params });

      switch (method) {
        case "createProductTaxChange":
          return await this.handleWithTransaction(this.create, params);
        case "getAllProductTaxChanges":          // ← bago
          return await this.getAll(params);
        case "getProductTaxChangesByProduct":
          return await this.getByProduct(params);
        case "getProductTaxChangeById":
          return await this.getById(params);
        case "deleteProductTaxChange":
          return await this.handleWithTransaction(this.delete, params);
        default:
          return { status: false, message: `Unknown method: ${method}`, data: null };
      }
    } catch (error) {
      console.error("ProductTaxChangeHandler error:", error);
      if (logger) logger.error("ProductTaxChangeHandler error:", error);
      return { status: false, message: error.message || "Internal server error", data: null };
    }
  }

  async handleWithTransaction(handler, params) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const result = await handler(params, queryRunner);
      if (result.status) await queryRunner.commitTransaction();
      else await queryRunner.rollbackTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

const handler = new ProductTaxChangeHandler();
ipcMain.handle("productTaxChange", withErrorHandling(handler.handleRequest.bind(handler), "IPC:productTaxChange"));
module.exports = { ProductTaxChangeHandler, handler };