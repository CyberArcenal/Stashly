// src/renderer/pages/customers/components/CustomerViewDialog.tsx
import React, { useEffect } from "react";
import Modal from "../../../components/UI/Modal";
import Button from "../../../components/UI/Button";
import {
  User,
  Mail,
  Phone,
  Award,
  Calendar,
  ShoppingCart,
  FileText,
  Edit,
} from "lucide-react";
import { formatDate, formatCurrency, formatCompactNumber } from "../../../utils/formatters";
import { useCustomerView } from "../hooks/useCustomerView";

interface CustomerViewDialogProps {
  hook: ReturnType<typeof useCustomerView>;
}

const CustomerViewDialog: React.FC<CustomerViewDialogProps> = ({ hook }) => {
  const {
    isOpen,
    loading,
    customer,
    orders,
    loyaltyTransactions,
    loadingOrders,
    loadingLoyalty,
    fetchOrders,
    fetchLoyalty,
    close,
  } = hook;

  const [activeTab, setActiveTab] = React.useState<"overview" | "orders" | "loyalty">("overview");

  // Trigger fetches when tab changes
  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    } else if (activeTab === "loyalty") {
      fetchLoyalty();
    }
  }, [activeTab, fetchOrders, fetchLoyalty]);

  if (!isOpen) return null;

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string }> = {
      regular: { bg: "bg-blue-100", text: "text-blue-700" },
      vip: { bg: "bg-yellow-100", text: "text-yellow-700" },
      elite: { bg: "bg-purple-100", text: "text-purple-700" },
    };
    const config = statusMap[status] || { bg: "bg-gray-100", text: "text-gray-700" };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getLoyaltyTypeColor = (type: string) => {
    switch (type) {
      case "earn":
        return "text-green-600 bg-green-100";
      case "redeem":
        return "text-blue-600 bg-blue-100";
      case "refund":
        return "text-purple-600 bg-purple-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={close} title="Customer Details" size="xl">
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-blue)]"></div>
        </div>
      ) : customer ? (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[var(--card-secondary-bg)] rounded-md flex items-center justify-center">
                <User className="w-6 h-6 text-[var(--text-tertiary)]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--sidebar-text)]">{customer.name}</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  ID: {customer.id} • Joined {formatDate(customer.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <div>{getStatusBadge(customer.status)}</div>
              {/* Edit button could be added here */}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-[var(--border-color)]">
            <nav className="flex gap-4">
              {(["overview", "orders", "loyalty"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? "border-[var(--accent-blue)] text-[var(--accent-blue)]"
                      : "border-transparent text-[var(--text-secondary)] hover:text-[var(--sidebar-text)]"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === "orders" && orders?.length > 0 && (
                    <span className="ml-2 text-xs bg-[var(--accent-blue)] text-white rounded-full px-1.5 py-0.5">
                      {orders.length}
                    </span>
                  )}
                  {tab === "loyalty" && loyaltyTransactions?.length > 0 && (
                    <span className="ml-2 text-xs bg-[var(--accent-blue)] text-white rounded-full px-1.5 py-0.5">
                      {loyaltyTransactions.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="mt-4">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left column: Contact info */}
                <div className="space-y-4">
                  <div className="bg-[var(--card-secondary-bg)] p-3 rounded-md">
                    <h4 className="font-medium mb-2 flex items-center text-[var(--sidebar-text)]">
                      <User className="w-4 h-4 mr-1" /> Contact Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[var(--text-secondary)]" />
                        <span className="text-[var(--text-secondary)]">Email:</span>
                        <span className="font-medium text-[var(--sidebar-text)]">{customer.email || "-"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[var(--text-secondary)]" />
                        <span className="text-[var(--text-secondary)]">Phone:</span>
                        <span className="font-medium text-[var(--sidebar-text)]">{customer.phone || "-"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[var(--text-secondary)]" />
                        <span className="text-[var(--text-secondary)]">Contact Info:</span>
                        <span className="font-medium text-[var(--sidebar-text)]">{customer.contactInfo || "-"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[var(--card-secondary-bg)] p-3 rounded-md">
                    <h4 className="font-medium mb-2 flex items-center text-[var(--sidebar-text)]">
                      <Calendar className="w-4 h-4 mr-1" /> Timeline
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Joined:</span>
                        <span className="font-medium text-[var(--sidebar-text)]">{formatDate(customer.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Last Updated:</span>
                        <span className="font-medium text-[var(--sidebar-text)]">
                          {customer.updatedAt ? formatDate(customer.updatedAt) : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column: Loyalty summary */}
                <div className="space-y-4">
                  <div className="bg-[var(--card-secondary-bg)] p-3 rounded-md">
                    <h4 className="font-medium mb-2 flex items-center text-[var(--sidebar-text)]">
                      <Award className="w-4 h-4 mr-1" /> Loyalty Summary
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-[var(--text-secondary)]">Current Balance:</span>
                        <div className="font-medium text-[var(--sidebar-text)]">
                          {formatCompactNumber(customer.loyaltyPointsBalance)} pts
                        </div>
                      </div>
                      <div>
                        <span className="text-[var(--text-secondary)]">Lifetime Earned:</span>
                        <div className="font-medium text-[var(--sidebar-text)]">
                          {formatCompactNumber(customer.lifetimePointsEarned)} pts
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Orders Summary */}
                  <div className="bg-[var(--card-secondary-bg)] p-3 rounded-md">
                    <h4 className="font-medium mb-2 flex items-center text-[var(--sidebar-text)]">
                      <ShoppingCart className="w-4 h-4 mr-1" /> Orders Summary
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Total Orders:</span>
                        <span className="font-medium text-[var(--sidebar-text)]">{orders?.length}</span>
                      </div>
                      {orders?.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-[var(--text-secondary)]">Total Spent:</span>
                          <span className="font-medium text-[var(--sidebar-text)]">
                            {formatCurrency(orders.reduce((sum, o) => sum + o.total, 0))}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div>
                <h4 className="font-medium mb-2 text-[var(--sidebar-text)]">Order History</h4>
                {loadingOrders ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--accent-blue)]"></div>
                  </div>
                ) : orders?.length === 0 ? (
                  <p className="text-center py-4 text-[var(--text-secondary)]">No orders found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[var(--border-color)]">
                      <thead className="bg-[var(--card-secondary-bg)]">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">
                            Order #
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">
                            Date
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">
                            Status
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-[var(--card-bg)] divide-y divide-[var(--border-color)]">
                        {orders?.map((order) => (
                          <tr key={order.id}>
                            <td className="px-4 py-2 text-sm text-[var(--sidebar-text)]">{order.order_number}</td>
                            <td className="px-4 py-2 text-sm text-[var(--sidebar-text)]">{formatDate(order.created_at)}</td>
                            <td className="px-4 py-2 text-sm">
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs ${
                                  order.status === "completed"
                                    ? "bg-green-100 text-green-700"
                                    : order.status === "cancelled"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {order.status}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm font-medium text-[var(--accent-green)]">
                              {formatCurrency(order.total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "loyalty" && (
              <div>
                <h4 className="font-medium mb-2 text-[var(--sidebar-text)]">Loyalty Transactions</h4>
                {loadingLoyalty ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--accent-blue)]"></div>
                  </div>
                ) : loyaltyTransactions?.length === 0 ? (
                  <p className="text-center py-4 text-[var(--text-secondary)]">No loyalty transactions found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[var(--border-color)]">
                      <thead className="bg-[var(--card-secondary-bg)]">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">
                            Type
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">
                            Points
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">
                            Date
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">
                            Order
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">
                            Notes
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-[var(--card-bg)] divide-y divide-[var(--border-color)]">
                        {loyaltyTransactions?.map((tx) => (
                          <tr key={tx.id}>
                            <td className="px-4 py-2 text-sm">
                              <span className={`px-2 py-0.5 rounded-full text-xs ${getLoyaltyTypeColor(tx.transactionType)}`}>
                                {tx.transactionType}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm text-[var(--sidebar-text)]">
                              <span className={tx.transactionType === "earn" ? "text-green-600" : "text-red-600"}>
                                {tx.transactionType === "earn" ? "+" : "-"}
                                {Math.abs(tx.pointsChange)}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm text-[var(--sidebar-text)]">{formatDate(tx.timestamp)}</td>
                            <td className="px-4 py-2 text-sm text-[var(--sidebar-text)]">
                              {tx.order?.order_number || "-"}
                            </td>
                            <td className="px-4 py-2 text-sm text-[var(--sidebar-text)]">{tx.notes || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-center py-4 text-[var(--text-secondary)]">Customer not found.</p>
      )}
    </Modal>
  );
};

export default CustomerViewDialog;