// src/renderer/api/productTaxChange.ts
export interface ProductTaxChange {
  id: number;
  productId: number | null;
  variantId: number | null;
  old_tax_ids: number[] | null;       // array of tax IDs bago ang pagbabago
  new_tax_ids: number[] | null;       // array of tax IDs pagkatapos ng pagbabago
  old_gross_price: number | null;
  new_gross_price: number | null;
  changed_by: string;
  changed_at: string;                  // ISO date
  reason: string | null;
  // relations (opsyonal, depende kung isasama sa query)
  product?: { id: number; name: string; sku: string };
  variant?: { id: number; name: string; sku: string };
  old_taxes?: Array<{ id: number; name: string; rate: number; type: string }>;
  new_taxes?: Array<{ id: number; name: string; rate: number; type: string }>;
}

export interface ProductTaxChangesResponse {
  status: boolean;
  message: string;
  data: ProductTaxChange[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductTaxChangeResponse {
  status: boolean;
  message: string;
  data: ProductTaxChange;
}

class ProductTaxChangeAPI {
  private async call<T = any>(method: string, params: Record<string, any> = {}): Promise<T> {
    if (!window.backendAPI?.productTaxChange) {
      throw new Error("Electron API (productTaxChange) not available");
    }
    return window.backendAPI.productTaxChange({ method, params });
  }

  async getAll(params?: {
    productId?: number;
    variantId?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    search?: string; // pang‑filter sa reason o product name
  }): Promise<ProductTaxChangesResponse> {
    try {
      const response = await this.call<ProductTaxChangesResponse>('getAllProductTaxChanges', params);
      if (response.status) return response;
      throw new Error(response.message || 'Failed to fetch product tax changes');
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch product tax changes');
    }
  }

  async getById(id: number): Promise<ProductTaxChangeResponse> {
    try {
      const response = await this.call<ProductTaxChangeResponse>('getProductTaxChangeById', { id });
      if (response.status) return response;
      throw new Error(response.message || 'Failed to fetch product tax change');
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch product tax change');
    }
  }

  async isAvailable(): Promise<boolean> {
    return !!window.backendAPI?.productTaxChange;
  }
}

const productTaxChangeAPI = new ProductTaxChangeAPI();
export default productTaxChangeAPI;