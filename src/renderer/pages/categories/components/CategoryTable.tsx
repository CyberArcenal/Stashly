// src/renderer/pages/categories/components/CategoryTable.tsx
import React from "react";
import { Edit, Eye, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import type { CategoryWithDetails } from "../hooks/useCategories";

interface CategoryTableProps {
  categories: CategoryWithDetails[];
  selectedCategories: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onSort: (key: string) => void;
  sortConfig: { key: string; direction: "asc" | "desc" };
  onView: (category: CategoryWithDetails) => void;
  onEdit: (category: CategoryWithDetails) => void;
  onDelete: (category: CategoryWithDetails) => void;
}

const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  selectedCategories,
  onToggleSelect,
  onToggleSelectAll,
  onSort,
  sortConfig,
  onView,
  onEdit,
  onDelete,
}) => {
  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="icon-sm" />
    ) : (
      <ChevronDown className="icon-sm" />
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive
      ? "bg-[var(--accent-green-dark)] text-[var(--accent-green)]"
      : "bg-[var(--accent-red-dark)] text-[var(--accent-red)]";
  };

  return (
    <div
      className="overflow-x-auto rounded-md border compact-table"
      style={{ borderColor: "var(--border-color)" }}
    >
      <table className="min-w-full" style={{ borderColor: "var(--border-color)" }}>
        <thead style={{ backgroundColor: "var(--card-secondary-bg)" }}>
          <tr>
            <th
              scope="col"
              className="w-10 px-2 py-2 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: "var(--text-secondary)" }}
            >
              <input
                type="checkbox"
                checked={categories.length > 0 && selectedCategories.length === categories.length}
                onChange={onToggleSelectAll}
                className="h-3 w-3 rounded border-gray-300"
                style={{ color: "var(--accent-blue)" }}
              />
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors"
              onClick={() => onSort("name")}
            >
              <div className="flex items-center gap-xs">
                <span>Name</span>
                {getSortIcon("name")}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors"
              onClick={() => onSort("slug")}
            >
              <div className="flex items-center gap-xs">
                <span>Slug</span>
                {getSortIcon("slug")}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors"
              onClick={() => onSort("description")}
            >
              <div className="flex items-center gap-xs">
                <span>Description</span>
                {getSortIcon("description")}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors"
              onClick={() => onSort("is_active")}
            >
              <div className="flex items-center gap-xs">
                <span>Status</span>
                {getSortIcon("is_active")}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider"
              style={{ color: "var(--text-secondary)" }}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody style={{ backgroundColor: "var(--card-bg)" }}>
          {categories.map((category) => (
            <tr
              key={category.id}
              className={`hover:bg-[var(--card-secondary-bg)] transition-colors ${
                selectedCategories.includes(category.id) ? "bg-[var(--accent-blue-dark)]" : ""
              }`}
              style={{ borderBottom: "1px solid var(--border-color)" }}
            >
              <td className="px-2 py-2 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => onToggleSelect(category.id)}
                  className="h-3 w-3 rounded border-gray-300"
                  style={{ color: "var(--accent-blue)" }}
                />
              </td>
              <td
                className="px-4 py-2 whitespace-nowrap text-sm font-medium"
                style={{ color: "var(--sidebar-text)" }}
              >
                {category.name}
              </td>
              <td
                className="px-4 py-2 whitespace-nowrap text-sm font-mono"
                style={{ color: "var(--text-secondary)" }}
              >
                {category.slug}
              </td>
              <td
                className="px-4 py-2 whitespace-nowrap text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {category.description || "-"}
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-xs py-xs rounded-full text-xs font-medium ${getStatusBadge(
                    category.is_active
                  )}`}
                >
                  {category.is_active ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-xs">
                  <button
                    onClick={() => onView(category)}
                    className="transition-colors p-1 rounded"
                    style={{ color: "var(--accent-blue)" }}
                    title="View"
                  >
                    <Eye className="icon-sm" />
                  </button>
                  <button
                    onClick={() => onEdit(category)}
                    className="transition-colors p-1 rounded"
                    style={{ color: "var(--accent-blue)" }}
                    title="Edit"
                  >
                    <Edit className="icon-sm" />
                  </button>
                  <button
                    onClick={() => onDelete(category)}
                    className="transition-colors p-1 rounded"
                    style={{ color: "var(--accent-red)" }}
                    title="Delete"
                  >
                    <Trash2 className="icon-sm" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryTable;