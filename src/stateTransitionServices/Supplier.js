// src/stateTransitionServices/Supplier.js
// @ts-check
const Supplier = require("../entities/Supplier");
// @ts-ignore
const auditLogger = require("../utils/auditLogger");
const { logger } = require("../utils/logger");
const emailSender = require("../channels/email.sender");
const smsSender = require("../channels/sms.sender");
const notificationService = require("../services/Notification");
const {
  companyName,
  enableSmsAlerts,
  // You'll need to create these settings in your system settings:
  // getNotifySupplierOnApproveWithEmail,
  // getNotifySupplierOnApproveWithSms,
  // getNotifySupplierOnRejectWithEmail,
  // getNotifySupplierOnRejectWithSms,
} = require("../utils/settings/system");

class SupplierStateTransitionService {
  /**
   * @param {import("typeorm").DataSource} dataSource
   */
  constructor(dataSource) {
    this.dataSource = dataSource;
    this.supplierRepo = dataSource.getRepository(Supplier);
  }

  /**
   * Called when a supplier is approved.
   * @param {Supplier} supplier
   * @param {string} user
   */
  // @ts-ignore
  async onApprove(supplier, user = "system") {
    // @ts-ignore
    logger.info(`[Transition] Approving supplier #${supplier.id}`);

    // @ts-ignore
    const hydrated = await this._hydrateSupplier(supplier.id);
    if (!hydrated) return;

    await this._notifySupplier(hydrated, "approved");
    // @ts-ignore
    logger.info(`[Transition] Supplier #${supplier.id} approved`);
  }

  /**
   * Called when a supplier is rejected.
   * @param {Supplier} supplier
   * @param {string} user
   */
  // @ts-ignore
  async onReject(supplier, user = "system") {
    // @ts-ignore
    logger.info(`[Transition] Rejecting supplier #${supplier.id}`);

    // @ts-ignore
    const hydrated = await this._hydrateSupplier(supplier.id);
    if (!hydrated) return;

    await this._notifySupplier(hydrated, "rejected");
    // @ts-ignore
    logger.info(`[Transition] Supplier #${supplier.id} rejected`);
  }

  // --- Private helpers ---

  /**
   * Hydrate supplier (if you need relations later, e.g., purchases)
   * @param {number} supplierId
   * @returns {Promise<Supplier|null>}
   */
  async _hydrateSupplier(supplierId) {
    const supplier = await this.supplierRepo.findOne({
      where: { id: supplierId, is_deleted: false },
      // relations: ["purchases"], // if needed
    });
    if (!supplier) {
      logger.error(`[Transition] Supplier #${supplierId} not found`);
      return null;
    }
    // @ts-ignore
    return supplier;
  }

  /**
   * Send email/SMS notification to the supplier about status change.
   * @param {Supplier} supplier
   * @param {string} action - "approved" or "rejected"
   */
  async _notifySupplier(supplier, action) {
    const company = await companyName();

    // Determine which notification settings to use
    // Uncomment and implement these settings as needed:
    // const notifyEmail = action === "approved"
    //   ? await getNotifySupplierOnApproveWithEmail()
    //   : await getNotifySupplierOnRejectWithEmail();
    // const notifySms = action === "approved"
    //   ? await getNotifySupplierOnApproveWithSms()
    //   : await getNotifySupplierOnRejectWithSms();

    // For now, we'll send email if the supplier has an email address (can be controlled later)
    const notifyEmail = true; // placeholder
    const notifySms = false; // placeholder

    // @ts-ignore
    const subject = `Supplier ${action.charAt(0).toUpperCase() + action.slice(1)} – ${supplier.name}`;
    // @ts-ignore
    const textBody = `Dear ${supplier.name},\n\nYour supplier account has been ${action}.\n\nThank you,\n${company}`;
    const htmlBody = textBody.replace(/\n/g, "<br>");

    // Send email if enabled and email exists
    // @ts-ignore
    if (notifyEmail && supplier.email) {
      try {
        await emailSender.send(
          // @ts-ignore
          supplier.email,
          subject,
          htmlBody,
          textBody,
          {},
          true,
        );
        // @ts-ignore
        logger.info(`[Supplier] ${action} email sent to ${supplier.email}`);
      } catch (error) {
        logger.error(
          // @ts-ignore
          `[Supplier] Failed to send ${action} email to ${supplier.email}`,
          // @ts-ignore
          error,
        );
      }
    }

    // Send SMS if enabled and phone exists
    if (notifySms) {
      const smsEnabled = await enableSmsAlerts();
      // @ts-ignore
      if (smsEnabled && supplier.phone) {
        try {
          const smsMessage = `Your supplier account has been ${action}. Check your email for details.`;
          // @ts-ignore
          await smsSender.send(supplier.phone, smsMessage);
        } catch (error) {
          // @ts-ignore
          logger.error(`[Supplier] SMS failed for ${supplier.phone}`, error);
        }
      }
    }

    // Create in-app notification for admin
    try {
      await notificationService.create(
        {
          userId: 1, // admin user ID (could be configurable)
          title: `Supplier ${action}`,
          // @ts-ignore
          message: `Supplier "${supplier.name}" has been ${action}.`,
          type: action === "rejected" ? "warning" : "info",
          // @ts-ignore
          metadata: { supplierId: supplier.id, status: action },
        },
        "system",
      );
    } catch (err) {
      logger.error(
        // @ts-ignore
        `Failed to create in-app notification for supplier #${supplier.id}`,
        // @ts-ignore
        err,
      );
    }
  }
}

module.exports = { SupplierStateTransitionService };
