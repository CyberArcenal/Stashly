// src/utils/cacheUtils.ts
export class SystemCache {
  private readonly CACHE_KEYS = {
    SYSTEM_INFO: "system_info_cache",
    PUBLIC_SETTINGS: "public_settings_cache",
    CACHE_TIMESTAMP: "system_cache_timestamp",
  };

  // Save system info to localStorage
  saveSystemInfo(data: any): void {
    try {
      localStorage.setItem(this.CACHE_KEYS.SYSTEM_INFO, JSON.stringify(data));
      localStorage.setItem(
        this.CACHE_KEYS.CACHE_TIMESTAMP,
        new Date().toISOString()
      );
    } catch (error) {
      console.error("Failed to cache system info:", error);
    }
  }

  // Get cached system info
  getSystemInfo(): any {
    try {
      const cached = localStorage.getItem(this.CACHE_KEYS.SYSTEM_INFO);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("Failed to retrieve cached system info:", error);
      return null;
    }
  }

  // Get cached public settings
  getPublicSettings(): any {
    try {
      const cached = localStorage.getItem(this.CACHE_KEYS.PUBLIC_SETTINGS);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("Failed to retrieve cached public settings:", error);
      return null;
    }
  }

  // Get currency from cache
  getCurrency(): string {
    try {
      // Try to get from system info first
      const systemInfo = this.getSystemInfo();
      if (systemInfo?.system_info?.currency) {
        return systemInfo.system_info.currency;
      }

      // Try to get from public settings
      const publicSettings = this.getPublicSettings();
      if (publicSettings?.system?.currency) {
        return publicSettings.system.currency;
      }

      // Fallback to PHP
      return "PHP";
    } catch (error) {
      console.error("Failed to get currency from cache:", error);
      return "PHP";
    }
  }

  /**
   * Update the currency in both system info and public settings caches.
   * Call this method whenever the currency setting changes (e.g., after saving settings).
   */
  setCurrency(currency: string): void {
    try {
      // Update system info cache
      const systemInfo = this.getSystemInfo();
      if (systemInfo) {
        if (!systemInfo.system_info) systemInfo.system_info = {};
        systemInfo.system_info.currency = currency;
        localStorage.setItem(this.CACHE_KEYS.SYSTEM_INFO, JSON.stringify(systemInfo));
      }

      // Update public settings cache
      const publicSettings = this.getPublicSettings();
      if (publicSettings) {
        if (!publicSettings.system) publicSettings.system = {};
        publicSettings.system.currency = currency;
        localStorage.setItem(this.CACHE_KEYS.PUBLIC_SETTINGS, JSON.stringify(publicSettings));
      }

      // Update timestamp to indicate change (optional)
      localStorage.setItem(this.CACHE_KEYS.CACHE_TIMESTAMP, new Date().toISOString());
    } catch (error) {
      console.error("Failed to set currency in cache:", error);
    }
  }

  // Check if cache is still valid (e.g., less than 1 hour old)
  isCacheValid(): boolean {
    try {
      const timestamp = localStorage.getItem(this.CACHE_KEYS.CACHE_TIMESTAMP);
      if (!timestamp) return false;

      const cacheTime = new Date(timestamp).getTime();
      const currentTime = new Date().getTime();
      const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

      return currentTime - cacheTime < oneHour;
    } catch (error) {
      return false;
    }
  }

  // Clear all cached system data
  clearCache(): void {
    try {
      localStorage.removeItem(this.CACHE_KEYS.SYSTEM_INFO);
      localStorage.removeItem(this.CACHE_KEYS.PUBLIC_SETTINGS);
      localStorage.removeItem(this.CACHE_KEYS.CACHE_TIMESTAMP);
    } catch (error) {
      console.error("Failed to clear system cache:", error);
    }
  }
}

export const systemCache = new SystemCache();